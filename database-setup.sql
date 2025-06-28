-- Storage Server Database Setup
-- Jalankan script ini di SQL Editor Supabase

-- 1. Buat table untuk files metadata
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    user_id UUID,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at);

-- 3. Buat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Buat trigger untuk auto-update timestamp
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Setup Row Level Security (RLS) - DISABLE untuk demo
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;

-- 6. Buat function untuk increment download count
CREATE OR REPLACE FUNCTION increment_download_count(file_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.files 
    SET download_count = download_count + 1 
    WHERE id = file_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions untuk anon dan authenticated
GRANT ALL ON public.files TO anon;
GRANT ALL ON public.files TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated; 