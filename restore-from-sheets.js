const { Pool } = require('pg');
const { google } = require('googleapis');
const fs = require('fs');

// 1. Koneksi ke Neon
const pool = new Pool({
  connectionString: 'DATABASE_URL_KAMU', // Ganti dengan DATABASE_URL Neon kamu
  ssl: { rejectUnauthorized: false }
});

// 2. Load credential Google Service Account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync('PATH/TO/credential.json', 'utf8')), // Ganti path credential
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

async function restoreUsers() {
  // Ambil data dari Google Sheets
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: 'SPREADSHEET_ID_KAMU', // Ganti dengan ID Google Sheet kamu
    range: 'Sheet1!A1:Z1000'
  });
  const values = res.data.values;
  if (!values || values.length < 2) {
    console.log('Tidak ada data untuk di-restore');
    return;
  }
  const header = values[0];
  const rows = values.slice(1);

  // (Opsional) Hapus data lama
  await pool.query('DELETE FROM users');

  // Insert data ke Neon
  for (const row of rows) {
    // Buat object dari header dan row
    const obj = {};
    header.forEach((h, i) => obj[h] = row[i]);
    // Insert ke tabel users
    await pool.query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
      [obj.id, obj.email, obj.password_hash, obj.created_at]
    );
  }
  console.log('Restore dari Google Sheets ke Neon sukses!');
  process.exit(0);
}

restoreUsers().catch(err => {
  console.error('Gagal restore:', err);
  process.exit(1);
}); 