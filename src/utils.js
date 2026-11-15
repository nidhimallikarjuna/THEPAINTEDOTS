import { redis } from './db.js';

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
export async function invalidateProductCache() {
  const keys = await redis.keys('products:*');
  if (keys.length) await redis.del(keys);
}
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
