import React, { useState } from 'react';
import { Compass, Database, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const {
    mode,
    siteSettings,
    profiles,
    loginWithEmail,
    registerWithEmail,
    loginDemoById,
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [className, setClassName] = useState('XI IPA 1');
  const [role, setRole] = useState<UserRole>('siswa');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.ok) setError(res.error ?? 'Gagal masuk.');
      } else {
        if (!fullName.trim() || !email.trim() || password.length < 6) {
          setError('Lengkapi nama, email valid, dan kata sandi minimal 6 karakter.');
          return;
        }
        const res = await registerWithEmail({
          full_name: fullName,
          email,
          password,
          class_name: className,
          role,
        });
        if (!res.ok) setError(res.error ?? 'Gagal mendaftar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-canvas px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Form */}
          <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">
                  {siteSettings.site_name}
                </h1>
                <p className="text-xs text-ink-muted">{siteSettings.tagline}</p>
              </div>
            </div>

            <div className="mt-6 flex rounded-lg border border-line bg-canvas p-1">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  tab === 'login' ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError('');
                }}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  tab === 'register'
                    ? 'bg-paper text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink" htmlFor="auth-name">
                      Nama lengkap
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Dinda Maharani"
                      className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-ink" htmlFor="auth-role">
                        Peran akun
                      </label>
                      <select
                        id="auth-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
                      >
                        <option value="siswa">Siswa</option>
                        <option value="guru_bk">Guru BK</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink" htmlFor="auth-class">
                        Kelas atau unit
                      </label>
                      <input
                        id="auth-class"
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="XI IPA 1"
                        className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="auth-email">
                  Email sekolah
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="auth-password">
                  Kata sandi
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'demo' ? 'Minimal 6 karakter (bebas di Mode Demo)' : '••••••••'}
                  className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting
                  ? 'Memproses...'
                  : tab === 'login'
                    ? 'Masuk ke Dashboard'
                    : 'Buat Akun'}
              </button>
            </form>
          </div>

          {/* Right: Quick Demo Login / Supabase Mode Info */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-line bg-paper p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Database className="h-4 w-4 text-accent" />
                <span>
                  {mode === 'supabase' ? 'Terhubung ke Supabase' : 'Masuk Cepat (Mode Demo Lokal)'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {mode === 'supabase'
                  ? 'Autentikasi dan data tersimpan langsung di proyek Supabase Anda.'
                  : 'File .env belum diisi, sehingga aplikasi berjalan otomatis dengan data demo lokal. Pilih salah satu akun di bawah untuk menguji alur lintas dashboard.'}
              </p>

              {mode === 'demo' && (
                <div className="mt-4 space-y-2">
                  {profiles.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => loginDemoById(prof.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-line bg-canvas px-3.5 py-3 text-left transition-colors hover:border-accent/50 hover:bg-accent-soft/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{prof.full_name}</p>
                        <p className="text-xs text-ink-muted">
                          {prof.role === 'siswa'
                            ? `Siswa (${prof.class_name}) — ${
                                prof.share_activity_consent ? 'Berbagi ke BK aktif' : 'Privat'
                              }`
                            : prof.role === 'guru_bk'
                              ? 'Guru BK'
                              : 'Admin Sistem'}
                        </p>
                      </div>
                      <span className="rounded-md bg-paper px-2.5 py-1 text-xs font-medium text-accent">
                        Masuk
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-subtle p-5 text-xs leading-relaxed text-ink-muted">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Jaminan Privasi Siswa</span>
              </p>
              <p className="mt-1.5">
                Siswa memegang kendali penuh atas izin berbagi refleksi, peta potensi, dan rencana
                masa depan kepada Guru BK.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-ink">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>Siap pakai untuk PostgreSQL Row Level Security di Supabase.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
