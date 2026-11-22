import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Edit3,
  Megaphone,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  UserCog,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  DashboardLayout,
  type DashboardNavItem,
} from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import type { AccentColor, Announcement, MaterialStatus, Profile, UserRole } from '../../types';

const ADMIN_NAV: DashboardNavItem[] = [
  { id: 'ringkasan', label: 'Pemantauan Sistem', icon: <Activity className="h-4 w-4" /> },
  { id: 'akun', label: 'Akun & Hak Akses', icon: <UserCog className="h-4 w-4" /> },
  { id: 'materi', label: 'Moderasi Materi', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'tampilan', label: 'Tampilan Website', icon: <Palette className="h-4 w-4" /> },
  { id: 'pengumuman', label: 'Pengumuman Global', icon: <Megaphone className="h-4 w-4" /> },
];

const ACCENT_OPTIONS: Array<{ id: AccentColor; label: string; swatch: string }> = [
  { id: 'teal', label: 'Teal', swatch: '#0F766E' },
  { id: 'blue', label: 'Biru', swatch: '#1D4ED8' },
  { id: 'indigo', label: 'Indigo', swatch: '#4338CA' },
  { id: 'emerald', label: 'Emerald', swatch: '#047857' },
];

export const AdminDashboard: React.FC = () => {
  const {
    activeTab,
    profiles,
    materials,
    announcements,
    siteSettings,
    activityLogs,
    saveUserAccount,
    toggleUserActive,
    adminResetUserPassword,
    updateMaterialStatus,
    deleteMaterial,
    updateSiteSettings,
    saveAnnouncement,
    deleteAnnouncement,
  } = useApp();

  // Modal: Account
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | undefined>(undefined);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState<UserRole>('siswa');
  const [uClass, setUClass] = useState('');
  const [uActive, setUActive] = useState(true);

  // Site settings form
  const [sName, setSName] = useState(siteSettings.site_name);
  const [sTagline, setSTagline] = useState(siteSettings.tagline);
  const [sLogoUrl, setSLogoUrl] = useState(siteSettings.logo_url ?? '');
  const [logoError, setLogoError] = useState('');
  const [sAccent, setSAccent] = useState<AccentColor>(siteSettings.accent_color);
  const [sShowBanner, setSShowBanner] = useState(siteSettings.show_announcement_banner);

  useEffect(() => {
    setSName(siteSettings.site_name);
    setSTagline(siteSettings.tagline);
    setSLogoUrl(siteSettings.logo_url ?? '');
    setSAccent(siteSettings.accent_color);
    setSShowBanner(siteSettings.show_announcement_banner);
  }, [siteSettings]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Pilih file gambar (PNG, JPG, SVG, atau WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Ukuran file maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      // SVG can be stored directly if small; raster images are resized to max 256px
      if (file.type === 'image/svg+xml') {
        setSLogoUrl(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setSLogoUrl(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        setSLogoUrl(canvas.toDataURL('image/png'));
      };
      img.onerror = () => setLogoError('File gambar tidak dapat dibaca.');
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Modal: Reset Password (Admin)
  const [resetTarget, setResetTarget] = useState<Profile | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmVal, setResetConfirmVal] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  // Modal: Announcement
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [editAnnId, setEditAnnId] = useState<string | undefined>(undefined);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annActive, setAnnActive] = useState(true);

  const roleChartData = [
    { role: 'Siswa', jumlah: profiles.filter((p) => p.role === 'siswa').length },
    { role: 'Guru BK', jumlah: profiles.filter((p) => p.role === 'guru_bk').length },
    { role: 'Admin', jumlah: profiles.filter((p) => p.role === 'admin').length },
  ];

  // Open modal helpers
  const openCreateUser = () => {
    setEditUserId(undefined);
    setUName('');
    setUEmail('');
    setURole('siswa');
    setUClass('');
    setUActive(true);
    setUserModalOpen(true);
  };

  const openEditUser = (p: Profile) => {
    setEditUserId(p.id);
    setUName(p.full_name);
    setUEmail(p.email);
    setURole(p.role);
    setUClass(p.class_name);
    setUActive(p.is_active);
    setUserModalOpen(true);
  };

  const openResetPasswordModal = (p: Profile) => {
    setResetTarget(p);
    setResetPasswordVal('');
    setResetConfirmVal('');
    setResetError('');
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError('');
    if (resetPasswordVal.length < 6) {
      setResetError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (resetPasswordVal !== resetConfirmVal) {
      setResetError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setResetting(true);
    try {
      const res = await adminResetUserPassword(resetTarget.id, resetPasswordVal);
      if (!res.ok) {
        setResetError(res.error ?? 'Gagal mereset kata sandi.');
        return;
      }
      setResetTarget(null);
    } finally {
      setResetting(false);
    }
  };

  const openCreateAnnouncement = () => {
    setEditAnnId(undefined);
    setAnnTitle('');
    setAnnContent('');
    setAnnActive(true);
    setAnnModalOpen(true);
  };

  const openEditAnnouncement = (ann: Announcement) => {
    setEditAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnActive(ann.is_active);
    setAnnModalOpen(true);
  };

  // Submit handlers
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim()) return;
    await saveUserAccount(
      {
        full_name: uName.trim(),
        email: uEmail.trim().toLowerCase(),
        role: uRole,
        class_name: uClass.trim() || '-',
        is_active: uActive,
      },
      editUserId
    );
    setUserModalOpen(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({
      site_name: sName.trim() || 'ArahDiri',
      tagline: sTagline.trim(),
      logo_url: sLogoUrl.trim() || null,
      accent_color: sAccent,
      show_announcement_banner: sShowBanner,
    });
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    await saveAnnouncement(
      {
        title: annTitle.trim(),
        content: annContent.trim(),
        is_active: annActive,
      },
      editAnnId
    );
    setAnnModalOpen(false);
  };

  return (
    <DashboardLayout
      title="Dashboard Admin"
      subtitle="Pantau kesehatan platform, kelola akun dan hak akses, moderasi materi, tema, serta pengumuman."
      navItems={ADMIN_NAV}
    >
      {/* TAB 1: PEMANTAUAN FUNGSI WEBSITE */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total akun"
              value={profiles.length}
              hint={`${profiles.filter((p) => p.is_active).length} akun aktif`}
              icon={<Users className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Total materi"
              value={materials.length}
              hint={`${materials.filter((m) => m.status === 'published').length} terpublikasi`}
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatCard
              label="Pengumuman aktif"
              value={announcements.filter((a) => a.is_active).length}
              hint="Ditampilkan di seluruh dashboard"
              icon={<Megaphone className="h-4 w-4" />}
            />
            <StatCard
              label="Log aktivitas"
              value={activityLogs.length}
              hint="Catatan perubahan sistem terbaru"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl bg-paper p-6 ring-1 ring-line/60 lg:col-span-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                Pengguna berdasarkan peran
              </h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D8E2DF" />
                    <XAxis dataKey="role" tick={{ fill: '#526663', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#526663', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-paper p-6 ring-1 ring-line/60 lg:col-span-6">
              <h2 className="font-display text-lg font-semibold text-ink">Status modul sistem</h2>
              <div className="mt-4 space-y-2.5">
                {[
                  'Autentikasi & Hak Akses Peran',
                  'Kontrol Privasi Siswa (Row Level Security)',
                  'Katalog Materi',
                  'Visualisasi Radar Peta Potensi',
                  'Pengumuman & Pengaturan Tampilan Live',
                ].map((mod) => (
                  <div
                    key={mod}
                    className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-ink">{mod}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Normal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="rounded-2xl bg-paper p-6 ring-1 ring-line/60">
            <h2 className="font-display text-lg font-semibold text-ink">Log aktivitas terbaru</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold text-ink-muted">
                    <th className="pb-3 pr-4">Waktu</th>
                    <th className="pb-3 pr-4">Pengguna</th>
                    <th className="pb-3 pr-4">Modul</th>
                    <th className="pb-3 pr-4">Aksi</th>
                    <th className="pb-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {activityLogs.slice(0, 15).map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap py-3 pr-4 text-ink-muted">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4 font-medium text-ink">{log.user_name ?? '-'}</td>
                      <td className="py-3 pr-4 text-ink-muted">{log.module}</td>
                      <td className="py-3 pr-4 font-medium text-ink">{log.action}</td>
                      <td className="py-3 text-ink-muted">{log.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA AKUN & HAK AKSES (Modal CRUD) */}
      {activeTab === 'akun' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Kelola akun dan hak akses
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Tambah pengguna baru, ubah peran, atau aktifkan dan nonaktifkan akses akun.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateUser}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah akun</span>
            </button>
          </div>

          <div className="rounded-2xl bg-paper p-6 ring-1 ring-line/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold text-ink-muted">
                    <th className="pb-3 pr-4">Nama & Email</th>
                    <th className="pb-3 pr-4">Peran</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {profiles.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink">{p.full_name}</p>
                        <p className="text-ink-muted">
                          {p.email} ({p.class_name})
                        </p>
                      </td>
                      <td className="py-3 pr-4 capitalize text-ink">{p.role.replace('_', ' ')}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-semibold ${
                            p.is_active
                              ? 'bg-accent-soft text-accent-ink'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {p.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditUser(p)}
                            className="rounded-md border border-line px-2.5 py-1 font-medium text-ink hover:bg-subtle"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openResetPasswordModal(p)}
                            className="rounded-md border border-accent/40 bg-accent-soft px-2.5 py-1 font-medium text-accent-ink hover:bg-accent/15"
                          >
                            Reset Password
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleUserActive(p.id)}
                            className="rounded-md border border-line px-2.5 py-1 font-medium text-ink-muted hover:bg-subtle hover:text-ink"
                          >
                            {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODERASI MATERI */}
      {activeTab === 'materi' && (
        <div className="rounded-2xl bg-paper p-6 ring-1 ring-line/60">
          <h2 className="font-display text-lg font-semibold text-ink">Moderasi data materi</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Ubah status publikasi materi atau arsipkan materi yang tidak lagi relevan.
          </p>
          <div className="mt-5 space-y-3">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-canvas p-4"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-paper px-2 py-0.5 text-xs font-medium text-ink-muted">
                      {mat.category}
                    </span>
                    <span className="text-xs font-semibold capitalize text-accent">
                      {mat.status}
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-base font-semibold text-ink">
                    {mat.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{mat.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status untuk ${mat.title}`}
                    value={mat.status}
                    onChange={(e) =>
                      void updateMaterialStatus(mat.id, e.target.value as MaterialStatus)
                    }
                    className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void deleteMaterial(mat.id)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-paper hover:text-red-700"
                    aria-label="Hapus materi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN TAMPILAN WEBSITE */}
      {activeTab === 'tampilan' && (
        <form
          onSubmit={handleSaveSettings}
          className="max-w-2xl space-y-5 rounded-2xl bg-paper p-6 ring-1 ring-line/60"
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Pengaturan tampilan website
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Perubahan langsung diterapkan ke seluruh dashboard secara live.
            </p>
          </div>

          <div className="rounded-xl bg-canvas p-4">
            <span className="block text-xs font-medium text-ink">Logo website</span>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <BrandLogo logoUrl={sLogoUrl} siteName={sName || 'ArahDiri'} size="lg" />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle">
                  <Upload className="h-3.5 w-3.5 text-accent" />
                  <span>Unggah logo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>
                {sLogoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSLogoUrl('');
                      setLogoError('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs font-medium text-ink-muted hover:bg-subtle hover:text-ink"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Gunakan ikon bawaan</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-medium text-ink-muted" htmlFor="set-logo-url">
                Atau tempel URL gambar logo (opsional)
              </label>
              <input
                id="set-logo-url"
                type="text"
                value={sLogoUrl.startsWith('data:image/') ? '' : sLogoUrl}
                onChange={(e) => {
                  setLogoError('');
                  setSLogoUrl(e.target.value);
                }}
                placeholder={
                  sLogoUrl.startsWith('data:image/')
                    ? 'Logo berhasil diunggah dari perangkat (klik Simpan untuk menerapkan)'
                    : 'https://contoh.sch.id/logo.png'
                }
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink"
              />
            </div>

            {logoError && <p className="mt-2 text-xs text-red-700">{logoError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="set-name">
              Nama website
            </label>
            <input
              id="set-name"
              type="text"
              required
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="set-tagline">
              Tagline
            </label>
            <input
              id="set-tagline"
              type="text"
              required
              value={sTagline}
              onChange={(e) => setSTagline(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-ink">Warna tema aksen</span>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ACCENT_OPTIONS.map((opt) => {
                const selected = sAccent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSAccent(opt.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-colors ${
                      selected
                        ? 'border-accent bg-accent-soft text-accent-ink'
                        : 'border-line bg-canvas text-ink hover:bg-subtle'
                    }`}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: opt.swatch }}
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={sShowBanner}
              onChange={(e) => setSShowBanner(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span>Tampilkan banner pengumuman aktif di bagian atas halaman</span>
          </label>

          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Simpan pengaturan tampilan
          </button>
        </form>
      )}

      {/* TAB 5: INFORMASI & PENGUMUMAN (Modal CRUD) */}
      {activeTab === 'pengumuman' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Pengumuman global</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Pengumuman aktif otomatis muncul di banner atas dan halaman Beranda siswa.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateAnnouncement}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Buat pengumuman</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map((ann) => (
              <div key={ann.id} className="rounded-2xl bg-paper p-5 ring-1 ring-line/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ann.is_active
                          ? 'bg-accent-soft text-accent-ink'
                          : 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {ann.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink">
                      {ann.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{ann.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditAnnouncement(ann)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-ink"
                      aria-label="Edit pengumuman"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteAnnouncement(ann.id)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-red-700"
                      aria-label="Hapus pengumuman"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT AKUN */}
      <Modal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editUserId ? 'Edit akun pengguna' : 'Tambah akun baru'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="u-name">
              Nama lengkap
            </label>
            <input
              id="u-name"
              type="text"
              required
              value={uName}
              onChange={(e) => setUName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="u-email">
              Email
            </label>
            <input
              id="u-email"
              type="email"
              required
              value={uEmail}
              onChange={(e) => setUEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="u-role">
                Peran
              </label>
              <select
                id="u-role"
                value={uRole}
                onChange={(e) => setURole(e.target.value as UserRole)}
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option value="siswa">Siswa</option>
                <option value="guru_bk">Guru BK</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="u-class">
                Kelas / Unit
              </label>
              <input
                id="u-class"
                type="text"
                value={uClass}
                onChange={(e) => setUClass(e.target.value)}
                placeholder="XI IPA 2 / Tim BK"
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={uActive}
              onChange={(e) => setUActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span>Akun aktif</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {editUserId ? 'Simpan perubahan' : 'Tambah akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESET PASSWORD PENGGUNA (ADMIN) */}
      <Modal
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title="Reset kata sandi pengguna"
        description={
          resetTarget
            ? `Tetapkan kata sandi baru untuk ${resetTarget.full_name} (${resetTarget.email}).`
            : undefined
        }
      >
        <form onSubmit={handleAdminResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="adm-reset-pass">
              Kata sandi baru
            </label>
            <input
              id="adm-reset-pass"
              type="password"
              required
              minLength={6}
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="adm-reset-confirm">
              Konfirmasi kata sandi baru
            </label>
            <input
              id="adm-reset-confirm"
              type="password"
              required
              minLength={6}
              value={resetConfirmVal}
              onChange={(e) => setResetConfirmVal(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          {resetError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
              {resetError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={resetting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {resetting ? 'Menyimpan...' : 'Simpan kata sandi baru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH / EDIT PENGUMUMAN */}
      <Modal
        open={annModalOpen}
        onClose={() => setAnnModalOpen(false)}
        title={editAnnId ? 'Edit pengumuman' : 'Buat pengumuman baru'}
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ann-title">
              Judul pengumuman
            </label>
            <input
              id="ann-title"
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ann-content">
              Isi pengumuman
            </label>
            <textarea
              id="ann-content"
              rows={4}
              required
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={annActive}
              onChange={(e) => setAnnActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span>Tayangkan pengumuman ini</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAnnModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {editAnnId ? 'Simpan perubahan' : 'Terbitkan pengumuman'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
