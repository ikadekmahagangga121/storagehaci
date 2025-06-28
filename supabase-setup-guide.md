# Supabase Setup Guide untuk Storage Server

## 1. Buat Project Supabase

1. Buka https://supabase.com
2. Klik "Start your project"
3. Pilih organization atau buat baru
4. Isi nama project: `storage-server`
5. Buat database password (simpan!)
6. Pilih region: Southeast Asia (Singapore)
7. Klik "Create new project"
8. Tunggu 2-5 menit sampai status "Ready"

## 2. Setup Storage Bucket

1. Di dashboard Supabase, klik menu "Storage" di sidebar kiri
2. Klik "Create a new bucket"
3. Isi nama bucket: `files`
4. Pilih "Public" untuk bucket access
5. Klik "Create bucket"

## 3. Ambil API Credentials

1. Klik menu "Settings" (gear icon) di sidebar
2. Pilih "API"
3. Copy 2 nilai penting:
   - **Project URL** (contoh: https://xyz.supabase.co)
   - **anon public** key (key yang panjang)

## 4. Setup Environment Variables

1. Buat file `.env.local` di root project:
```bash
cp env.example .env.local
```

2. Edit `.env.local` dan isi dengan credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Test Setup

1. Restart development server:
```bash
npm run dev
```

2. Buka http://localhost:3000
3. Coba upload file untuk test

## Troubleshooting

### Error "Bucket not found"
- Pastikan bucket `files` sudah dibuat
- Cek nama bucket persis `files` (tanpa spasi)

### Error "Invalid API key"
- Pastikan anon key sudah benar
- Restart server setelah update .env.local

### Error "CORS"
- Pastikan bucket set ke "Public"
- Cek RLS (Row Level Security) settings 