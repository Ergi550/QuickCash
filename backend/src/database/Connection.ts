import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Database Configuration
 */
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'quickcash_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ergi10',
  
  // Pool configuration
  max: 20,                    // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
};

/**
 * Create PostgreSQL connection pool
 */
const pool = new Pool(poolConfig);

// Log connection events
pool.on('connect', () => {
  console.log('📦 New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Execute a query with parameters
 * @param text - SQL query
 * @param params - Query parameters
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.log('⚠️ Slow query:', { text, duration: `${duration}ms`, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Query error:', { text, error });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
  const client = await pool.connect();
  
  // Wrap release to log
  const originalRelease = client.release.bind(client);
  client.release = () => {
    originalRelease();
  };
  
  return client;
};

/**
 * Execute a transaction
 * @param callback - Function containing transaction queries
 */
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close all pool connections
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('🔌 Database pool closed');
};

export default pool;