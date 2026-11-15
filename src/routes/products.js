import { Router } from 'express';
import { z } from 'zod';
import { pool, redis } from '../db.js';
import { config } from '../config.js';
import { asyncHandler, invalidateProductCache } from '../utils.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
const productSchema = z.object({ sku: z.string().trim().min(2).max(50), name: z.string().trim().min(2).max(200), category: z.string().trim().min(2).max(80), price: z.number().nonnegative(), description: z.string().max(5000).optional().default(''), image_url: z.string().max(1000).optional().default(''), stock_quantity: z.number().int().nonnegative().optional().default(0), material: z.string().max(200).optional().default(''), design_style: z.string().max(80).optional().default('') });

router.get('/', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const category = String(req.query.category || '').trim().slice(0, 80);
  const sort = ['price_asc','price_desc','name'].includes(req.query.sort) ? req.query.sort : 'newest';
  const cacheKey = `products:${JSON.stringify({ q, category, sort })}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ source: 'redis-cache', products: JSON.parse(cached) });
  const orderBy = sort === 'price_asc' ? 'price ASC' : sort === 'price_desc' ? 'price DESC' : sort === 'name' ? 'name ASC' : 'created_at DESC';
  const clauses = ['is_active = 1']; const params = [];
  if (q) { clauses.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (category) { clauses.push('category = ?'); params.push(category); }
  const [products] = await pool.execute(`SELECT id, sku, name, category, price, description, image_url, stock_quantity, material, design_style, created_at FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy} LIMIT 200`, params);
  await redis.set(cacheKey, JSON.stringify(products), { EX: config.cacheTtl });
  res.json({ source: 'mysql', products });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, sku, name, category, price, description, image_url, stock_quantity, material, design_style FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product: rows[0] });
}));
router.post('/', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid product fields.', details: parsed.error.flatten() });
  const p = parsed.data;
  const [result] = await pool.execute('INSERT INTO products (sku,name,category,price,description,image_url,stock_quantity,material,design_style) VALUES (?,?,?,?,?,?,?,?,?)', [p.sku,p.name,p.category,p.price,p.description,p.image_url,p.stock_quantity,p.material,p.design_style]);
  await invalidateProductCache();
  res.status(201).json({ id: result.insertId, message: 'Product created.' });
}));
router.patch('/:id/stock', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const quantity = Number(req.body.stock_quantity);
  if (!Number.isInteger(quantity) || quantity < 0) return res.status(400).json({ error: 'stock_quantity must be a non-negative integer.' });
  const [result] = await pool.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [quantity, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Product not found.' });
  await invalidateProductCache();
  res.json({ message: 'Stock updated.' });
}));
export default router;
