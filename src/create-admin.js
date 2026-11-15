import bcrypt from 'bcryptjs';
import { connectStores, pool } from './db.js';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Painted Dots Admin';
if (!email || !password || password.length < 12) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment. Admin password must be at least 12 characters.');
  process.exit(1);
}
try {
  await connectStores();
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(`INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'admin') ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role='admin'`, [name,email.toLowerCase(),hash]);
  console.log(`Admin account ready for ${email}. Keep its password private.`);
} catch (e) { console.error(e); process.exitCode=1; }
finally { await pool.end(); process.exit(); }
