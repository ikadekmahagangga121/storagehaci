const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=');
        }
      }
    });
  }
}

loadEnvFile();

async function fixDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env.local');
    return;
  }
  
  console.log('🔧 Fixing database structure...');
  
  try {
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Check current table structure
    console.log('📋 Checking current table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'files' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Add download_count column if it doesn't exist
    const hasDownloadCount = tableInfo.rows.some(row => row.column_name === 'download_count');
    
    if (!hasDownloadCount) {
      console.log('➕ Adding download_count column...');
      await pool.query(`
        ALTER TABLE files ADD COLUMN download_count INTEGER DEFAULT 0
      `);
      console.log('✅ download_count column added successfully!');
    } else {
      console.log('✅ download_count column already exists');
    }
    
    // Update existing records to have download_count = 0 if NULL
    console.log('🔄 Updating existing records...');
    const updateResult = await pool.query(`
      UPDATE files SET download_count = 0 WHERE download_count IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} records`);
    
    // Verify the fix
    const verifyResult = await pool.query('SELECT COUNT(*) as total, COUNT(download_count) as with_count FROM files');
    console.log('📊 Verification:');
    console.log(`  - Total files: ${verifyResult.rows[0].total}`);
    console.log(`  - Files with download_count: ${verifyResult.rows[0].with_count}`);
    
    await pool.end();
    console.log('✅ Database structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  }
}

fixDatabase(); 