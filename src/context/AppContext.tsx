import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_DEMO_DB, type DemoDatabase } from '../data/seedData';
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
  Profile,
  ReflectionActivity,
  SiteSettings,
  StudentReflection,
  UserRole,
} from '../types';

const STORAGE_KEY = 'arahdiri_demo_db_v1';
const DEMO_USER_KEY = 'arahdiri_demo_user_id_v1';

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'error';
}

interface AppContextValue {
  mode: 'supabase' | 'demo';
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
  potentialMaps: PotentialMap[];
  futurePlans: FuturePlan[];
  counselorFollowups: CounselorFollowup[];
  consultationInfo: ConsultationInfo[];
  announcements: Announcement[];
  siteSettings: SiteSettings;
  activityLogs: ActivityLog[];

  // Auth & Navigation
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerWithEmail: (input: {
    full_name: string;
    email: string;
    password: string;
    class_name: string;
    role: UserRole;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginDemoByRole: (role: UserRole, targetTab?: string) => void;
  loginDemoById: (profileId: string, targetTab?: string) => void;
  openDashboardTab: (role: UserRole, tab?: string) => void;
  resetDemoData: () => void;

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

function uid(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function loadDemoDb(): DemoDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(INITIAL_DEMO_DB);
    const parsed = JSON.parse(raw) as Partial<DemoDatabase>;
    return {
      ...structuredClone(INITIAL_DEMO_DB),
      ...parsed,
      siteSettings: {
        ...INITIAL_DEMO_DB.siteSettings,
        ...(parsed.siteSettings ?? {}),
      },
    };
  } catch {
    return structuredClone(INITIAL_DEMO_DB);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode: 'supabase' | 'demo' = isSupabaseConfigured ? 'supabase' : 'demo';

  const [db, setDb] = useState<DemoDatabase>(() => loadDemoDb());
  const [loading, setLoading] = useState<boolean>(mode === 'supabase');
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (mode === 'demo') {
      return localStorage.getItem(DEMO_USER_KEY) ?? INITIAL_DEMO_DB.profiles[0]?.id ?? null;
    }
    return null;
  });
  const [view, setView] = useState<AppView>(() => (mode === 'demo' ? 'dashboard' : 'auth'));
  const [activeTab, setActiveTab] = useState<string>('ringkasan');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, tone: 'success' | 'info' | 'error' = 'success') => {
    const id = uid('toast');
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3400);
  };

  // Persist demo DB
  useEffect(() => {
    if (mode === 'demo') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }, [db, mode]);

  useEffect(() => {
    if (mode === 'demo') {
      if (currentUserId) localStorage.setItem(DEMO_USER_KEY, currentUserId);
      else localStorage.removeItem(DEMO_USER_KEY);
    }
  }, [currentUserId, mode]);

  // Apply live accent theme and page title
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', db.siteSettings.accent_color);
    document.title = `${db.siteSettings.site_name} — ${db.siteSettings.tagline}`;
  }, [db.siteSettings]);

  // Load Supabase data if configured
  const refreshSupabaseData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [
        profilesRes,
        materialsRes,
        progressRes,
        activitiesRes,
        reflectionsRes,
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
        supabase.from('potential_maps').select('*'),
        supabase.from('future_plans').select('*').order('created_at', { ascending: false }),
        supabase.from('counselor_followups').select('*').order('updated_at', { ascending: false }),
        supabase.from('consultation_info').select('*'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(60),
      ]);

      setDb((prev) => ({
        profiles: (profilesRes.data as Profile[]) ?? prev.profiles,
        materials: (materialsRes.data as Material[]) ?? prev.materials,
        materialProgress: (progressRes.data as MaterialProgress[]) ?? [],
        reflectionActivities: (activitiesRes.data as ReflectionActivity[]) ?? [],
        studentReflections: (reflectionsRes.data as StudentReflection[]) ?? [],
        potentialMaps: (mapsRes.data as PotentialMap[]) ?? [],
        futurePlans: (plansRes.data as FuturePlan[]) ?? [],
        counselorFollowups: (followupsRes.data as CounselorFollowup[]) ?? [],
        consultationInfo: (consultationRes.data as ConsultationInfo[]) ?? [],
        announcements: (announcementsRes.data as Announcement[]) ?? [],
        siteSettings: (settingsRes.data as SiteSettings) ?? prev.siteSettings,
        activityLogs: (logsRes.data as ActivityLog[]) ?? [],
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== 'supabase' || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const uidSession = data.session?.user.id ?? null;
      setCurrentUserId(uidSession);
      setView(uidSession ? 'dashboard' : 'auth');
      void refreshSupabaseData();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uidSession = session?.user.id ?? null;
      setCurrentUserId(uidSession);
      setView(uidSession ? 'dashboard' : 'auth');
      void refreshSupabaseData();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [mode]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return db.profiles.find((p) => p.id === currentUserId) ?? null;
  }, [db.profiles, currentUserId]);

  const appendLog = async (action: string, module: string, detail: string) => {
    const newLog: ActivityLog = {
      id: uid('log'),
      user_id: currentUser?.id ?? null,
      user_name: currentUser?.full_name ?? 'Pengguna',
      action,
      module,
      detail,
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase && currentUser) {
      await supabase.from('activity_logs').insert({
        user_id: currentUser.id,
        action,
        module,
        detail,
      });
    }
    setDb((prev) => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs].slice(0, 80),
    }));
  };

  // Auth methods
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (mode === 'supabase' && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) return { ok: false, error: error.message };
      setCurrentUserId(data.user.id);
      await refreshSupabaseData();
      setActiveTab('ringkasan');
      setView('dashboard');
      showToast('Berhasil masuk ke dashboard.');
      return { ok: true };
    }

    const found = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return {
        ok: false,
        error: 'Email belum terdaftar di Mode Demo. Gunakan akun demo di bawah atau daftar akun baru.',
      };
    }
    if (!found.is_active) {
      return {
        ok: false,
        error: 'Akun ini sedang dinonaktifkan oleh Admin. Hubungi pengelola sekolah.',
      };
    }
    setCurrentUserId(found.id);
    setActiveTab('ringkasan');
    setView('dashboard');
    showToast(`Masuk sebagai ${found.full_name}.`);
    return { ok: true };
  };

  const registerWithEmail = async (input: {
    full_name: string;
    email: string;
    password: string;
    class_name: string;
    role: UserRole;
  }): Promise<{ ok: boolean; error?: string }> => {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (mode === 'supabase' && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name.trim(),
            class_name: input.class_name.trim(),
            role: input.role,
          },
        },
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        setCurrentUserId(data.user.id);
        await refreshSupabaseData();
        setActiveTab('ringkasan');
        setView('dashboard');
      }
      showToast('Akun berhasil dibuat.');
      return { ok: true };
    }

    if (db.profiles.some((p) => p.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'Email tersebut sudah terdaftar.' };
    }
    const newProfile: Profile = {
      id: uid(input.role === 'siswa' ? 'stu' : input.role === 'guru_bk' ? 'bk' : 'adm'),
      full_name: input.full_name.trim(),
      email: normalizedEmail,
      role: input.role,
      class_name: input.class_name.trim() || (input.role === 'siswa' ? 'XI IPA 1' : 'Staf Sekolah'),
      is_active: true,
      share_activity_consent: false,
      created_at: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      profiles: [newProfile, ...prev.profiles],
      activityLogs: [
        {
          id: uid('log'),
          user_id: newProfile.id,
          user_name: newProfile.full_name,
          action: 'Mendaftar Akun Baru',
          module: 'Autentikasi',
          detail: `Akun baru (${newProfile.role}) dibuat untuk ${newProfile.email}.`,
          created_at: new Date().toISOString(),
        },
        ...prev.activityLogs,
      ],
    }));
    setCurrentUserId(newProfile.id);
    setActiveTab('ringkasan');
    setView('dashboard');
    showToast('Akun baru dibuat dan aktif.');
    return { ok: true };
  };

  const logout = async () => {
    if (mode === 'supabase' && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUserId(null);
    setView('auth');
    showToast('Sesi keluar berhasil.', 'info');
  };

  const loginDemoByRole = (role: UserRole, targetTab = 'ringkasan') => {
    const found = db.profiles.find((p) => p.role === role && p.is_active);
    if (!found) {
      showToast('Tidak ada akun aktif untuk peran tersebut.', 'error');
      return;
    }
    setCurrentUserId(found.id);
    setActiveTab(targetTab);
    setView('dashboard');
    showToast(`Beralih ke ${found.full_name}.`, 'info');
  };

  const loginDemoById = (profileId: string, targetTab = 'ringkasan') => {
    const found = db.profiles.find((p) => p.id === profileId);
    if (!found) return;
    if (!found.is_active) {
      showToast('Akun tersebut sedang dinonaktifkan.', 'error');
      return;
    }
    setCurrentUserId(found.id);
    setActiveTab(targetTab);
    setView('dashboard');
    showToast(`Beralih ke ${found.full_name}.`, 'info');
  };

  const openDashboardTab = (role: UserRole, tab = 'ringkasan') => {
    if (currentUser && currentUser.role === role) {
      setActiveTab(tab);
      setView('dashboard');
      return;
    }
    if (mode === 'demo') {
      loginDemoByRole(role, tab);
    } else {
      setActiveTab(tab);
      setView('auth');
    }
  };

  const resetDemoData = () => {
    const fresh = structuredClone(INITIAL_DEMO_DB);
    setDb(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    showToast('Data demo dikembalikan ke kondisi awal.', 'info');
  };

  // Student Actions
  const toggleMaterialCompleted = async (materialId: string) => {
    if (!currentUser) return;
    const existing = db.materialProgress.find(
      (mp) => mp.student_id === currentUser.id && mp.material_id === materialId
    );
    if (existing) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('material_progress').delete().eq('id', existing.id);
      }
      setDb((prev) => ({
        ...prev,
        materialProgress: prev.materialProgress.filter((mp) => mp.id !== existing.id),
      }));
      showToast('Tanda selesai dibatalkan.', 'info');
    } else {
      const record: MaterialProgress = {
        id: uid('mp'),
        student_id: currentUser.id,
        material_id: materialId,
        completed_at: new Date().toISOString(),
      };
      if (mode === 'supabase' && supabase) {
        const { data } = await supabase
          .from('material_progress')
          .insert({ student_id: currentUser.id, material_id: materialId })
          .select()
          .single();
        if (data) record.id = data.id;
      }
      setDb((prev) => ({
        ...prev,
        materialProgress: [record, ...prev.materialProgress],
      }));
      const mat = db.materials.find((m) => m.id === materialId);
      await appendLog('Menyelesaikan Materi', 'Kenali Diriku', mat?.title ?? materialId);
      showToast('Materi ditandai selesai.');
    }
  };

  const saveReflection = async (input: {
    activity_id: string | null;
    interest_notes: string;
    strength_notes: string;
    reflection_content: string;
  }) => {
    if (!currentUser) return;
    const record: StudentReflection = {
      id: uid('ref'),
      student_id: currentUser.id,
      activity_id: input.activity_id,
      interest_notes: input.interest_notes.trim(),
      strength_notes: input.strength_notes.trim(),
      reflection_content: input.reflection_content.trim(),
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('student_reflections')
        .insert({
          student_id: currentUser.id,
          activity_id: input.activity_id,
          interest_notes: record.interest_notes,
          strength_notes: record.strength_notes,
          reflection_content: record.reflection_content,
        })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      studentReflections: [record, ...prev.studentReflections],
    }));
    await appendLog(
      'Menyimpan Refleksi Diri',
      'Refleksi & Tindak Lanjut',
      `Siswa menyimpan catatan refleksi (${input.activity_id ? 'terkait tugas BK' : 'mandiri'}).`
    );
    showToast('Refleksi tersimpan.');
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
    if (!currentUser) return;
    const existing = db.potentialMaps.find((pm) => pm.student_id === currentUser.id);
    const updated: PotentialMap = {
      id: existing?.id ?? uid('pm'),
      student_id: currentUser.id,
      ...input,
      updated_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      await supabase.from('potential_maps').upsert(
        {
          student_id: currentUser.id,
          ...input,
          updated_at: updated.updated_at,
        },
        { onConflict: 'student_id' }
      );
    }
    setDb((prev) => ({
      ...prev,
      potentialMaps: existing
        ? prev.potentialMaps.map((pm) => (pm.student_id === currentUser.id ? updated : pm))
        : [updated, ...prev.potentialMaps],
    }));
    await appendLog('Memperbarui Peta Potensi', 'Peta Potensi', `Pemetaan 5 dimensi diperbarui.`);
    showToast('Peta potensi diperbarui.');
  };

  const createFuturePlan = async (input: {
    title: string;
    timeframe: PlanTimeframe;
    target_goal: string;
    action_steps: ActionStep[];
  }) => {
    if (!currentUser) return;
    const doneCount = input.action_steps.filter((s) => s.done).length;
    const progress =
      input.action_steps.length > 0
        ? Math.round((doneCount / input.action_steps.length) * 100)
        : 0;
    const record: FuturePlan = {
      id: uid('plan'),
      student_id: currentUser.id,
      title: input.title.trim(),
      timeframe: input.timeframe,
      target_goal: input.target_goal.trim(),
      action_steps: input.action_steps,
      progress,
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('future_plans')
        .insert({
          student_id: currentUser.id,
          title: record.title,
          timeframe: record.timeframe,
          target_goal: record.target_goal,
          action_steps: record.action_steps,
          progress: record.progress,
        })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      futurePlans: [record, ...prev.futurePlans],
    }));
    await appendLog('Menambahkan Rencana Masa Depan', 'Rencana Masa Depan', record.title);
    showToast('Rencana masa depan ditambahkan.');
  };

  const togglePlanStep = async (planId: string, stepId: string) => {
    const plan = db.futurePlans.find((p) => p.id === planId);
    if (!plan) return;
    const nextSteps = plan.action_steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s
    );
    const doneCount = nextSteps.filter((s) => s.done).length;
    const nextProgress =
      nextSteps.length > 0 ? Math.round((doneCount / nextSteps.length) * 100) : 0;

    if (mode === 'supabase' && supabase) {
      await supabase
        .from('future_plans')
        .update({ action_steps: nextSteps, progress: nextProgress })
        .eq('id', planId);
    }
    setDb((prev) => ({
      ...prev,
      futurePlans: prev.futurePlans.map((p) =>
        p.id === planId ? { ...p, action_steps: nextSteps, progress: nextProgress } : p
      ),
    }));
  };

  const deleteFuturePlan = async (planId: string) => {
    if (mode === 'supabase' && supabase) {
      await supabase.from('future_plans').delete().eq('id', planId);
    }
    setDb((prev) => ({
      ...prev,
      futurePlans: prev.futurePlans.filter((p) => p.id !== planId),
    }));
    showToast('Rencana dihapus.', 'info');
  };

  const updatePrivacyConsent = async (consent: boolean) => {
    if (!currentUser) return;
    if (mode === 'supabase' && supabase) {
      await supabase
        .from('profiles')
        .update({ share_activity_consent: consent })
        .eq('id', currentUser.id);
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
    if (editId) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('materials').update(input).eq('id', editId);
      }
      setDb((prev) => ({
        ...prev,
        materials: prev.materials.map((m) => (m.id === editId ? { ...m, ...input } : m)),
      }));
      await appendLog('Memperbarui Materi', 'Materi BK', input.title);
      showToast('Materi diperbarui.');
      return;
    }

    const record: Material = {
      id: uid('mat'),
      ...input,
      author_id: currentUser?.id ?? null,
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('materials')
        .insert({ ...input, author_id: currentUser?.id ?? null })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      materials: [record, ...prev.materials],
    }));
    await appendLog('Menambahkan Materi', 'Materi BK', record.title);
    showToast('Materi disimpan.');
  };

  const updateMaterialStatus = async (id: string, status: MaterialStatus) => {
    if (mode === 'supabase' && supabase) {
      await supabase.from('materials').update({ status }).eq('id', id);
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
    const target = db.materials.find((m) => m.id === id);
    if (mode === 'supabase' && supabase) {
      await supabase.from('materials').delete().eq('id', id);
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
    if (editId) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('reflection_activities').update(input).eq('id', editId);
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
    const record: ReflectionActivity = {
      id: uid('act'),
      ...input,
      created_by: currentUser?.id ?? null,
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('reflection_activities')
        .insert({ ...input, created_by: currentUser?.id ?? null })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      reflectionActivities: [record, ...prev.reflectionActivities],
    }));
    await appendLog('Membuat Kegiatan Refleksi', 'Refleksi BK', record.title);
    showToast('Kegiatan refleksi diterbitkan ke Dashboard Siswa.');
  };

  const deleteReflectionActivity = async (id: string) => {
    if (mode === 'supabase' && supabase) {
      await supabase.from('reflection_activities').delete().eq('id', id);
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
    const record: CounselorFollowup = {
      id: uid('fu'),
      student_id: input.student_id,
      counselor_id: currentUser?.id ?? null,
      guidance_note: input.guidance_note.trim(),
      recommendation: input.recommendation.trim(),
      status: input.status,
      updated_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('counselor_followups')
        .insert({
          student_id: record.student_id,
          counselor_id: record.counselor_id,
          guidance_note: record.guidance_note,
          recommendation: record.recommendation,
          status: record.status,
        })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      counselorFollowups: [record, ...prev.counselorFollowups],
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
    if (editId) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('consultation_info').update(input).eq('id', editId);
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
    const record: ConsultationInfo = { id: uid('ci'), ...input };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase.from('consultation_info').insert(input).select().single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      consultationInfo: [...prev.consultationInfo, record],
    }));
    await appendLog('Menambahkan Info Konsultasi', 'Konsultasi BK', input.counselor_name);
    showToast('Informasi konsultasi ditambahkan.');
  };

  const deleteConsultationInfo = async (id: string) => {
    if (mode === 'supabase' && supabase) {
      await supabase.from('consultation_info').delete().eq('id', id);
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
    if (editId) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('profiles').update(input).eq('id', editId);
      }
      setDb((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === editId ? { ...p, ...input } : p)),
      }));
      await appendLog('Memperbarui Akun', 'Kelola Akun', `${input.full_name} (${input.role})`);
      showToast('Data akun diperbarui.');
      return;
    }
    const record: Profile = {
      id: uid(input.role === 'siswa' ? 'stu' : input.role === 'guru_bk' ? 'bk' : 'adm'),
      ...input,
      share_activity_consent: false,
      created_at: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      profiles: [record, ...prev.profiles],
    }));
    await appendLog('Menambahkan Akun', 'Kelola Akun', `${record.full_name} (${record.role})`);
    showToast('Akun baru ditambahkan.');
  };

  const toggleUserActive = async (id: string) => {
    const target = db.profiles.find((p) => p.id === id);
    if (!target) return;
    const nextActive = !target.is_active;
    if (mode === 'supabase' && supabase) {
      await supabase.from('profiles').update({ is_active: nextActive }).eq('id', id);
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
    const next: SiteSettings = { id: 1, ...input };
    if (mode === 'supabase' && supabase) {
      await supabase.from('site_settings').upsert(next, { onConflict: 'id' });
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
    if (editId) {
      if (mode === 'supabase' && supabase) {
        await supabase.from('announcements').update(input).eq('id', editId);
      }
      setDb((prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) => (a.id === editId ? { ...a, ...input } : a)),
      }));
      await appendLog('Memperbarui Pengumuman', 'Pengumuman', input.title);
      showToast('Pengumuman diperbarui.');
      return;
    }
    const record: Announcement = {
      id: uid('ann'),
      ...input,
      created_by: currentUser?.id ?? null,
      created_at: new Date().toISOString(),
    };
    if (mode === 'supabase' && supabase) {
      const { data } = await supabase
        .from('announcements')
        .insert({ ...input, created_by: currentUser?.id ?? null })
        .select()
        .single();
      if (data) record.id = data.id;
    }
    setDb((prev) => ({
      ...prev,
      announcements: [record, ...prev.announcements],
    }));
    await appendLog('Menerbitkan Pengumuman', 'Pengumuman', record.title);
    showToast('Pengumuman diterbitkan.');
  };

  const deleteAnnouncement = async (id: string) => {
    if (mode === 'supabase' && supabase) {
      await supabase.from('announcements').delete().eq('id', id);
    }
    setDb((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
    showToast('Pengumuman dihapus.', 'info');
  };

  const value: AppContextValue = {
    mode,
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
    potentialMaps: db.potentialMaps,
    futurePlans: db.futurePlans,
    counselorFollowups: db.counselorFollowups,
    consultationInfo: db.consultationInfo,
    announcements: db.announcements,
    siteSettings: db.siteSettings,
    activityLogs: db.activityLogs,
    loginWithEmail,
    registerWithEmail,
    logout,
    loginDemoByRole,
    loginDemoById,
    openDashboardTab,
    resetDemoData,
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
