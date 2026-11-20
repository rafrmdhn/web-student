import React, { useState } from 'react';
import {
  Compass,
  Database,
  LogOut,
  Megaphone,
  Menu,
  RotateCcw,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
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
  subtitle,
  navItems,
  children,
}) => {
  const {
    mode,
    currentUser,
    siteSettings,
    announcements,
    activeTab,
    setActiveTab,
    logout,
    loginDemoByRole,
    resetDemoData,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const topAnnouncement = activeAnnouncements[0];

  const handleSelectNav = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-paper transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
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
            className="rounded-lg p-1.5 text-ink-muted hover:bg-subtle lg:hidden"
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
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
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

        <div className="border-t border-line p-4">
          {currentUser && (
            <div className="mb-3 rounded-lg bg-subtle px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink">{currentUser.full_name}</p>
              <p className="truncate text-xs text-ink-muted">{currentUser.class_name}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-subtle hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar / Ganti Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
                aria-label="Buka menu samping"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
                <p className="text-xs text-ink-muted sm:text-sm">{subtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1 text-xs font-medium text-ink-muted">
                <Database className="h-3.5 w-3.5 text-accent" />
                {mode === 'supabase' ? 'Supabase Terhubung' : 'Mode Demo Lokal'}
              </span>

              {mode === 'demo' && (
                <div
                  className="flex items-center gap-1 rounded-lg border border-line bg-canvas p-1"
                  aria-label="Ganti peran demo"
                >
                  {(['siswa', 'guru_bk', 'admin'] as UserRole[]).map((role) => {
                    const active = currentUser?.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => loginDemoByRole(role, 'ringkasan')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-accent text-white'
                            : 'text-ink-muted hover:bg-paper hover:text-ink'
                        }`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={resetDemoData}
                    title="Reset data demo ke awal"
                    className="rounded-md p-1 text-ink-muted hover:bg-paper hover:text-ink"
                    aria-label="Reset data demo"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {siteSettings.show_announcement_banner && topAnnouncement && (
            <div className="border-t border-line bg-accent-soft px-4 py-2 text-xs text-accent-ink sm:px-6 lg:px-8">
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
    </div>
  );
};
