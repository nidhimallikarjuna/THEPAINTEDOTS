import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db.js';
import { config } from '../config.js';
import { asyncHandler, publicUser } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(190), password: z.string().min(8).max(100) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(190)
});

router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please provide a valid name, email and password (at least 8 characters).' });
  const { name, email, password } = parsed.data;
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, \'customer\')', [name, email.toLowerCase(), passwordHash]);
  const user = { id: result.insertId, name, email: email.toLowerCase(), role: 'customer' };
  const token = jwt.sign({}, config.jwtSecret, { subject: String(user.id), expiresIn: config.jwtExpiresIn });
  res.status(201).json({ user, token });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please provide a valid email and password.' });
  const [rows] = await pool.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [parsed.data.email.toLowerCase()]);
  if (!rows.length || !(await bcrypt.compare(parsed.data.password, rows[0].password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const user = publicUser(rows[0]);
  const token = jwt.sign({}, config.jwtSecret, { subject: String(user.id), expiresIn: config.jwtExpiresIn });
  res.json({ user, token });
}));
router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.patch('/profile', requireAuth, asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Please provide a valid name and email.'
    });
  }

  const { name, email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? AND id != ?',
    [normalizedEmail, req.user.id]
  );

  if (existing.length) {
    return res.status(409).json({
      error: 'This email is already associated with another account.'
    });
  }

  await pool.execute(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, normalizedEmail, req.user.id]
  );

  const [rows] = await pool.execute(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json({
    message: 'Profile updated successfully.',
    user: publicUser(rows[0])
  });
}));

export default router;
