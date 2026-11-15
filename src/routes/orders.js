import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { redis } from '../db.js';
import { asyncHandler } from '../utils.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
const orderSchema = z.object({ items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).min(1).max(50), shipping: z.object({ fullName: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(25), addressLine: z.string().trim().min(5).max(255), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), pincode: z.string().trim().min(4).max(12) }), paymentMethod: z.enum(['UPI','Card','Net Banking','COD']).default('COD'), discountPercent: z.number().min(0).max(100).default(0) });

router.post('/', asyncHandler(async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid order request.', details: parsed.error.flatten() });
  const { items, shipping, paymentMethod, discountPercent } = parsed.data;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const ids = [...new Set(items.map(i => i.productId))];
    const placeholders = ids.map(() => '?').join(',');
    const [products] = await connection.query(`SELECT id, name, price, stock_quantity FROM products WHERE id IN (${placeholders}) AND is_active = 1 FOR UPDATE`, ids);
    const byId = new Map(products.map(p => [p.id, p]));
    const aggregated = new Map();
    for (const item of items) aggregated.set(item.productId, (aggregated.get(item.productId) || 0) + item.quantity);
    for (const [id, quantity] of aggregated) {
      const product = byId.get(id);
      if (!product) throw Object.assign(new Error(`Product ${id} is unavailable.`), { status: 400 });
      if (product.stock_quantity < quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}.`), { status: 409 });
    }
    const subtotal = [...aggregated].reduce((sum, [productId, quantity]) => {
      return sum + Number(byId.get(productId).price) * quantity;
    }, 0);

    const discountAmount = Math.round(subtotal * discountPercent / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const shippingAmount = discountedSubtotal > 999 ? 0 : 99;
    const total = discountedSubtotal + shippingAmount;
    const orderNumber = `PD-${Date.now()}-${req.user.id}`;
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
      (order_number, user_id, status, subtotal, discount_amount, shipping_amount,
      total_amount, payment_method, shipping_name, shipping_phone,
      shipping_address, shipping_city, shipping_state, shipping_pincode)
      VALUES (?, ?, 'Order Placed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        req.user.id,
        subtotal,
        discountAmount,
        shippingAmount,
        total,
        paymentMethod,
        shipping.fullName,
        shipping.phone,
        shipping.addressLine,
        shipping.city,
        shipping.state,
        shipping.pincode
      ]
    );
    for (const [productId, quantity] of aggregated) {
      const product = byId.get(productId);
      await connection.execute('INSERT INTO order_items (order_id,product_id,product_name_snapshot,quantity,unit_price) VALUES (?,?,?,?,?)', [orderResult.insertId,productId,product.name,quantity,product.price]);
      await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [quantity,productId]);
    }
    await connection.commit();
    await redis.del(`cart:user:${req.user.id}`);
    const keys = await redis.keys('products:*'); if (keys.length) await redis.del(keys);
    res.status(201).json({
      message: 'Order placed successfully.',
      order: {
        id: orderResult.insertId,
        orderNumber,
        status: 'Order Placed',
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount: total
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}));
router.get('/', asyncHandler(async (req, res) => {
  const [orders] = await pool.execute('SELECT id, order_number, status, total_amount, payment_method, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json({ orders });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!orders.length) return res.status(404).json({ error: 'Order not found.' });
  const [items] = await pool.execute('SELECT product_id, product_name_snapshot, quantity, unit_price FROM order_items WHERE order_id = ?', [req.params.id]);
  const [history] = await pool.execute('SELECT old_status, new_status, changed_at FROM order_status_history WHERE order_id = ? ORDER BY changed_at', [req.params.id]);
  res.json({ order: orders[0], items, history });
}));
router.patch('/:id/status', requireRole('admin'), asyncHandler(async (req, res) => {
  const allowed = ['Order Placed','Processing','Shipped','Delivered','Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid order status.' });
  const [result] = await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Order not found.' });
  res.json({ message: 'Order status updated.' });
}));
export default router;
