# Database Setup Guide - Storage Server

## Langkah-langkah Setup Database di Supabase

### 1. Buka SQL Editor
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik menu **"SQL Editor"** di sidebar kiri
4. Klik **"New Query"**

### 2. Jalankan Script Database
1. Copy seluruh isi file `database-setup.sql`
2. Paste ke SQL Editor
3. Klik **"Run"** untuk menjalankan script

### 3. Verifikasi Setup
Setelah script berhasil, cek di **"Table Editor"**:

#### Tables yang dibuat:
- ✅ `users` - Data user profile
- ✅ `files` - Metadata file yang diupload
- ✅ `file_shares` - Data sharing file

#### Views yang dibuat:
- ✅ `file_stats` - Statistik file

### 4. Test Database
Buat query test di SQL Editor:

```sql
-- Test query untuk melihat struktur table
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Test view file_stats
SELECT * FROM public.file_stats LIMIT 5;
```

### 5. Setup Authentication (Optional)
Jika ingin menambahkan login:

1. Buka menu **"Authentication"** di sidebar
2. Klik **"Settings"**
3. Aktifkan provider yang diinginkan (Email, Google, dll)
4. Set redirect URL: `http://localhost:3000/auth/callback`

### 6. Update Application Code
Setelah database setup, update komponen untuk menggunakan database:

#### Update FileUpload.tsx:
```typescript
// Tambahkan insert ke database setelah upload file
const { data: fileData, error: dbError } = await supabase
  .from('files')
  .insert({
    name: fileName,
    original_name: file.name,
    size: file.size,
    mime_type: file.type,
    storage_path: fileName,
    user_id: user?.id
  });
```

#### Update FileList.tsx:
```typescript
// Query dari database instead of storage list
const { data: files, error } = await supabase
  .from('files')
  .select('*')
  .order('created_at', { ascending: false });
```

## Troubleshooting

### Error "Foreign Key Constraint"
- Pastikan user sudah login sebelum upload file
- Cek user_id valid di auth.users

### Error "RLS Policy"
- Pastikan user sudah authenticated
- Cek policies sudah dibuat dengan benar

### Error "Permission Denied"
- Pastikan bucket storage sudah dibuat
- Cek RLS policies untuk table

## Struktur Database

### Table: users
- `id` - UUID (foreign key ke auth.users)
- `email` - Email user
- `full_name` - Nama lengkap
- `avatar_url` - URL avatar
- `created_at` - Timestamp pembuatan
- `updated_at` - Timestamp update

### Table: files
- `id` - UUID primary key
- `name` - Nama file di storage
- `original_name` - Nama asli file
- `size` - Ukuran file (bytes)
- `mime_type` - Tipe MIME file
- `storage_path` - Path di storage
- `user_id` - ID pemilik file
- `is_public` - Apakah file public
- `download_count` - Jumlah download
- `created_at` - Timestamp upload
- `updated_at` - Timestamp update

### Table: file_shares
- `id` - UUID primary key
- `file_id` - ID file yang di-share
- `share_token` - Token untuk sharing
- `expires_at` - Waktu expired
- `max_downloads` - Maksimal download
- `download_count` - Jumlah download
- `created_by` - ID pembuat share
- `created_at` - Timestamp pembuatan

## Next Steps

1. **Test Upload File** - Coba upload file untuk test database
2. **Setup Authentication** - Tambahkan login system
3. **Add File Sharing** - Implementasi fitur share file
4. **Add File Preview** - Preview file sebelum download
5. **Add Search** - Fitur pencarian file 