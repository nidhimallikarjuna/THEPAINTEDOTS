import 'dotenv/config';

const required = ['JWT_SECRET', 'MYSQL_DATABASE', 'MYSQL_USER'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}. Copy .env.example to .env and configure it.`);
}
if (process.env.JWT_SECRET.length < 24) throw new Error('JWT_SECRET must be at least 24 characters long.');

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  cacheTtl: Number(process.env.CACHE_TTL_SECONDS || 300),
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true
  },
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};
