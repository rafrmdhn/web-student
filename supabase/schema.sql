-- ============================================================================
-- Platform Web BK & Pengembangan Potensi Siswa — Skema PostgreSQL Supabase
-- Jalankan seluruh skrip ini di SQL Editor proyek Supabase Anda.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Tabel Profil Pengguna (terhubung dengan auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'siswa' check (role in ('siswa', 'guru_bk', 'admin')),
  class_name text not null default '',
  is_active boolean not null default true,
  share_activity_consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Tabel Materi Pengenalan Diri
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3. Tabel Progres Membaca Materi Siswa
create table if not exists public.material_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, material_id)
);

-- 4. Tabel Kegiatan / Prompt Refleksi dari Guru BK
create table if not exists public.reflection_activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null,
  due_date date not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 5. Tabel Refleksi Minat & Kekuatan Diri Siswa
create table if not exists public.student_reflections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid references public.reflection_activities(id) on delete set null,
  interest_notes text not null default '',
  strength_notes text not null default '',
  reflection_content text not null,
  created_at timestamptz not null default now()
);

-- 5b. Tabel Pertanyaan Kuesioner Peta Potensi (25 pertanyaan, 5 dimensi)
create table if not exists public.potential_questions (
  id uuid primary key default gen_random_uuid(),
  question_number int not null unique,
  dimension text not null check (dimension in ('akademik', 'sosial', 'kreatif', 'kepemimpinan', 'teknis')),
  question_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Tabel Peta Potensi Siswa (1:1 per siswa)
create table if not exists public.potential_maps (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.profiles(id) on delete cascade,
  academic_score int not null default 70 check (academic_score between 0 and 100),
  social_score int not null default 70 check (social_score between 0 and 100),
  creative_score int not null default 70 check (creative_score between 0 and 100),
  leadership_score int not null default 70 check (leadership_score between 0 and 100),
  technical_score int not null default 70 check (technical_score between 0 and 100),
  top_strengths text not null default '',
  top_interests text not null default '',
  updated_at timestamptz not null default now()
);

-- 7. Tabel Rencana Masa Depan Siswa
create table if not exists public.future_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  timeframe text not null check (timeframe in ('jangka_pendek', 'jangka_menengah', 'jangka_panjang')),
  target_goal text not null,
  action_steps jsonb not null default '[]'::jsonb,
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

-- 8. Tabel Arahan & Tindak Lanjut Guru BK
create table if not exists public.counselor_followups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  counselor_id uuid references public.profiles(id) on delete set null,
  guidance_note text not null,
  recommendation text not null,
  status text not null default 'menunggu' check (status in ('menunggu', 'pendampingan', 'selesai')),
  updated_at timestamptz not null default now()
);

-- 9. Tabel Informasi Layanan & Jadwal Konsultasi BK
create table if not exists public.consultation_info (
  id uuid primary key default gen_random_uuid(),
  counselor_name text not null,
  schedule text not null,
  location_or_link text not null,
  contact_info text not null,
  notes text not null default ''
);

-- 10. Tabel Pengumuman Global dari Admin
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 11. Tabel Pengaturan Tampilan Website (baris tunggal id = 1)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'ArahDiri',
  tagline text not null default 'Ruang Bimbingan Konseling dan Pemetaan Potensi Siswa',
  logo_url text,
  accent_color text not null default 'teal' check (accent_color in ('teal', 'blue', 'indigo', 'emerald')),
  show_announcement_banner boolean not null default true
);

-- 12. Tabel Log Aktivitas Sistem
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  module text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Helper Functions untuk Row Level Security (RLS)
-- ============================================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.student_allows_sharing(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select share_activity_consent from public.profiles where id = target_student_id),
    false
  );
$$;

-- Trigger otomatis membuat profil saat user baru mendaftar via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, class_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'siswa'),
    coalesce(new.raw_user_meta_data->>'class_name', 'XI IPA 1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Aktivasi Row Level Security (RLS) & Kebijakan Privasi
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.material_progress enable row level security;
alter table public.reflection_activities enable row level security;
alter table public.student_reflections enable row level security;
alter table public.potential_questions enable row level security;
alter table public.potential_maps enable row level security;
alter table public.future_plans enable row level security;
alter table public.counselor_followups enable row level security;
alter table public.consultation_info enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- PROFILES
create policy "profiles_select_self_or_staff" on public.profiles
  for select using (
    id = auth.uid()
    or public.current_user_role() in ('guru_bk', 'admin')
  );

create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_self_consent" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
  for all using (public.current_user_role() = 'admin');

-- MATERIALS
create policy "materials_read_published" on public.materials
  for select using (
    status = 'published'
    or public.current_user_role() in ('guru_bk', 'admin')
  );

create policy "materials_manage_bk_admin" on public.materials
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- MATERIAL_PROGRESS
create policy "material_progress_own" on public.material_progress
  for all using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "material_progress_bk_with_consent" on public.material_progress
  for select using (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'guru_bk' and public.student_allows_sharing(student_id))
  );

