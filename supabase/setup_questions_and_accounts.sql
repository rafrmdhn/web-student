-- ============================================================================
-- Migrasi Cepat: Tabel 25 Pertanyaan Peta Potensi + Akun Guru BK & Admin
-- Jalankan seluruh skrip ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Buat tabel potential_questions & RLS
create table if not exists public.potential_questions (
  id uuid primary key default gen_random_uuid(),
  question_number int not null unique,
  dimension text not null check (dimension in ('akademik', 'sosial', 'kreatif', 'kepemimpinan', 'teknis')),
  question_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.potential_questions enable row level security;

drop policy if exists "potential_questions_read_active" on public.potential_questions;
create policy "potential_questions_read_active" on public.potential_questions
  for select using (is_active = true or public.current_user_role() in ('guru_bk', 'admin'));

drop policy if exists "potential_questions_manage_staff" on public.potential_questions;
create policy "potential_questions_manage_staff" on public.potential_questions
  for all using (public.current_user_role() in ('guru_bk', 'admin'));

-- 2. Isi 25 Pertanyaan Kuesioner Peta Potensi (5 dimensi x 5 pertanyaan)
insert into public.potential_questions (question_number, dimension, question_text, is_active)
values
  -- Akademik (1-5)
  (1, 'akademik', 'Saya senang membaca atau mencari penjelasan tambahan saat menemukan konsep pelajaran yang belum saya pahami.', true),
  (2, 'akademik', 'Saya mampu merangkum materi pelajaran menjadi catatan yang runtut dan mudah dipelajari kembali.', true),
  (3, 'akademik', 'Saya menikmati kegiatan menganalisis data, grafik, atau soal yang membutuhkan penalaran logis.', true),
  (4, 'akademik', 'Saya biasanya menyiapkan jadwal belajar atau target tugas jauh sebelum tenggat waktu tiba.', true),
  (5, 'akademik', 'Saya tertarik mendalami satu topik pelajaran hingga benar-benar mengerti alasan di balik setiap langkahnya.', true),

  -- Sosial (6-10)
  (6, 'sosial', 'Saya mudah menangkap perasaan teman dan berusaha mendengarkan dengan penuh perhatian saat mereka bercerita.', true),
  (7, 'sosial', 'Saya merasa nyaman berdiskusi dan bertukar pendapat dengan teman baru maupun kelompok yang beragam.', true),
  (8, 'sosial', 'Ketika terjadi perbedaan pendapat di kelompok, saya berusaha mencairkan suasana dan mencari titik temu.', true),
  (9, 'sosial', 'Saya senang membantu menjelaskan pelajaran atau memberi dukungan kepada teman yang sedang kesulitan.', true),
  (10, 'sosial', 'Saya merasa berenergi ketika terlibat dalam kegiatan kolaboratif, bakti sosial, atau kepanitiaan bersama.', true),

  -- Kreatif (11-15)
  (11, 'kreatif', 'Saya sering memunculkan ide cara penyampaian tugas yang berbeda dari kebiasaan teman-teman lain.', true),
  (12, 'kreatif', 'Saya menikmati kegiatan merancang visual, menulis cerita, membuat musik, video, atau karya seni lainnya.', true),
  (13, 'kreatif', 'Saat menghadapi masalah yang buntu, saya suka mencoba sudut pandang baru yang belum terpikirkan sebelumnya.', true),
  (14, 'kreatif', 'Saya peka terhadap keindahan tata letak, warna, ritme, atau gaya bahasa dalam suatu karya.', true),
  (15, 'kreatif', 'Saya merasa tertantang ketika diberi tugas terbuka yang membebaskan saya menentukan bentuk karyanya sendiri.', true),

  -- Kepemimpinan (16-20)
  (16, 'kepemimpinan', 'Saya berani mengambil inisiatif membagi tugas agar kerja kelompok berjalan teratur dan selesai tepat waktu.', true),
  (17, 'kepemimpinan', 'Saya percaya diri menyampaikan pendapat atau mempresentasikan hasil diskusi kelompok di depan kelas.', true),
  (18, 'kepemimpinan', 'Ketika kelompok menghadapi hambatan, saya berusaha tetap tenang dan mengajak anggota mencari keputusan bersama.', true),
  (19, 'kepemimpinan', 'Saya tertarik terlibat dalam kepengurusan organisasi sekolah, ekstrakurikuler, atau menjadi koordinator acara.', true),
  (20, 'kepemimpinan', 'Saya siap bertanggung jawab atas hasil kerja tim dan memastikan setiap anggota merasa dilibatkan.', true),

  -- Teknis (21-25)
  (21, 'teknis', 'Saya cepat memahami cara kerja aplikasi baru, perangkat digital, atau alat praktik di laboratorium dan bengkel.', true),
  (22, 'teknis', 'Saya menikmati kegiatan merakit, memperbaiki, atau menguji coba cara kerja suatu sistem secara langsung.', true),
  (23, 'teknis', 'Saya teliti mengikuti langkah prosedural dan mengecek ulang detail teknis agar hasil praktik bebas kesalahan.', true),
  (24, 'teknis', 'Saya tertarik mempelajari keterampilan terapan seperti pemrograman, desain teknis, elektronika, atau pengolahan data.', true),
  (25, 'teknis', 'Ketika perangkat atau alat mengalami kendala, saya cenderung mencoba menelusuri sumber masalahnya secara bertahap.', true)
on conflict (question_number) do update
set
  dimension = excluded.dimension,
  question_text = excluded.question_text,
  is_active = excluded.is_active;

-- 3. Buat Akun Guru BK & Admin langsung di Supabase Auth + public.profiles
--    Guru BK : gurubk@sekolah.sch.id  | Password: GuruBK123!
--    Admin   : admin@sekolah.sch.id   | Password: Admin123!
do $$
declare
  v_bk_id uuid;
  v_admin_id uuid;
begin
  -- === AKUN GURU BK ===
  select id into v_bk_id from auth.users where email = 'gurubk@sekolah.sch.id';
  if v_bk_id is null then
    v_bk_id := gen_random_uuid();
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_bk_id,
      'authenticated',
      'authenticated',
      'gurubk@sekolah.sch.id',
      crypt('GuruBK123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Ibu Ratna Wulandari, S.Pd., Kons.","role":"guru_bk","class_name":"Tim BK Sekolah"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_bk_id,
      v_bk_id::text,
      jsonb_build_object('sub', v_bk_id::text, 'email', 'gurubk@sekolah.sch.id'),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, full_name, email, role, class_name, is_active)
  values (v_bk_id, 'Ibu Ratna Wulandari, S.Pd., Kons.', 'gurubk@sekolah.sch.id', 'guru_bk', 'Tim BK Sekolah', true)
  on conflict (id) do update
  set role = 'guru_bk', is_active = true;

  -- === AKUN ADMIN ===
  select id into v_admin_id from auth.users where email = 'admin@sekolah.sch.id';
  if v_admin_id is null then
    v_admin_id := gen_random_uuid();
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      'admin@sekolah.sch.id',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Budi Santoso","role":"admin","class_name":"Pengelola Sistem"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_admin_id,
      v_admin_id::text,
      jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@sekolah.sch.id'),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, full_name, email, role, class_name, is_active)
  values (v_admin_id, 'Budi Santoso', 'admin@sekolah.sch.id', 'admin', 'Pengelola Sistem', true)
  on conflict (id) do update
  set role = 'admin', is_active = true;
end $$;
