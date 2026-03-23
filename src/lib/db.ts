import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_DATABASE || 'cineelite1',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  const [results] = await pool.query(sql, values);
  return results as T;
}

const db = {
    query,
    pool
};

export default db;
