import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { connectStores, pool, redis } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import addressRoutes from './routes/addresses.js';
import adminRoutes from './routes/admin.js';
import { asyncHandler } from './utils.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.frontendOrigin.split(',').map(x => x.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }), authRoutes);
app.get('/api/health', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1');
  const redisOk = await redis.ping();
  res.json({ status: 'ok', mysql: 'connected', redis: redisOk });
}));
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  res.status(status).json({ error: status === 500 ? 'Unexpected server error. Check backend terminal logs.' : err.message });
});

connectStores().then(() => app.listen(config.port, () => console.log(`Painted Dots API running at http://localhost:${config.port}`))).catch(err => {
  console.error('Could not start backend:', err.message);
  process.exit(1);
});
