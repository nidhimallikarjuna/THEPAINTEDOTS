import { Router } from 'express';
import { z } from 'zod';
import { redis } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
const cartKey = (id) => `cart:user:${id}`;
router.get('/', async (req, res) => {
  const cart = await redis.get(cartKey(req.user.id));
  res.json({ items: cart ? JSON.parse(cart) : [], storage: 'redis', note: 'Cart is temporary Redis data; checkout must revalidate prices and stock in MySQL.' });
});
router.put('/', async (req, res) => {
  const schema = z.object({ items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).max(100) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Cart must contain productId and quantity for each item.' });
  await redis.set(cartKey(req.user.id), JSON.stringify(parsed.data.items), { EX: 60 * 60 * 24 * 7 });
  res.json({ message: 'Cart saved in Redis.', items: parsed.data.items });
});
router.delete('/', async (req, res) => { await redis.del(cartKey(req.user.id)); res.json({ message: 'Cart cleared.' }); });
export default router;
