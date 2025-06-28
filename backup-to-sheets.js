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

async function backupUsers() {
  // Query data dari Neon
  const result = await pool.query('SELECT * FROM users');
  const rows = result.rows;

  if (rows.length === 0) {
    console.log('Tidak ada data user untuk dibackup.');
    process.exit(0);
  }

  // Siapkan header dan data
  const header = Object.keys(rows[0]);
  const values = [header, ...rows.map(row => header.map(h => row[h]))];

  // Tulis ke Google Sheets
  await sheets.spreadsheets.values.update({
    spreadsheetId: 'SPREADSHEET_ID_KAMU', // Ganti dengan ID Google Sheet kamu
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    resource: { values }
  });

  console.log('Backup ke Google Sheets sukses!');
  process.exit(0);
}

backupUsers().catch(err => {
  console.error('Gagal backup:', err);
  process.exit(1);
}); 