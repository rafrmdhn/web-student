-- ============================================================================
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query
-- Menambahkan kolom logo_url pada tabel public.site_settings
-- ============================================================================

alter table public.site_settings
  add column if not exists logo_url text;

notify pgrst, 'reload schema';
