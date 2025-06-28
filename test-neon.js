const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  console.log('🔍 Looking for .env.local at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local found!');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
          console.log(`📝 Loaded: ${key}=${value.substring(0, 30)}...`);
        }
      }
    });
  } else {
    console.log('❌ .env.local not found!');
  }
}

loadEnvFile();

async function testNeonConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env.local');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
    return;
  }
  
  console.log('🔗 Testing Neon PostgreSQL connection...');
  console.log('URL:', connectionString.substring(0, 50) + '...');
  
  try {
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Berhasil terhubung ke Neon PostgreSQL!');
    
    // Test database access
    const result = await client.query('SELECT current_database(), current_user');
    console.log('📊 Database:', result.rows[0].current_database);
    console.log('👤 User:', result.rows[0].current_user);
    
    // Test tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📁 Tables yang tersedia:', tablesResult.rows.map(r => r.table_name));
    
    // Test files table
    const filesResult = await client.query('SELECT COUNT(*) as count FROM files');
    console.log('📄 Jumlah file dalam database:', filesResult.rows[0].count);
    
    client.release();
    await pool.end();
    
    console.log('✅ Test selesai - Neon PostgreSQL berfungsi dengan baik!');
    
  } catch (error) {
    console.error('❌ Error koneksi Neon:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Tips: Periksa username dan password database');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tips: Periksa URL database');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tips: Periksa firewall atau network connection');
    }
  }
}

testNeonConnection(); 