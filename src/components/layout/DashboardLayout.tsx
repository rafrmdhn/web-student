import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  KeyRound,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';
import { Modal } from '../common/Modal';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

const ROLE_LABELS: Record<UserRole, string> = {
  siswa: 'Siswa',
  guru_bk: 'Guru BK',
  admin: 'Admin',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  navItems,
  children,
}) => {
  const {
    currentUser,
    siteSettings,
    announcements,
    activeTab,
    setActiveTab,
    changePassword,
    logout,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const openPasswordModal = () => {
    setProfileMenuOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordModalOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (!res.ok) {
        setPasswordError(res.error ?? 'Gagal mengubah kata sandi.');
        return;
      }
      setPasswordModalOpen(false);
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const topAnnouncement = activeAnnouncements[0];

  const handleSelectNav = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const userInitials = (currentUser?.full_name ?? 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-paper shadow-xl transition-transform duration-200 ease-out lg:w-64 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:h-[72px]">
          <button
            type="button"
            onClick={() => handleSelectNav('ringkasan')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <span className="block font-display text-base font-bold leading-tight text-ink">
                {siteSettings.site_name}
              </span>
              <span className="block text-xs text-ink-muted">
                Ruang {currentUser ? ROLE_LABELS[currentUser.role] : ''}
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtle text-ink-muted transition-colors hover:bg-line/70 hover:text-ink lg:hidden"
            aria-label="Tutup menu samping"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-soft text-accent-ink'
                    : 'text-ink-muted hover:bg-subtle hover:text-ink'
                }`}
              >
                <span className={isActive ? 'text-accent' : 'text-ink-muted'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile-only user profile & logout section */}
        {currentUser && (
          <div className="border-t border-line bg-canvas/70 p-4 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xs font-semibold text-white">
                {userInitials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{currentUser.full_name}</p>
                <p className="truncate text-xs text-ink-muted">
                  {ROLE_LABELS[currentUser.role]}
                  {currentUser.class_name ? ` (${currentUser.class_name})` : ''}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  openPasswordModal();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle"
              >
                <KeyRound className="h-3.5 w-3.5 text-accent" />
                <span>Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  void logout();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 bg-paper">
          <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:h-[72px] sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink transition-all hover:border-accent/40 hover:bg-subtle active:scale-95 lg:hidden"
                aria-label="Buka menu navigasi"
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-semibold text-ink sm:text-xl">
                  {title}
                </h1>
              </div>
            </div>

            {currentUser && (
              <div className="relative hidden lg:block" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  aria-label={`Menu profil ${currentUser.full_name}`}
                  title={currentUser.full_name}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold tracking-wide text-white transition-all hover:bg-accent-hover ${
                    profileMenuOpen ? 'ring-2 ring-accent/35 ring-offset-2 ring-offset-paper' : ''
                  }`}
                >
                  {userInitials}
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="modal-panel-in absolute right-0 mt-2.5 w-72 overflow-hidden rounded-2xl border border-line bg-paper p-2 shadow-lg"
                  >
                    <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-white">
                        {userInitials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {currentUser.full_name}
                        </p>
                        <p className="truncate text-xs text-ink-muted">{currentUser.email}</p>
                        <span className="mt-1 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-ink">
                          {ROLE_LABELS[currentUser.role]}
                          {currentUser.class_name ? ` (${currentUser.class_name})` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-0.5">
                      {currentUser.role === 'siswa' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            handleSelectNav('privasi-bantuan');
                            setProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-subtle"
                        >
                          <ShieldCheck className="h-4 w-4 text-accent" />
                          <span>Privasi dan Bantuan</span>
                        </button>
                      )}

                      {currentUser.role === 'guru_bk' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            handleSelectNav('konsultasi');
                            setProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-subtle"
                        >
                          <Settings className="h-4 w-4 text-accent" />
                          <span>Informasi Konsultasi</span>
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            handleSelectNav('tampilan');
                            setProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-subtle"
                        >
                          <Settings className="h-4 w-4 text-accent" />
                          <span>Tampilan Website</span>
                        </button>
                      )}

                      <button
                        type="button"
                        role="menuitem"
                        onClick={openPasswordModal}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-subtle"
                      >
                        <KeyRound className="h-4 w-4 text-accent" />
                        <span>Ubah Kata Sandi</span>
                      </button>

                      <div className="my-1.5 border-t border-line" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {siteSettings.show_announcement_banner && topAnnouncement && (
            <div className="border-b border-line bg-accent-soft px-4 py-2 text-xs text-accent-ink sm:px-6 lg:px-8">
              <div className="flex items-start gap-2">
                <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <p className="leading-relaxed">
                  <strong className="font-semibold">{topAnnouncement.title}:</strong>{' '}
                  {topAnnouncement.content}
                </p>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Ubah kata sandi akun"
        description="Masukkan kata sandi baru minimal 6 karakter untuk akun Anda."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="self-new-pass">
              Kata sandi baru
            </label>
            <input
              id="self-new-pass"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="self-confirm-pass">
              Konfirmasi kata sandi baru
            </label>
            <input
              id="self-confirm-pass"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          {passwordError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
              {passwordError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {savingPassword ? 'Menyimpan...' : 'Simpan kata sandi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
