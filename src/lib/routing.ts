import type { UserRole } from '../types';

export const ROLE_PATH_PREFIX: Record<UserRole, string> = {
  siswa: '/siswa',
  guru_bk: '/guru-bk',
  admin: '/admin',
};

const ROLE_TAB_TO_SLUG: Record<UserRole, Record<string, string>> = {
  siswa: {
    ringkasan: 'beranda',
    materi: 'materi',
    'peta-potensi': 'peta-potensi',
    'rencana-masa-depan': 'rencana-masa-depan',
    refleksi: 'refleksi',
    'privasi-bantuan': 'privasi-bantuan',
  },
  guru_bk: {
    ringkasan: 'ringkasan',
    materi: 'materi',
    'kegiatan-refleksi': 'kegiatan-refleksi',
    'aktivitas-siswa': 'aktivitas-siswa',
    'tindak-lanjut': 'tindak-lanjut',
    konsultasi: 'konsultasi',
  },
  admin: {
    ringkasan: 'ringkasan',
    akun: 'akun',
    materi: 'materi',
    tampilan: 'tampilan',
    pengumuman: 'pengumuman',
  },
};

export function getPathForTab(role: UserRole, tab: string): string {
  const prefix = ROLE_PATH_PREFIX[role];
  const map = ROLE_TAB_TO_SLUG[role];
  const slug = map[tab] ?? map.ringkasan;
  return `${prefix}/${slug}`;
}

export function getDefaultPathForRole(role: UserRole): string {
  return getPathForTab(role, 'ringkasan');
}

export interface ParsedRolePath {
  matchedRole: UserRole | null;
  tab: string | null;
}

export function parsePathname(pathname: string): ParsedRolePath {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const segments = clean.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { matchedRole: null, tab: null };
  }

  const first = `/${segments[0]}`;
  const matchedRole =
    (Object.keys(ROLE_PATH_PREFIX) as UserRole[]).find(
      (r) => ROLE_PATH_PREFIX[r] === first
    ) ?? null;

  if (!matchedRole) {
    return { matchedRole: null, tab: null };
  }

  const slug = segments[1];
  if (!slug) {
    return { matchedRole, tab: 'ringkasan' };
  }

  const map = ROLE_TAB_TO_SLUG[matchedRole];
  const foundTab = Object.keys(map).find((tabKey) => map[tabKey] === slug) ?? null;
  return { matchedRole, tab: foundTab };
}

export function navigateToPath(path: string, replace = false): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === path) return;
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
}
