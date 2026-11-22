-- ============================================================================
-- Sinkronisasi Semua User auth.users -> public.profiles + Perbaikan RLS Admin
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

-- 1. Pastikan fungsi helper bisa dieksekusi oleh role authenticated
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_user_role() to authenticated, anon;
grant select, insert, update, delete on public.profiles to authenticated;

-- 2. Sinkronkan seluruh akun dari auth.users yang belum masuk ke public.profiles
insert into public.profiles (id, full_name, email, role, class_name, is_active)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(u.email, '@', 1)),
  u.email,
  case
    when lower(coalesce(u.raw_user_meta_data->>'role', '')) in ('admin') then 'admin'
    when lower(coalesce(u.raw_user_meta_data->>'role', '')) in ('guru_bk', 'guru', 'bk') then 'guru_bk'
    else 'siswa'
  end,
  coalesce(nullif(trim(u.raw_user_meta_data->>'class_name'), ''), 'XI IPA 1'),
  true
from auth.users u
where u.email is not null
on conflict (id) do nothing;

-- 3. Pastikan policy SELECT untuk Admin & Guru BK aktif
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_staff" on public.profiles;
create policy "profiles_select_self_or_staff" on public.profiles
  for select using (
    id = auth.uid()
    or public.current_user_role() in ('guru_bk', 'admin')
  );

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.current_user_role() = 'admin');

notify pgrst, 'reload schema';

-- 4. Cek hasil akhir: tampilkan jumlah akun per role
select role, count(*) as jumlah
from public.profiles
group by role
order by role;