-- REFLECTION_ACTIVITIES
create policy "reflection_activities_read_all" on public.reflection_activities
  for select using (is_active = true or public.current_user_role() in ('guru_bk', 'admin'));

create policy "reflection_activities_manage_bk_admin" on public.reflection_activities
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- STUDENT_REFLECTIONS (Privasi ketat: Guru BK hanya boleh membaca jika siswa opt-in)
create policy "student_reflections_own" on public.student_reflections
  for all using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "student_reflections_bk_with_consent" on public.student_reflections
  for select using (
    public.current_user_role() = 'guru_bk'
    and public.student_allows_sharing(student_id)
  );

-- POTENTIAL_QUESTIONS (Dibaca semua user login; dikelola Guru BK & Admin)
create policy "potential_questions_read_active" on public.potential_questions
  for select using (is_active = true or public.current_user_role() in ('guru_bk', 'admin'));

create policy "potential_questions_manage_staff" on public.potential_questions
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- POTENTIAL_MAPS (Privasi ketat: Guru BK hanya boleh membaca jika siswa opt-in)
create policy "potential_maps_own" on public.potential_maps
  for all using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "potential_maps_bk_with_consent" on public.potential_maps
  for select using (
    public.current_user_role() = 'guru_bk'
    and public.student_allows_sharing(student_id)
  );

-- FUTURE_PLANS (Privasi ketat: Guru BK hanya boleh membaca jika siswa opt-in)
create policy "future_plans_own" on public.future_plans
  for all using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "future_plans_bk_with_consent" on public.future_plans
  for select using (
    public.current_user_role() = 'guru_bk'
    and public.student_allows_sharing(student_id)
  );

-- COUNSELOR_FOLLOWUPS
create policy "counselor_followups_student_read" on public.counselor_followups
  for select using (student_id = auth.uid());

create policy "counselor_followups_bk_manage" on public.counselor_followups
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- CONSULTATION_INFO
create policy "consultation_info_public_read" on public.consultation_info
  for select using (true);

create policy "consultation_info_bk_admin_manage" on public.consultation_info
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- ANNOUNCEMENTS
create policy "announcements_public_read" on public.announcements
  for select using (is_active = true or public.current_user_role() = 'admin');

create policy "announcements_admin_manage" on public.announcements
  for all using (public.current_user_role() = 'admin');

-- SITE_SETTINGS
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_admin_manage" on public.site_settings
  for all using (public.current_user_role() = 'admin');

-- ACTIVITY_LOGS
create policy "activity_logs_insert_authenticated" on public.activity_logs
  for insert with check (auth.uid() is not null);

create policy "activity_logs_admin_read" on public.activity_logs
  for select using (public.current_user_role() = 'admin');


-- ============================================================================
-- RPC Admin: Reset Kata Sandi Pengguna (untuk user yang lupa password)
-- Hanya dapat dipanggil oleh pengguna dengan role = 'admin'.
-- ============================================================================
create or replace function public.admin_reset_user_password(
  target_user_id uuid,
  new_password text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Hanya Admin yang dapat mereset kata sandi pengguna lain.';
  end if;

  if new_password is null or length(new_password) < 6 then
    raise exception 'Kata sandi baru minimal 6 karakter.';
  end if;

  update auth.users
  set
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'Pengguna tidak ditemukan di Supabase Auth.';
  end if;
end;
$$;

revoke all on function public.admin_reset_user_password(uuid, text) from public;
grant execute on function public.admin_reset_user_password(uuid, text) to authenticated;


-- ============================================================================
-- Izin Level Tabel untuk Role anon & authenticated (RLS tetap aktif)
-- ============================================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.site_settings, public.announcements, public.consultation_info to anon;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.student_allows_sharing(uuid) to anon, authenticated;
