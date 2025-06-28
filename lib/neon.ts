import { Pool } from 'pg';

// Parse connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_cjw7CEfZS9Ms@ep-raspy-fog-a1t4s7qr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create connection pool
let pool: Pool;

export async function getDatabase() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        original_name VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        url TEXT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        user_id VARCHAR(255),
        download_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add download_count column if it doesn't exist (migration)
    try {
      await pool.query(`
        ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0
      `);
    } catch (error) {
      // Column might already exist, ignore error
      console.log('download_count column migration:', error);
    }
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_files_download_count ON files(download_count DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }
  return pool;
}

export default getDatabase; 