import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Compass,
  HelpCircle,
  LayoutDashboard,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { PotentialRadarChart } from '../../components/common/PotentialRadarChart';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import { StatCard } from '../../components/common/StatCard';
import {
  DashboardLayout,
  type DashboardNavItem,
} from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import type { ActionStep, FollowupStatus, PlanTimeframe } from '../../types';

const STUDENT_NAV: DashboardNavItem[] = [
  { id: 'ringkasan', label: 'Beranda', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'kenali-diriku', label: 'Kenali Diriku', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'peta-potensi', label: 'Peta Potensi', icon: <Compass className="h-4 w-4" /> },
  { id: 'rencana-masa-depan', label: 'Rencana Masa Depan', icon: <Target className="h-4 w-4" /> },
  {
    id: 'refleksi',
    label: 'Refleksi dan Tindak Lanjut',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  { id: 'privasi-bantuan', label: 'Privasi dan Bantuan', icon: <ShieldCheck className="h-4 w-4" /> },
];

const TIMEFRAME_LABELS: Record<PlanTimeframe, string> = {
  jangka_pendek: 'Jangka Pendek',
  jangka_menengah: 'Jangka Menengah',
  jangka_panjang: 'Jangka Panjang',
};

const FOLLOWUP_BADGE: Record<FollowupStatus, string> = {
  menunggu: 'bg-amber-50 text-amber-800 border-amber-200',
  pendampingan: 'bg-accent-soft text-accent-ink border-accent/30',
  selesai: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    materials,
    materialProgress,
    reflectionActivities,
    studentReflections,
    potentialMaps,
    futurePlans,
    counselorFollowups,
    consultationInfo,
    announcements,
    toggleMaterialCompleted,
    saveReflection,
    savePotentialMap,
    createFuturePlan,
    togglePlanStep,
    deleteFuturePlan,
    updatePrivacyConsent,
  } = useApp();

  const studentId = currentUser?.id ?? '';

  const publishedMaterials = useMemo(
    () => materials.filter((m) => m.status === 'published'),
    [materials]
  );
  const completedIds = useMemo(
    () =>
      new Set(
        materialProgress.filter((mp) => mp.student_id === studentId).map((mp) => mp.material_id)
      ),
    [materialProgress, studentId]
  );
  const myReflections = useMemo(
    () => studentReflections.filter((r) => r.student_id === studentId),
    [studentReflections, studentId]
  );
  const myPlans = useMemo(
    () => futurePlans.filter((p) => p.student_id === studentId),
    [futurePlans, studentId]
  );
  const myFollowups = useMemo(
    () => counselorFollowups.filter((f) => f.student_id === studentId),
    [counselorFollowups, studentId]
  );
  const myMap = useMemo(
    () => potentialMaps.find((pm) => pm.student_id === studentId),
    [potentialMaps, studentId]
  );
  const activeActivities = useMemo(
    () => reflectionActivities.filter((a) => a.is_active),
    [reflectionActivities]
  );

  // Kenali Diriku state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [readingMaterialId, setReadingMaterialId] = useState<string>(
    publishedMaterials[0]?.id ?? ''
  );

  const categories = useMemo(
    () => ['Semua', ...Array.from(new Set(publishedMaterials.map((m) => m.category)))],
    [publishedMaterials]
  );

  const filteredMaterials = useMemo(() => {
    return publishedMaterials.filter((m) => {
      const matchCat = selectedCategory === 'Semua' || m.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [publishedMaterials, selectedCategory, searchQuery]);

  const readingMaterial =
    filteredMaterials.find((m) => m.id === readingMaterialId) ?? filteredMaterials[0];

  // Peta Potensi state
  const [scores, setScores] = useState({
    academic_score: myMap?.academic_score ?? 75,
    social_score: myMap?.social_score ?? 75,
    creative_score: myMap?.creative_score ?? 75,
    leadership_score: myMap?.leadership_score ?? 70,
    technical_score: myMap?.technical_score ?? 70,
    top_strengths: myMap?.top_strengths ?? '',
    top_interests: myMap?.top_interests ?? '',
  });

  useEffect(() => {
    setScores({
      academic_score: myMap?.academic_score ?? 75,
      social_score: myMap?.social_score ?? 75,
      creative_score: myMap?.creative_score ?? 75,
      leadership_score: myMap?.leadership_score ?? 70,
      technical_score: myMap?.technical_score ?? 70,
      top_strengths: myMap?.top_strengths ?? '',
      top_interests: myMap?.top_interests ?? '',
    });
  }, [myMap]);

  // Modal: Refleksi state
  const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [interestNotes, setInterestNotes] = useState('');
  const [strengthNotes, setStrengthNotes] = useState('');
  const [reflectionContent, setReflectionContent] = useState('');

  // Modal: Rencana Masa Depan state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planTimeframe, setPlanTimeframe] = useState<PlanTimeframe>('jangka_pendek');
  const [planGoal, setPlanGoal] = useState('');
  const [planStepsText, setPlanStepsText] = useState('');

  const openReflectionModal = (activityId = '') => {
    setSelectedActivityId(activityId);
    setInterestNotes('');
    setStrengthNotes('');
    setReflectionContent('');
    setReflectionModalOpen(true);
  };

  const openPlanModal = () => {
    setPlanTitle('');
    setPlanTimeframe('jangka_pendek');
    setPlanGoal('');
    setPlanStepsText('');
    setPlanModalOpen(true);
  };

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionContent.trim()) return;
    await saveReflection({
      activity_id: selectedActivityId || null,
      interest_notes: interestNotes,
      strength_notes: strengthNotes,
      reflection_content: reflectionContent,
    });
    setReflectionModalOpen(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim() || !planGoal.trim()) return;
    const rawLines = planStepsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const steps: ActionStep[] = (rawLines.length > 0 ? rawLines : ['Mulai langkah pertama']).map(
      (label, index) => ({
        id: `step-${Date.now()}-${index}`,
        label,
        done: false,
      })
    );
    await createFuturePlan({
      title: planTitle,
      timeframe: planTimeframe,
      target_goal: planGoal,
      action_steps: steps,
    });
    setPlanModalOpen(false);
  };

  const progressPct =
    publishedMaterials.length > 0
      ? Math.round((completedIds.size / publishedMaterials.length) * 100)
      : 0;

  return (
    <DashboardLayout
      title="Dashboard Siswa"
      subtitle={`Halo, ${currentUser?.full_name ?? 'Siswa'} (${currentUser?.class_name ?? ''})`}
      navItems={STUDENT_NAV}
    >
      {/* TAB 1: BERANDA / RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Materi selesai"
              value={`${completedIds.size}/${publishedMaterials.length}`}
              hint={`${progressPct}% dari katalog Kenali Diriku`}
              icon={<BookOpen className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Catatan refleksi"
              value={myReflections.length}
              hint={`${activeActivities.length} tugas refleksi aktif dari BK`}
              icon={<MessageSquare className="h-4 w-4" />}
            />
            <StatCard
              label="Rencana aktif"
              value={myPlans.length}
              hint="Target jangka pendek hingga panjang"
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              label="Status privasi"
              value={currentUser?.share_activity_consent ? 'Dibagikan' : 'Privat'}
              hint={
                currentUser?.share_activity_consent
                  ? 'Guru BK dapat melihat ringkasanmu'
                  : 'Hanya kamu yang dapat melihat data'
              }
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Active reflection tasks from BK */}
            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-7">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Kegiatan refleksi dari Guru BK
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('refleksi')}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Buka semua
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {activeActivities.map((act) => (
                  <div key={act.id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink">{act.title}</h3>
                      <span className="text-xs text-ink-muted">Tenggat {act.due_date}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{act.prompt}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('refleksi');
                        openReflectionModal(act.id);
                      }}
                      className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
                    >
                      Isi refleksi ini
                    </button>
                  </div>
                ))}
                {activeActivities.length === 0 && (
                  <p className="text-sm text-ink-muted">Belum ada kegiatan refleksi aktif.</p>
                )}
              </div>
            </div>

            {/* Quick shortcuts & latest announcements */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-line bg-paper p-6">
                <h2 className="font-display text-lg font-semibold text-ink">Pintasan cepat</h2>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {[
                    { tab: 'kenali-diriku', label: 'Baca Materi' },
                    { tab: 'peta-potensi', label: 'Ubah Peta Potensi' },
                    { tab: 'rencana-masa-depan', label: 'Kelola Rencana' },
                    { tab: 'privasi-bantuan', label: 'Atur Privasi' },
                  ].map((item) => (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => setActiveTab(item.tab)}
                      className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-left text-xs font-semibold text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-6">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Pengumuman sekolah
                </h2>
                <div className="mt-3 space-y-3">
                  {announcements
                    .filter((a) => a.is_active)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className="border-b border-line pb-3 last:border-0 last:pb-0"
                      >
                        <p className="text-sm font-semibold text-ink">{ann.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{ann.content}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KENALI DIRIKU */}
      {activeTab === 'kenali-diriku' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau topik materi..."
                className="w-full rounded-lg border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-accent text-white'
                      : 'border border-line bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-2.5 lg:col-span-5">
              {filteredMaterials.map((mat) => {
                const isDone = completedIds.has(mat.id);
                const selected = readingMaterial?.id === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setReadingMaterialId(mat.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-accent bg-paper'
                        : 'border-line bg-paper/70 hover:bg-paper'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-medium text-ink-muted">
                        {mat.category}
                      </span>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selesai
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink">
                      {mat.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{mat.summary}</p>
                  </button>
                );
              })}
              {filteredMaterials.length === 0 && (
                <div className="rounded-xl border border-line bg-paper p-6 text-sm text-ink-muted">
                  Tidak ada materi yang cocok dengan kata kunci tersebut.
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {readingMaterial ? (
                <article className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                    <span className="rounded-md bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
                      {readingMaterial.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => void toggleMaterialCompleted(readingMaterial.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                        completedIds.has(readingMaterial.id)
                          ? 'border border-accent bg-accent-soft text-accent-ink'
                          : 'bg-accent text-white hover:bg-accent-hover'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedIds.has(readingMaterial.id)
                        ? 'Selesai dibaca (batalkan)'
                        : 'Tandai selesai'}
                    </button>
                  </div>

                  <h2 className="mt-5 font-display text-2xl font-bold text-ink">
                    {readingMaterial.title}
                  </h2>

                  <div className="mt-4">
                    <RichTextViewer content={readingMaterial.content} />
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PETA POTENSI */}
      {activeTab === 'peta-potensi' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Visualisasi lima dimensi potensi
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Grafik berubah langsung saat kamu menyesuaikan nilai di sisi kanan.
            </p>
            <div className="mt-4">
              <PotentialRadarChart scores={scores} height={310} />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 border-t border-line pt-4 text-center">
              {[
                { label: 'Akademik', val: scores.academic_score },
                { label: 'Sosial', val: scores.social_score },
                { label: 'Kreatif', val: scores.creative_score },
                { label: 'Pimpin', val: scores.leadership_score },
                { label: 'Teknis', val: scores.technical_score },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-canvas py-2">
                  <p className="text-[11px] text-ink-muted">{item.label}</p>
                  <p className="font-display text-base font-bold text-ink">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void savePotentialMap(scores);
            }}
            className="space-y-4 rounded-2xl border border-line bg-paper p-6 lg:col-span-6"
          >
            <h2 className="font-display text-lg font-semibold text-ink">
              Atur skor dan catatan kekuatan
            </h2>

            {(
              [
                ['academic_score', 'Akademik'],
                ['social_score', 'Sosial'],
                ['creative_score', 'Kreatif'],
                ['leadership_score', 'Kepemimpinan'],
                ['technical_score', 'Teknis'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-medium text-ink">
                  <label htmlFor={`pm-${key}`}>{label}</label>
                  <span className="tabular-nums text-ink-muted">{scores[key]} / 100</span>
                </div>
                <input
                  id={`pm-${key}`}
                  type="range"
                  min={10}
                  max={100}
                  value={scores[key]}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="mt-1.5 h-1.5 w-full cursor-pointer accent-[var(--accent-primary)]"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="pm-strengths">
                Kekuatan utama diri
              </label>
              <input
                id="pm-strengths"
                type="text"
                value={scores.top_strengths}
                onChange={(e) => setScores((prev) => ({ ...prev, top_strengths: e.target.value }))}
                placeholder="Contoh: Teliti analisis, komunikasi kelompok, desain visual"
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="pm-interests">
                Minat utama saat ini
              </label>
              <input
                id="pm-interests"
                type="text"
                value={scores.top_interests}
                onChange={(e) => setScores((prev) => ({ ...prev, top_interests: e.target.value }))}
                placeholder="Contoh: Desain produk, bioteknologi, komunikasi sains"
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Simpan peta potensi
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: RENCANA MASA DEPAN (Modal CRUD) */}
      {activeTab === 'rencana-masa-depan' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Rencana masa depan</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Susun target jangka pendek, menengah, dan panjang beserta daftar langkah aksi.
              </p>
            </div>
            <button
              type="button"
              onClick={openPlanModal}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah rencana</span>
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {myPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-line bg-paper p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-md bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
                      {TIMEFRAME_LABELS[plan.timeframe]}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                      {plan.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">{plan.target_goal}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteFuturePlan(plan.id)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-subtle hover:text-red-700"
                    aria-label="Hapus rencana"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink-muted">Progres langkah aksi</span>
                    <span className="tabular-nums text-ink">{plan.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {plan.action_steps.map((step) => (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => void togglePlanStep(plan.id, step.id)}
                        className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-canvas"
                      >
                        {step.done ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                        )}
                        <span className={step.done ? 'text-ink-muted line-through' : 'text-ink'}>
                          {step.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {myPlans.length === 0 && (
              <div className="rounded-2xl border border-line bg-paper p-8 text-sm text-ink-muted md:col-span-2">
                Belum ada rencana masa depan. Klik tombol &ldquo;Tambah rencana&rdquo; untuk mulai
                menyusun target pertamamu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REFLEKSI DAN TINDAK LANJUT (Modal CRUD) */}
      {activeTab === 'refleksi' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Refleksi dan tindak lanjut
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Catat refleksi minat dan kekuatan dirimu serta pantau arahan dari Guru BK.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openReflectionModal('')}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tulis refleksi</span>
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Riwayat Refleksi */}
            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-7">
              <h3 className="font-display text-base font-semibold text-ink">
                Riwayat refleksi saya ({myReflections.length})
              </h3>
              <div className="mt-4 divide-y divide-line">
                {myReflections.map((ref) => {
                  const act = reflectionActivities.find((a) => a.id === ref.activity_id);
                  return (
                    <div key={ref.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {act ? act.title : 'Refleksi pribadi mandiri'}
                        </p>
                        <span className="text-xs text-ink-muted">
                          {new Date(ref.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-muted">
                        {ref.reflection_content}
                      </p>
                      {(ref.interest_notes || ref.strength_notes) && (
                        <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-ink-muted">
                          {ref.interest_notes && (
                            <span>
                              <strong className="text-ink">Minat:</strong> {ref.interest_notes}
                            </span>
                          )}
                          {ref.strength_notes && (
                            <span>
                              <strong className="text-ink">Kekuatan:</strong> {ref.strength_notes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {myReflections.length === 0 && (
                  <p className="py-4 text-sm text-ink-muted">Belum ada catatan refleksi tersimpan.</p>
                )}
              </div>
            </div>

            {/* Arahan & Tindak Lanjut dari Guru BK */}
            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-5">
              <h3 className="font-display text-base font-semibold text-ink">
                Arahan dan tindak lanjut Guru BK
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Catatan pendampingan dari Guru BK akan muncul di sini setelah kamu membagikan
                ringkasan aktivitas.
              </p>

              <div className="mt-4 space-y-3">
                {myFollowups.map((fu) => (
                  <div key={fu.id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${FOLLOWUP_BADGE[fu.status]}`}
                      >
                        {fu.status}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {new Date(fu.updated_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink">{fu.guidance_note}</p>
                    <div className="mt-3 border-t border-line pt-2.5">
                      <p className="text-xs font-semibold text-accent-ink">Rekomendasi langkah:</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        {fu.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
                {myFollowups.length === 0 && (
                  <div className="rounded-xl border border-line bg-canvas p-5 text-sm text-ink-muted">
                    Belum ada catatan arahan dari Guru BK.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PRIVASI DAN BANTUAN */}
      {activeTab === 'privasi-bantuan' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-paper p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Kontrol persetujuan privasi
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Tentukan apakah Guru BK boleh melihat ringkasan catatan refleksi, Peta Potensi,
                  dan Rencana Masa Depan milikmu untuk keperluan pendampingan. Kamu bisa mengubah
                  pilihan ini kapan saja.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(currentUser?.share_activity_consent)}
                  onChange={(e) => void updatePrivacyConsent(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-primary)]"
                />
                <span className="text-sm font-semibold text-ink">
                  Izinkan Guru BK melihat ringkasan aktivitas saya
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-subtle p-4 text-xs leading-relaxed text-ink">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                Status saat ini:{' '}
                <strong>
                  {currentUser?.share_activity_consent
                    ? 'Aktif — Guru BK dapat membaca ringkasan refleksi, peta potensi, dan rencana masa depanmu.'
                    : 'Tertutup — Seluruh refleksi, peta potensi, dan rencana masa depanmu hanya dapat dibaca oleh dirimu sendiri.'}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-5">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-accent" />
                <h3 className="font-display text-lg font-semibold text-ink">
                  Panduan penggunaan singkat
                </h3>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
                <li>1. Mulai dari menu Kenali Diriku untuk membaca materi pengenalan diri.</li>
                <li>2. Isi Peta Potensi secara jujur sesuai kondisi belajarmu saat ini.</li>
                <li>3. Buat minimal satu Rencana Masa Depan beserta langkah aksi kecil.</li>
                <li>
                  4. Aktifkan izin berbagi di atas bila kamu ingin Guru BK memberi arahan tindak
                  lanjut.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-7">
              <h3 className="font-display text-lg font-semibold text-ink">
                Jadwal dan kontak konsultasi BK
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {consultationInfo.map((info) => (
                  <div key={info.id} className="rounded-xl border border-line bg-canvas p-4">
                    <p className="font-display text-sm font-semibold text-ink">
                      {info.counselor_name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{info.notes}</p>
                    <div className="mt-3 space-y-1.5 border-t border-line pt-2.5 text-xs text-ink">
                      <p className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{info.schedule}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{info.location_or_link}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{info.contact_info}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH RENCANA MASA DEPAN */}
      <Modal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Tambah rencana masa depan"
        description="Tentukan target dan pecah menjadi beberapa langkah aksi kecil."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="plan-title">
              Judul rencana
            </label>
            <input
              id="plan-title"
              type="text"
              required
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="Contoh: Persiapan Portofolio Jurusan Desain"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="plan-timeframe">
              Rentang waktu
            </label>
            <select
              id="plan-timeframe"
              value={planTimeframe}
              onChange={(e) => setPlanTimeframe(e.target.value as PlanTimeframe)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="jangka_pendek">Jangka Pendek (Semester ini)</option>
              <option value="jangka_menengah">Jangka Menengah (1–2 tahun)</option>
              <option value="jangka_panjang">Jangka Panjang (Pasca sekolah)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="plan-goal">
              Target akhir
            </label>
            <textarea
              id="plan-goal"
              rows={2}
              required
              value={planGoal}
              onChange={(e) => setPlanGoal(e.target.value)}
              placeholder="Apa hasil konkret yang ingin kamu capai?"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="plan-steps">
              Langkah aksi (satu baris per langkah)
            </label>
            <textarea
              id="plan-steps"
              rows={4}
              value={planStepsText}
              onChange={(e) => setPlanStepsText(e.target.value)}
              placeholder={'Kumpulkan 3 karya terbaik\nDiskusi dengan Guru BK\nRiset kurikulum kampus'}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPlanModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Simpan rencana
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TULIS REFLEKSI */}
      <Modal
        open={reflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        title="Tulis refleksi minat dan kekuatan diri"
        description="Catatan refleksimu tersimpan pribadi kecuali kamu mengizinkan berbagi ke Guru BK."
      >
        <form onSubmit={handleSaveReflection} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ref-activity">
              Kegiatan refleksi dari Guru BK (opsional)
            </label>
            <select
              id="ref-activity"
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Refleksi pribadi mandiri</option>
              {activeActivities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} (Tenggat {act.due_date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ref-interest">
              Minat yang terasa menonjol
            </label>
            <input
              id="ref-interest"
              type="text"
              value={interestNotes}
              onChange={(e) => setInterestNotes(e.target.value)}
              placeholder="Kegiatan atau pelajaran yang membuatmu penasaran"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ref-strength">
              Kekuatan yang kamu rasakan
            </label>
            <input
              id="ref-strength"
              type="text"
              value={strengthNotes}
              onChange={(e) => setStrengthNotes(e.target.value)}
              placeholder="Hal yang sering berhasil kamu selesaikan dengan baik"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="ref-body">
              Catatan refleksi
            </label>
            <textarea
              id="ref-body"
              rows={4}
              required
              value={reflectionContent}
              onChange={(e) => setReflectionContent(e.target.value)}
              placeholder="Ceritakan pengalaman belajarmu, hal yang ingin diasah, atau tantangan yang sedang dihadapi..."
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReflectionModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Simpan refleksi
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
