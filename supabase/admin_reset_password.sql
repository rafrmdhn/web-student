-- ============================================================================
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New query
-- Mengaktifkan fitur Admin Reset Password bagi pengguna yang lupa kata sandi.
-- ============================================================================

create extension if not exists "pgcrypto";

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
