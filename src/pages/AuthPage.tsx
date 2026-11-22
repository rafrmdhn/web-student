import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const { isConfigured, siteSettings, loginWithEmail, registerWithEmail } = useApp();

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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <BrandLogo
                logoUrl={siteSettings.logo_url}
                siteName={siteSettings.site_name}
                size="md"
              />
              <div>
                <h1 className="font-display text-xl font-bold text-ink">
                  {siteSettings.site_name}
                </h1>
                <p className="text-xs text-ink-muted">{siteSettings.tagline}</p>
              </div>
            </div>

            {!isConfigured && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold">Supabase belum terkonfigurasi</p>
                  <p className="mt-1">
                    Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada
                    file <code>.env</code>, lalu jalankan ulang <code>npm run dev</code> agar login
                    dan penyimpanan database aktif.
                  </p>
                </div>
              </div>
            )}

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
                        placeholder="XI IPA 1 / Tim BK"
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
                  placeholder="Minimal 6 karakter"
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
                disabled={submitting || !isConfigured}
                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Memproses...'
                  : tab === 'login'
                    ? 'Masuk ke Dashboard'
                    : 'Buat Akun'}
              </button>

              {tab === 'login' && (
                <p className="text-center text-xs text-ink-muted">
                  Lupa kata sandi? Hubungi Admin sekolah untuk melakukan reset kata sandi akun Anda.
                </p>
              )}
            </form>
      </div>
    </div>
  );
};
