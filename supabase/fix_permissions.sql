-- ============================================================================
-- Perbaikan Error 403 (Forbidden) pada Semua Tabel Supabase
-- Jalankan seluruh skrip ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================
-- Catatan: Row Level Security (RLS) tetap aktif dan menjaga privasi setiap role.
-- Perintah GRANT di bawah memberi izin level tabel agar PostgreSQL dapat
-- mengevaluasi policy RLS (tanpa GRANT, PostgreSQL langsung menolak 403).

grant usage on schema public to anon, authenticated;

-- Izin akses tabel untuk pengguna yang sudah login (tetap dibatasi oleh RLS)
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Izin baca publik (sebelum login) khusus untuk pengaturan tampilan & info umum
grant select on public.site_settings to anon;
grant select on public.announcements to anon;
grant select on public.consultation_info to anon;

-- Izin eksekusi fungsi helper RLS
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.student_allows_sharing(uuid) to anon, authenticated;

-- Terapkan juga otomatis untuk tabel/sequence baru di masa depan
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

notify pgrst, 'reload schema';
