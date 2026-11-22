import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  getDefaultPathForRole,
  getPathForTab,
  navigateToPath,
  parsePathname,
} from '../lib/routing';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  ActionStep,
  ActivityLog,
  Announcement,
  AppView,
  ConsultationInfo,
  CounselorFollowup,
  FollowupStatus,
  FuturePlan,
  Material,
  MaterialProgress,
  MaterialStatus,
  PlanTimeframe,
  PotentialMap,
  PotentialQuestion,
  Profile,
  ReflectionActivity,
  SiteSettings,
  StudentReflection,
  UserRole,
} from '../types';

interface AppDatabase {
  profiles: Profile[];
  materials: Material[];
  materialProgress: MaterialProgress[];
  reflectionActivities: ReflectionActivity[];
  studentReflections: StudentReflection[];
  potentialQuestions: PotentialQuestion[];
  potentialMaps: PotentialMap[];
  futurePlans: FuturePlan[];
  counselorFollowups: CounselorFollowup[];
  consultationInfo: ConsultationInfo[];
  announcements: Announcement[];
  siteSettings: SiteSettings;
  activityLogs: ActivityLog[];
}

const EMPTY_DB: AppDatabase = {
  siteSettings: {
    id: 1,
    site_name: 'ArahDiri',
    tagline: 'Ruang Bimbingan Konseling dan Pemetaan Potensi Siswa',
    logo_url: null,
    accent_color: 'teal',
    show_announcement_banner: true,
  },
  profiles: [],
  materials: [],
  materialProgress: [],
  reflectionActivities: [],
  studentReflections: [],
  potentialQuestions: [],
  potentialMaps: [],
  futurePlans: [],
  counselorFollowups: [],
  consultationInfo: [],
  announcements: [],
  activityLogs: [],
};

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'error';
}

interface AppContextValue {
  isConfigured: boolean;
  loading: boolean;
  view: AppView;
  setView: (view: AppView) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Profile | null;
  toast: ToastMessage | null;
  showToast: (text: string, tone?: 'success' | 'info' | 'error') => void;

  // Data collections
  profiles: Profile[];
  materials: Material[];
  materialProgress: MaterialProgress[];
  reflectionActivities: ReflectionActivity[];
  studentReflections: StudentReflection[];
  potentialQuestions: PotentialQuestion[];
  potentialQuestionsError: string | null;
  reloadPotentialQuestions: () => Promise<void>;
  potentialMaps: PotentialMap[];
  futurePlans: FuturePlan[];
  counselorFollowups: CounselorFollowup[];
  consultationInfo: ConsultationInfo[];
  announcements: Announcement[];
  siteSettings: SiteSettings;
  activityLogs: ActivityLog[];

