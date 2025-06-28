const { MongoClient } = require('mongodb');
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

async function testMongoDBConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI tidak ditemukan di .env.local');
    return;
  }
  
  console.log('🔗 Testing MongoDB connection...');
  console.log('URI:', uri.substring(0, 50) + '...');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ Berhasil terhubung ke MongoDB!');
    
    // Test database access
    const db = client.db('storage');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections yang tersedia:', collections.map(c => c.name));
    
    // Test collection access
    const filesCollection = db.collection('files');
    const count = await filesCollection.countDocuments();
    console.log('📄 Jumlah file dalam database:', count);
    
    await client.close();
    console.log('✅ Test selesai - MongoDB berfungsi dengan baik!');
    
  } catch (error) {
    console.error('❌ Error koneksi MongoDB:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Tips: Periksa username dan password MongoDB');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tips: Periksa URL cluster MongoDB');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tips: Periksa firewall atau network connection');
    }
  }
}

testMongoDBConnection(); 