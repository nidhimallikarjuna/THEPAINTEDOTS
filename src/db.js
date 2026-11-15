import mysql from 'mysql2/promise';
import { createClient } from 'redis';
import { config } from './config.js';

export const pool = mysql.createPool(config.mysql);
export const redis = createClient({ url: config.redisUrl });
redis.on('error', (err) => console.error('Redis connection error:', err.message));

export async function connectStores() {
  const connection = await pool.getConnection();
  try { await connection.ping(); } finally { connection.release(); }
  await redis.connect();
  console.log('Connected to MySQL and Redis.');
}