  // Auth
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerWithEmail: (input: {
    full_name: string;
    email: string;
    password: string;
    class_name: string;
    role: UserRole;
  }) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  adminResetUserPassword: (
    targetUserId: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Student Actions
  toggleMaterialCompleted: (materialId: string) => Promise<void>;
  saveReflection: (input: {
    activity_id: string | null;
    interest_notes: string;
    strength_notes: string;
    reflection_content: string;
  }) => Promise<void>;
  savePotentialMap: (input: {
    academic_score: number;
    social_score: number;
    creative_score: number;
    leadership_score: number;
    technical_score: number;
    top_strengths: string;
    top_interests: string;
  }) => Promise<void>;
  createFuturePlan: (input: {
    title: string;
    timeframe: PlanTimeframe;
    target_goal: string;
    action_steps: ActionStep[];
  }) => Promise<void>;
  togglePlanStep: (planId: string, stepId: string) => Promise<void>;
  deleteFuturePlan: (planId: string) => Promise<void>;
  updatePrivacyConsent: (consent: boolean) => Promise<void>;

  // Counselor Actions
  saveMaterial: (
    input: Omit<Material, 'id' | 'created_at' | 'author_id'>,
    editId?: string
  ) => Promise<void>;
  updateMaterialStatus: (id: string, status: MaterialStatus) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  saveReflectionActivity: (
    input: { title: string; prompt: string; due_date: string; is_active: boolean },
    editId?: string
  ) => Promise<void>;
  deleteReflectionActivity: (id: string) => Promise<void>;
  saveFollowup: (input: {
    student_id: string;
    guidance_note: string;
    recommendation: string;
    status: FollowupStatus;
  }) => Promise<void>;
  saveConsultationInfo: (
    input: Omit<ConsultationInfo, 'id'>,
    editId?: string
  ) => Promise<void>;
  deleteConsultationInfo: (id: string) => Promise<void>;

  // Admin Actions
  saveUserAccount: (
    input: {
      full_name: string;
      email: string;
      role: UserRole;
      class_name: string;
      is_active: boolean;
    },
    editId?: string
  ) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  updateSiteSettings: (input: Omit<SiteSettings, 'id'>) => Promise<void>;
  saveAnnouncement: (
    input: { title: string; content: string; is_active: boolean },
    editId?: string
  ) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function toastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function profileFromAuthUser(user: User): Profile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawRole = meta.role;
  const role: UserRole =
    rawRole === 'admin' || rawRole === 'guru_bk' || rawRole === 'siswa' ? rawRole : 'siswa';
  const email = user.email ?? '';
  const fullName =
    typeof meta.full_name === 'string' && meta.full_name.trim()
      ? meta.full_name.trim()
      : email.split('@')[0] || 'Pengguna';
  const className =
    typeof meta.class_name === 'string' && meta.class_name.trim()
      ? meta.class_name.trim()
      : role === 'siswa'
        ? 'XI IPA 1'
        : 'Staf Sekolah';

  return {
    id: user.id,
    full_name: fullName,
    email,
    role,
    class_name: className,
    is_active: true,
    share_activity_consent: false,
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(EMPTY_DB);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('auth');
  const [activeTab, setActiveTabState] = useState<string>('ringkasan');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [potentialQuestionsError, setPotentialQuestionsError] = useState<string | null>(null);

  const showToast = useCallback((text: string, tone: 'success' | 'info' | 'error' = 'success') => {
    const id = toastId();
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3600);
  }, []);

  // Apply live accent theme, page title, and favicon
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', db.siteSettings.accent_color);
    document.title = `${db.siteSettings.site_name} — ${db.siteSettings.tagline}`;

    const logoUrl = db.siteSettings.logo_url?.trim();
    if (logoUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logoUrl;
    }
  }, [db.siteSettings]);

  // Load all data from Supabase
  const refreshSupabaseData = async (sessionUser?: User | null) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const sessionUserId = sessionUser?.id ?? null;
    setLoading(true);
    try {
      // Before login, only load public site_settings (avoid querying private tables while unauthenticated)
      if (!sessionUserId) {
        const settingsRes = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        setDb((prev) => ({
          ...EMPTY_DB,
          siteSettings: (settingsRes.data as SiteSettings) ?? prev.siteSettings,
        }));
        return;
      }

      const [
        profilesRes,
        materialsRes,
        progressRes,
        activitiesRes,
        reflectionsRes,
        questionsRes,
        mapsRes,
        plansRes,
        followupsRes,
        consultationRes,
        announcementsRes,
        settingsRes,
        logsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('materials').select('*').order('created_at', { ascending: false }),
        supabase.from('material_progress').select('*'),
        supabase.from('reflection_activities').select('*').order('due_date', { ascending: true }),
        supabase.from('student_reflections').select('*').order('created_at', { ascending: false }),
        supabase
          .from('potential_questions')
          .select('*')
          .order('question_number', { ascending: true }),
        supabase.from('potential_maps').select('*'),
        supabase.from('future_plans').select('*').order('created_at', { ascending: false }),
        supabase.from('counselor_followups').select('*').order('updated_at', { ascending: false }),
        supabase.from('consultation_info').select('*'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(60),
      ]);

      let profiles = (profilesRes.data as Profile[]) ?? [];

      // Ensure active user's own profile exists in public.profiles
      if (sessionUser && sessionUserId && !profiles.some((p) => p.id === sessionUserId)) {
        const ownRes = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUserId)
          .maybeSingle();

        if (ownRes.data) {
          profiles = [ownRes.data as Profile, ...profiles];
        } else {
          // Self-heal missing profile row (e.g. user created manually before trigger existed)
          const fallback = profileFromAuthUser(sessionUser);
          const inserted = await supabase
            .from('profiles')
            .upsert(
              {
                id: fallback.id,
                full_name: fallback.full_name,
                email: fallback.email,
                role: fallback.role,
                class_name: fallback.class_name,
              },
              { onConflict: 'id' }
            )
            .select()
            .single();
          profiles = [(inserted.data as Profile) ?? fallback, ...profiles];
        }
      }

      const profileNameMap = new Map(profiles.map((p) => [p.id, p.full_name]));
      const rawLogs = (logsRes.data as ActivityLog[]) ?? [];
      const enrichedLogs = rawLogs.map((log) => ({
        ...log,
        user_name: log.user_name ?? (log.user_id ? profileNameMap.get(log.user_id) : undefined),
      }));

      if (questionsRes.error) {
        setPotentialQuestionsError(
          `${questionsRes.error.code ?? ''} ${questionsRes.error.message}`.trim()
        );
      } else {
        setPotentialQuestionsError(null);
      }

      const activeQuestions = ((questionsRes.data as PotentialQuestion[]) ?? []).filter(
        (q) => q.is_active !== false
      );

      setDb((prev) => ({
        profiles,
        materials: (materialsRes.data as Material[]) ?? [],
        materialProgress: (progressRes.data as MaterialProgress[]) ?? [],
        reflectionActivities: (activitiesRes.data as ReflectionActivity[]) ?? [],
        studentReflections: (reflectionsRes.data as StudentReflection[]) ?? [],
        potentialQuestions: activeQuestions,
        potentialMaps: (mapsRes.data as PotentialMap[]) ?? [],
        futurePlans: (plansRes.data as FuturePlan[]) ?? [],
        counselorFollowups: (followupsRes.data as CounselorFollowup[]) ?? [],
        consultationInfo: (consultationRes.data as ConsultationInfo[]) ?? [],
        announcements: (announcementsRes.data as Announcement[]) ?? [],
        siteSettings: (settingsRes.data as SiteSettings) ?? prev.siteSettings,
        activityLogs: enrichedLogs,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setAuthUser(user);
      setCurrentUserId(user?.id ?? null);
      setView(user ? 'dashboard' : 'auth');
      void refreshSupabaseData(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      setCurrentUserId(user?.id ?? null);
      setView(user ? 'dashboard' : 'auth');
      void refreshSupabaseData(user);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    const fromDb = db.profiles.find((p) => p.id === currentUserId);
    if (fromDb) return fromDb;
    if (authUser && authUser.id === currentUserId) {
      return profileFromAuthUser(authUser);
    }
    return null;
  }, [db.profiles, currentUserId, authUser]);

  const setActiveTab = useCallback(
    (tab: string) => {
      setActiveTabState(tab);
      if (currentUser) {
        navigateToPath(getPathForTab(currentUser.role, tab), false);
      }
    },
    [currentUser]
  );

  // Role-based route guard & browser Back/Forward synchronization
  useEffect(() => {
    if (loading) return;

    const enforceRouteForCurrentState = () => {
      const pathname = window.location.pathname;

      if (!currentUser || view === 'auth') {
        if (pathname !== '/login') {
          navigateToPath('/login', true);
        }
        return;
      }

      const parsed = parsePathname(pathname);

      // Block access to another role's path
      if (parsed.matchedRole && parsed.matchedRole !== currentUser.role) {
        const safePath = getDefaultPathForRole(currentUser.role);
        setActiveTabState('ringkasan');
        navigateToPath(safePath, true);
        showToast('Akses ditolak: halaman tersebut bukan untuk peran Anda.', 'error');
        return;
      }

      // Valid path for current user's role
      if (parsed.matchedRole === currentUser.role && parsed.tab) {
        setActiveTabState(parsed.tab);
        const canonical = getPathForTab(currentUser.role, parsed.tab);
        if (pathname !== canonical) {
          navigateToPath(canonical, true);
        }
        return;
      }

      // Root, /login, or unknown slug -> redirect to user's own role path
      const targetPath = getPathForTab(currentUser.role, activeTab);
      navigateToPath(targetPath, true);
    };

    enforceRouteForCurrentState();

    const onPopState = () => {
      enforceRouteForCurrentState();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [loading, currentUser, view, showToast]);

  const appendLog = async (action: string, module: string, detail: string) => {
    if (!supabase || !currentUser) return;
    const { data } = await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        action,
        module,
        detail,
      })
      .select()
      .single();

    if (data) {
      const inserted: ActivityLog = {
        ...(data as ActivityLog),
        user_name: currentUser.full_name,
      };
      setDb((prev) => ({
        ...prev,
        activityLogs: [inserted, ...prev.activityLogs].slice(0, 80),
      }));
    }
  };

  const reloadPotentialQuestions = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('potential_questions')
      .select('*')
      .order('question_number', { ascending: true });
    if (error) {
      setPotentialQuestionsError(`${error.code ?? ''} ${error.message}`.trim());
      showToast(`Gagal memuat pertanyaan: ${error.message}`, 'error');
      return;
    }
    setPotentialQuestionsError(null);
    const activeQuestions = ((data as PotentialQuestion[]) ?? []).filter(
      (q) => q.is_active !== false
    );
    setDb((prev) => ({ ...prev, potentialQuestions: activeQuestions }));
    showToast(`${activeQuestions.length} pertanyaan berhasil dimuat dari database.`);
  };

  // Auth methods (Supabase Auth only)
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) {
      return {
        ok: false,
        error: 'Supabase belum terkonfigurasi. Lengkapi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.',
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) return { ok: false, error: error.message };

    // Verify account is active
    const profileRes = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileRes.data && !(profileRes.data as Profile).is_active) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: 'Akun ini sedang dinonaktifkan oleh Admin. Hubungi pengelola sekolah.',
      };
    }

    const resolvedRole: UserRole =
      (profileRes.data as Profile | null)?.role ?? profileFromAuthUser(data.user).role;
    setAuthUser(data.user);
    setCurrentUserId(data.user.id);
    await refreshSupabaseData(data.user);
    setActiveTabState('ringkasan');
    setView('dashboard');
    navigateToPath(getDefaultPathForRole(resolvedRole), true);
    showToast('Berhasil masuk ke dashboard.');
    return { ok: true };
  };

  const registerWithEmail = async (input: {
    full_name: string;
    email: string;
    password: string;
    class_name: string;
    role: UserRole;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) {
      return {
        ok: false,
        error: 'Supabase belum terkonfigurasi. Lengkapi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.',
      };
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name.trim(),
          class_name: input.class_name.trim() || (input.role === 'siswa' ? 'XI IPA 1' : 'Staf Sekolah'),
          role: input.role,
        },
      },
    });
    if (error) return { ok: false, error: error.message };

    if (!data.session) {
      showToast(
        'Akun terdaftar. Cek email untuk konfirmasi atau matikan Confirm email di Supabase Auth.',
        'info'
      );
      return { ok: true };
    }

    if (data.user) {
      setAuthUser(data.user);
      setCurrentUserId(data.user.id);
      await refreshSupabaseData(data.user);
      setActiveTabState('ringkasan');
      setView('dashboard');
      navigateToPath(getDefaultPathForRole(input.role), true);
    }
    showToast('Akun berhasil dibuat.');
    return { ok: true };
  };

  const changePassword = async (
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) {
      return { ok: false, error: 'Koneksi Supabase tidak tersedia.' };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: 'Kata sandi baru minimal 6 karakter.' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { ok: false, error: error.message };
    }
    await appendLog('Mengubah Kata Sandi', 'Keamanan Akun', 'Pengguna memperbarui kata sandi akunnya sendiri.');
    showToast('Kata sandi berhasil diperbarui.');
    return { ok: true };
  };

  const adminResetUserPassword = async (
    targetUserId: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) {
      return { ok: false, error: 'Koneksi Supabase tidak tersedia.' };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: 'Kata sandi baru minimal 6 karakter.' };
    }
    const { error } = await supabase.rpc('admin_reset_user_password', {
      target_user_id: targetUserId,
      new_password: newPassword,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const target = db.profiles.find((p) => p.id === targetUserId);
    await appendLog(
      'Mereset Kata Sandi Pengguna',
      'Kelola Akun',
      `Admin mereset kata sandi untuk ${target?.full_name ?? targetUserId}.`
    );
    showToast(`Kata sandi ${target?.full_name ?? 'pengguna'} berhasil diubah.`);
    return { ok: true };
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setCurrentUserId(null);
    setView('auth');
    setActiveTabState('ringkasan');
    navigateToPath('/login', true);
    showToast('Sesi keluar berhasil.', 'info');
  };

  // Student Actions
  const toggleMaterialCompleted = async (materialId: string) => {
    if (!supabase || !currentUser) return;
    const existing = db.materialProgress.find(
      (mp) => mp.student_id === currentUser.id && mp.material_id === materialId
    );
    if (existing) {
      const { error } = await supabase.from('material_progress').delete().eq('id', existing.id);
      if (error) {
        showToast(`Gagal membatalkan status materi: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        materialProgress: prev.materialProgress.filter((mp) => mp.id !== existing.id),
      }));
      showToast('Tanda selesai dibatalkan.', 'info');
    } else {
      const { data, error } = await supabase
        .from('material_progress')
        .insert({ student_id: currentUser.id, material_id: materialId })
        .select()
        .single();
      if (error || !data) {
        showToast(`Gagal menandai selesai: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        materialProgress: [data as MaterialProgress, ...prev.materialProgress],
      }));
      const mat = db.materials.find((m) => m.id === materialId);
      await appendLog('Menyelesaikan Materi', 'Katalog Materi', mat?.title ?? materialId);
      showToast('Materi ditandai selesai.');
    }
  };

  const saveReflection = async (input: {
    activity_id: string | null;
    interest_notes: string;
    strength_notes: string;
    reflection_content: string;
  }) => {
    if (!supabase || !currentUser) return;
    const { data, error } = await supabase
      .from('student_reflections')
      .insert({
        student_id: currentUser.id,
        activity_id: input.activity_id,
        interest_notes: input.interest_notes.trim(),
        strength_notes: input.strength_notes.trim(),
        reflection_content: input.reflection_content.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menyimpan refleksi: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    setDb((prev) => ({
      ...prev,
      studentReflections: [data as StudentReflection, ...prev.studentReflections],
    }));
    await appendLog(
      'Menyimpan Refleksi Diri',
      'Refleksi & Tindak Lanjut',
      `Siswa menyimpan catatan refleksi (${input.activity_id ? 'terkait tugas BK' : 'mandiri'}).`
    );
    showToast('Refleksi tersimpan ke database.');
  };

  const savePotentialMap = async (input: {
    academic_score: number;
    social_score: number;
    creative_score: number;
    leadership_score: number;
    technical_score: number;
    top_strengths: string;
    top_interests: string;
  }) => {
    if (!supabase || !currentUser) {
      showToast('Koneksi database tidak tersedia.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('potential_maps')
      .upsert(
        {
          student_id: currentUser.id,
          academic_score: input.academic_score,
          social_score: input.social_score,
          creative_score: input.creative_score,
          leadership_score: input.leadership_score,
          technical_score: input.technical_score,
          top_strengths: input.top_strengths.trim(),
          top_interests: input.top_interests.trim(),
          updated_at: now,
        },
        { onConflict: 'student_id' }
      )
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menyimpan Peta Potensi: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    const saved = data as PotentialMap;
    setDb((prev) => {
      const exists = prev.potentialMaps.some((pm) => pm.student_id === currentUser.id);
      return {
        ...prev,
        potentialMaps: exists
          ? prev.potentialMaps.map((pm) => (pm.student_id === currentUser.id ? saved : pm))
          : [saved, ...prev.potentialMaps],
      };
    });

    await appendLog(
      'Menyimpan Peta Potensi',
      'Peta Potensi',
      `Hasil kuesioner 5 dimensi disimpan (Akademik ${saved.academic_score}, Sosial ${saved.social_score}, Kreatif ${saved.creative_score}, Kepemimpinan ${saved.leadership_score}, Teknis ${saved.technical_score}).`
    );
    showToast('Peta potensi berhasil disimpan ke database.');
  };

  const createFuturePlan = async (input: {
    title: string;
    timeframe: PlanTimeframe;
    target_goal: string;
    action_steps: ActionStep[];
  }) => {
    if (!supabase || !currentUser) return;
    const doneCount = input.action_steps.filter((s) => s.done).length;
    const progress =
      input.action_steps.length > 0
        ? Math.round((doneCount / input.action_steps.length) * 100)
        : 0;

    const { data, error } = await supabase
      .from('future_plans')
      .insert({
        student_id: currentUser.id,
        title: input.title.trim(),
        timeframe: input.timeframe,
        target_goal: input.target_goal.trim(),
        action_steps: input.action_steps,
        progress,
      })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menyimpan rencana: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    const record = data as FuturePlan;
    setDb((prev) => ({
      ...prev,
      futurePlans: [record, ...prev.futurePlans],
    }));
    await appendLog('Menambahkan Rencana Masa Depan', 'Rencana Masa Depan', record.title);
    showToast('Rencana masa depan ditambahkan.');
  };

  const togglePlanStep = async (planId: string, stepId: string) => {
    if (!supabase) return;
    const plan = db.futurePlans.find((p) => p.id === planId);
    if (!plan) return;
    const nextSteps = plan.action_steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s
    );
    const doneCount = nextSteps.filter((s) => s.done).length;
    const nextProgress =
      nextSteps.length > 0 ? Math.round((doneCount / nextSteps.length) * 100) : 0;

    const { error } = await supabase
      .from('future_plans')
      .update({ action_steps: nextSteps, progress: nextProgress })
      .eq('id', planId);

    if (error) {
      showToast(`Gagal memperbarui langkah aksi: ${error.message}`, 'error');
      return;
    }

    setDb((prev) => ({
      ...prev,
      futurePlans: prev.futurePlans.map((p) =>
        p.id === planId ? { ...p, action_steps: nextSteps, progress: nextProgress } : p
      ),
    }));
  };

  const deleteFuturePlan = async (planId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('future_plans').delete().eq('id', planId);
    if (error) {
      showToast(`Gagal menghapus rencana: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      futurePlans: prev.futurePlans.filter((p) => p.id !== planId),
    }));
    showToast('Rencana dihapus.', 'info');
  };

  const updatePrivacyConsent = async (consent: boolean) => {
    if (!supabase || !currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ share_activity_consent: consent })
      .eq('id', currentUser.id);

    if (error) {
      showToast(`Gagal memperbarui privasi: ${error.message}`, 'error');
      return;
    }

    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === currentUser.id ? { ...p, share_activity_consent: consent } : p
      ),
    }));
    await appendLog(
      'Mengubah Persetujuan Privasi',
      'Privasi & Bantuan',
      consent
        ? 'Siswa mengaktifkan izin berbagi ringkasan aktivitas ke Guru BK.'
        : 'Siswa menonaktifkan izin berbagi ringkasan aktivitas ke Guru BK.'
    );
    showToast(
      consent
        ? 'Ringkasan aktivitas kini dapat dilihat Guru BK.'
        : 'Data aktivitas dikunci hanya untuk dirimu sendiri.'
    );
  };

  // Counselor Actions
  const saveMaterial = async (
    input: Omit<Material, 'id' | 'created_at' | 'author_id'>,
    editId?: string
  ) => {
    if (!supabase) return;
    if (editId) {
      const { error } = await supabase.from('materials').update(input).eq('id', editId);
      if (error) {
        showToast(`Gagal memperbarui materi: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        materials: prev.materials.map((m) => (m.id === editId ? { ...m, ...input } : m)),
      }));
      await appendLog('Memperbarui Materi', 'Materi BK', input.title);
      showToast('Materi diperbarui.');
      return;
    }

    const { data, error } = await supabase
      .from('materials')
      .insert({ ...input, author_id: currentUser?.id ?? null })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menyimpan materi: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    const record = data as Material;
    setDb((prev) => ({
      ...prev,
      materials: [record, ...prev.materials],
    }));
    await appendLog('Menambahkan Materi', 'Materi BK', record.title);
    showToast('Materi disimpan.');
  };

  const updateMaterialStatus = async (id: string, status: MaterialStatus) => {
    if (!supabase) return;
    const { error } = await supabase.from('materials').update({ status }).eq('id', id);
    if (error) {
      showToast(`Gagal mengubah status materi: ${error.message}`, 'error');
      return;
    }
    const target = db.materials.find((m) => m.id === id);
    setDb((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
    await appendLog('Mengubah Status Materi', 'Materi BK', `${target?.title ?? id} -> ${status}`);
    showToast(`Status materi diubah menjadi ${status}.`);
  };

  const deleteMaterial = async (id: string) => {
    if (!supabase) return;
    const target = db.materials.find((m) => m.id === id);
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus materi: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
    await appendLog('Menghapus Materi', 'Materi BK', target?.title ?? id);
    showToast('Materi dihapus.', 'info');
  };

  const saveReflectionActivity = async (
    input: { title: string; prompt: string; due_date: string; is_active: boolean },
    editId?: string
  ) => {
    if (!supabase) return;
    if (editId) {
      const { error } = await supabase
        .from('reflection_activities')
        .update(input)
        .eq('id', editId);
      if (error) {
        showToast(`Gagal memperbarui kegiatan: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        reflectionActivities: prev.reflectionActivities.map((a) =>
          a.id === editId ? { ...a, ...input } : a
        ),
      }));
      await appendLog('Memperbarui Kegiatan Refleksi', 'Refleksi BK', input.title);
      showToast('Kegiatan refleksi diperbarui.');
      return;
    }

    const { data, error } = await supabase
      .from('reflection_activities')
      .insert({ ...input, created_by: currentUser?.id ?? null })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal membuat kegiatan: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    const record = data as ReflectionActivity;
    setDb((prev) => ({
      ...prev,
      reflectionActivities: [record, ...prev.reflectionActivities],
    }));
    await appendLog('Membuat Kegiatan Refleksi', 'Refleksi BK', record.title);
    showToast('Kegiatan refleksi diterbitkan ke Dashboard Siswa.');
  };

  const deleteReflectionActivity = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('reflection_activities').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus kegiatan: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      reflectionActivities: prev.reflectionActivities.filter((a) => a.id !== id),
    }));
    showToast('Kegiatan refleksi dihapus.', 'info');
  };

  const saveFollowup = async (input: {
    student_id: string;
    guidance_note: string;
    recommendation: string;
    status: FollowupStatus;
  }) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('counselor_followups')
      .insert({
        student_id: input.student_id,
        counselor_id: currentUser?.id ?? null,
        guidance_note: input.guidance_note.trim(),
        recommendation: input.recommendation.trim(),
        status: input.status,
      })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal mengirim arahan: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    setDb((prev) => ({
      ...prev,
      counselorFollowups: [data as CounselorFollowup, ...prev.counselorFollowups],
    }));
    const student = db.profiles.find((p) => p.id === input.student_id);
    await appendLog(
      'Mengirim Arahan & Tindak Lanjut',
      'Pendampingan BK',
      `Arahan untuk ${student?.full_name ?? input.student_id} (status: ${input.status}).`
    );
    showToast('Arahan dan tindak lanjut dikirim ke siswa.');
  };

  const saveConsultationInfo = async (
    input: Omit<ConsultationInfo, 'id'>,
    editId?: string
  ) => {
    if (!supabase) return;
    if (editId) {
      const { error } = await supabase.from('consultation_info').update(input).eq('id', editId);
      if (error) {
        showToast(`Gagal memperbarui jadwal: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        consultationInfo: prev.consultationInfo.map((c) =>
          c.id === editId ? { ...c, ...input } : c
        ),
      }));
      await appendLog('Memperbarui Info Konsultasi', 'Konsultasi BK', input.counselor_name);
      showToast('Jadwal konsultasi diperbarui.');
      return;
    }

    const { data, error } = await supabase
      .from('consultation_info')
      .insert(input)
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menambahkan jadwal: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    setDb((prev) => ({
      ...prev,
      consultationInfo: [...prev.consultationInfo, data as ConsultationInfo],
    }));
    await appendLog('Menambahkan Info Konsultasi', 'Konsultasi BK', input.counselor_name);
    showToast('Informasi konsultasi ditambahkan.');
  };

  const deleteConsultationInfo = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('consultation_info').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus jadwal: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      consultationInfo: prev.consultationInfo.filter((c) => c.id !== id),
    }));
    showToast('Jadwal konsultasi dihapus.', 'info');
  };

  // Admin Actions
  const saveUserAccount = async (
    input: {
      full_name: string;
      email: string;
      role: UserRole;
      class_name: string;
      is_active: boolean;
    },
    editId?: string
  ) => {
    if (!supabase) return;
    if (editId) {
      const { error } = await supabase.from('profiles').update(input).eq('id', editId);
      if (error) {
        showToast(`Gagal memperbarui akun: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === editId ? { ...p, ...input } : p)),
      }));
      await appendLog('Memperbarui Akun', 'Kelola Akun', `${input.full_name} (${input.role})`);
      showToast('Data akun diperbarui.');
      return;
    }

    showToast(
      'Akun baru dibuat melalui halaman Daftar Akun Baru atau Supabase Authentication → Users agar memiliki kredensial login.',
      'info'
    );
  };

  const toggleUserActive = async (id: string) => {
    if (!supabase) return;
    const target = db.profiles.find((p) => p.id === id);
    if (!target) return;
    const nextActive = !target.is_active;
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: nextActive })
      .eq('id', id);
    if (error) {
      showToast(`Gagal mengubah status akun: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, is_active: nextActive } : p)),
    }));
    await appendLog(
      nextActive ? 'Mengaktifkan Akun' : 'Menonaktifkan Akun',
      'Kelola Akun',
      target.full_name
    );
    showToast(nextActive ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.', 'info');
  };

  const updateSiteSettings = async (input: Omit<SiteSettings, 'id'>) => {
    if (!supabase) return;
    const next: SiteSettings = { id: 1, ...input };
    const { error } = await supabase
      .from('site_settings')
      .upsert(next, { onConflict: 'id' });
    if (error) {
      showToast(`Gagal menyimpan pengaturan: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      siteSettings: next,
    }));
    await appendLog(
      'Mengubah Pengaturan Tampilan',
      'Pengaturan Website',
      `${next.site_name} (aksen: ${next.accent_color})`
    );
    showToast('Pengaturan tampilan diterapkan.');
  };

  const saveAnnouncement = async (
    input: { title: string; content: string; is_active: boolean },
    editId?: string
  ) => {
    if (!supabase) return;
    if (editId) {
      const { error } = await supabase.from('announcements').update(input).eq('id', editId);
      if (error) {
        showToast(`Gagal memperbarui pengumuman: ${error.message}`, 'error');
        return;
      }
      setDb((prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) => (a.id === editId ? { ...a, ...input } : a)),
      }));
      await appendLog('Memperbarui Pengumuman', 'Pengumuman', input.title);
      showToast('Pengumuman diperbarui.');
      return;
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({ ...input, created_by: currentUser?.id ?? null })
      .select()
      .single();

    if (error || !data) {
      showToast(`Gagal menerbitkan pengumuman: ${error?.message ?? 'Terjadi kesalahan.'}`, 'error');
      return;
    }

    const record = data as Announcement;
    setDb((prev) => ({
      ...prev,
      announcements: [record, ...prev.announcements],
    }));
    await appendLog('Menerbitkan Pengumuman', 'Pengumuman', record.title);
    showToast('Pengumuman diterbitkan.');
  };

  const deleteAnnouncement = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus pengumuman: ${error.message}`, 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
    showToast('Pengumuman dihapus.', 'info');
  };

  const value: AppContextValue = {
    isConfigured: isSupabaseConfigured,
    loading,
    view,
    setView,
    activeTab,
    setActiveTab,
    currentUser,
    toast,
    showToast,
    profiles: db.profiles,
    materials: db.materials,
    materialProgress: db.materialProgress,
    reflectionActivities: db.reflectionActivities,
    studentReflections: db.studentReflections,
    potentialQuestions: db.potentialQuestions,
    potentialQuestionsError,
    reloadPotentialQuestions,
    potentialMaps: db.potentialMaps,
    futurePlans: db.futurePlans,
    counselorFollowups: db.counselorFollowups,
    consultationInfo: db.consultationInfo,
    announcements: db.announcements,
    siteSettings: db.siteSettings,
    activityLogs: db.activityLogs,
    loginWithEmail,
    registerWithEmail,
    changePassword,
    adminResetUserPassword,
    logout,
    toggleMaterialCompleted,
    saveReflection,
    savePotentialMap,
    createFuturePlan,
    togglePlanStep,
    deleteFuturePlan,
    updatePrivacyConsent,
    saveMaterial,
    updateMaterialStatus,
    deleteMaterial,
    saveReflectionActivity,
    deleteReflectionActivity,
    saveFollowup,
    saveConsultationInfo,
    deleteConsultationInfo,
    saveUserAccount,
    toggleUserActive,
    updateSiteSettings,
    saveAnnouncement,
    deleteAnnouncement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
