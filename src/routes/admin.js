import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../utils.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/analytics', asyncHandler(async (_req, res) => {
  const [[summary]] = await pool.query("SELECT COUNT(*) AS order_count, COALESCE(SUM(CASE WHEN status <> 'Cancelled' THEN total_amount ELSE 0 END),0) AS gross_sales FROM orders");
  const [topProducts] = await pool.query("SELECT product_name_snapshot AS name, SUM(quantity) AS units_sold, SUM(quantity * unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status <> 'Cancelled' GROUP BY product_name_snapshot ORDER BY units_sold DESC LIMIT 5");
  const [lowStock] = await pool.query('SELECT id, name, stock_quantity FROM products WHERE is_active=1 AND stock_quantity <= 5 ORDER BY stock_quantity ASC');
  const [pendingOrders] = await pool.query("SELECT id, order_number, status, created_at FROM orders WHERE status IN ('Order Placed','Processing') ORDER BY created_at ASC LIMIT 20");
  res.json({ summary, topProducts, lowStock, pendingOrders });
}));
export default router;
