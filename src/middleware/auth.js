import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { asyncHandler } from '../utils.js';
import { pool } from '../db.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in is required.' });
  let payload;
  try { payload = jwt.verify(token, config.jwtSecret); }
  catch { return res.status(401).json({ error: 'Session token is invalid or expired.' }); }
  const [rows] = await pool.execute('SELECT id, name, email, role FROM users WHERE id = ?', [payload.sub]);
  if (!rows.length) return res.status(401).json({ error: 'User account was not found.' });
  req.user = rows[0];
  next();
});

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    next();
  };
}
