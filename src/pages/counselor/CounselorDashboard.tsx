import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Edit3,
  Eye,
  LayoutDashboard,
  Lock,
  MessageSquarePlus,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
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
import { Modal } from '../../components/common/Modal';
import { PotentialRadarChart } from '../../components/common/PotentialRadarChart';
import { RichTextEditor, stripHtml } from '../../components/common/RichTextEditor';
import { StatCard } from '../../components/common/StatCard';
import {
  DashboardLayout,
  type DashboardNavItem,
} from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import type {
  ConsultationInfo,
  FollowupStatus,
  Material,
  MaterialStatus,
  ReflectionActivity,
} from '../../types';

const COUNSELOR_NAV: DashboardNavItem[] = [
  { id: 'ringkasan', label: 'Ringkasan & Analitik', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'materi', label: 'Kelola Materi BK', icon: <BookOpen className="h-4 w-4" /> },
  {
    id: 'kegiatan-refleksi',
    label: 'Kegiatan Refleksi',
    icon: <ClipboardList className="h-4 w-4" />,
  },
  { id: 'aktivitas-siswa', label: 'Aktivitas Siswa', icon: <Users className="h-4 w-4" /> },
  {
    id: 'tindak-lanjut',
    label: 'Arahan & Tindak Lanjut',
    icon: <MessageSquarePlus className="h-4 w-4" />,
  },
  { id: 'konsultasi', label: 'Informasi Konsultasi', icon: <Calendar className="h-4 w-4" /> },
];

export const CounselorDashboard: React.FC = () => {
  const {
    activeTab,
    profiles,
    materials,
    reflectionActivities,
    studentReflections,
    potentialMaps,
    futurePlans,
    counselorFollowups,
    consultationInfo,
    saveMaterial,
    deleteMaterial,
    saveReflectionActivity,
    deleteReflectionActivity,
    saveFollowup,
    saveConsultationInfo,
    deleteConsultationInfo,
  } = useApp();

  const students = useMemo(() => profiles.filter((p) => p.role === 'siswa'), [profiles]);
  const consentingStudents = useMemo(
    () => students.filter((s) => s.share_activity_consent),
    [students]
  );

  // Modal: Material
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [editMatId, setEditMatId] = useState<string | undefined>(undefined);
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState('Gaya Belajar');
  const [matSummary, setMatSummary] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matStatus, setMatStatus] = useState<MaterialStatus>('published');

  // Modal: Reflection activity
  const [actModalOpen, setActModalOpen] = useState(false);
  const [editActId, setEditActId] = useState<string | undefined>(undefined);
  const [actTitle, setActTitle] = useState('');
  const [actPrompt, setActPrompt] = useState('');
  const [actDueDate, setActDueDate] = useState('2026-12-10');
  const [actActive, setActActive] = useState(true);

  // Student inspection state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');

  // Modal: Followup
  const [fuModalOpen, setFuModalOpen] = useState(false);
  const [fuStudentId, setFuStudentId] = useState<string>(
    consentingStudents[0]?.id ?? students[0]?.id ?? ''
  );
  const [fuNote, setFuNote] = useState('');
  const [fuRec, setFuRec] = useState('');
  const [fuStatus, setFuStatus] = useState<FollowupStatus>('pendampingan');

  // Modal: Consultation info
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [editConsultId, setEditConsultId] = useState<string | undefined>(undefined);
  const [cName, setCName] = useState('');
  const [cSchedule, setCSchedule] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [cContact, setCContact] = useState('');
  const [cNotes, setCNotes] = useState('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];
  const selectedStudentMap = selectedStudent
    ? potentialMaps.find((pm) => pm.student_id === selectedStudent.id)
    : undefined;
  const selectedStudentReflections = selectedStudent
    ? studentReflections.filter((r) => r.student_id === selectedStudent.id)
    : [];
  const selectedStudentPlans = selectedStudent
    ? futurePlans.filter((p) => p.student_id === selectedStudent.id)
    : [];

  const analyticsChartData = [
    { name: 'Total Siswa', jumlah: students.length },
    { name: 'Izinkan Berbagi', jumlah: consentingStudents.length },
    { name: 'Materi Aktif', jumlah: materials.filter((m) => m.status === 'published').length },
    { name: 'Arahan BK', jumlah: counselorFollowups.length },
  ];

  // Open modal helpers
  const openCreateMaterial = () => {
    setEditMatId(undefined);
    setMatTitle('');
    setMatCategory('Gaya Belajar');
    setMatSummary('');
    setMatContent('');
    setMatStatus('published');
    setMatModalOpen(true);
  };

  const openEditMaterial = (mat: Material) => {
    setEditMatId(mat.id);
    setMatTitle(mat.title);
    setMatCategory(mat.category);
    setMatSummary(mat.summary);
    setMatContent(mat.content);
    setMatStatus(mat.status);
    setMatModalOpen(true);
  };

  const openCreateActivity = () => {
    setEditActId(undefined);
    setActTitle('');
    setActPrompt('');
    setActDueDate('2026-12-10');
    setActActive(true);
    setActModalOpen(true);
  };

  const openEditActivity = (act: ReflectionActivity) => {
    setEditActId(act.id);
    setActTitle(act.title);
    setActPrompt(act.prompt);
    setActDueDate(act.due_date);
    setActActive(act.is_active);
    setActModalOpen(true);
  };

  const openCreateFollowup = (presetStudentId?: string) => {
    setFuStudentId(presetStudentId ?? consentingStudents[0]?.id ?? students[0]?.id ?? '');
    setFuNote('');
    setFuRec('');
    setFuStatus('pendampingan');
    setFuModalOpen(true);
  };

  const openCreateConsultation = () => {
    setEditConsultId(undefined);
    setCName('');
    setCSchedule('');
    setCLocation('');
    setCContact('');
    setCNotes('');
    setConsultModalOpen(true);
  };

  const openEditConsultation = (info: ConsultationInfo) => {
    setEditConsultId(info.id);
    setCName(info.counselor_name);
    setCSchedule(info.schedule);
    setCLocation(info.location_or_link);
    setCContact(info.contact_info);
    setCNotes(info.notes);
    setConsultModalOpen(true);
  };

  // Submit handlers
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const plainText = stripHtml(matContent);
    if (!matTitle.trim() || !plainText) return;
    await saveMaterial(
      {
        title: matTitle.trim(),
        category: matCategory.trim(),
        summary: matSummary.trim() || plainText.slice(0, 140),
        content: matContent.trim(),
        status: matStatus,
      },
      editMatId
    );
    setMatModalOpen(false);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actPrompt.trim()) return;
    await saveReflectionActivity(
      {
        title: actTitle.trim(),
        prompt: actPrompt.trim(),
        due_date: actDueDate,
        is_active: actActive,
      },
      editActId
    );
    setActModalOpen(false);
  };

  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuStudentId || !fuNote.trim()) return;
    await saveFollowup({
      student_id: fuStudentId,
      guidance_note: fuNote,
      recommendation: fuRec,
      status: fuStatus,
    });
    setFuModalOpen(false);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cSchedule.trim()) return;
    await saveConsultationInfo(
      {
        counselor_name: cName.trim(),
        schedule: cSchedule.trim(),
        location_or_link: cLocation.trim(),
        contact_info: cContact.trim(),
        notes: cNotes.trim(),
      },
      editConsultId
    );
    setConsultModalOpen(false);
  };

  return (
    <DashboardLayout
      title="Dashboard Guru BK"
      subtitle="Kelola materi pengenalan diri, kegiatan refleksi, dan pendampingan siswa berbasis persetujuan privasi."
      navItems={COUNSELOR_NAV}
    >
      {/* TAB 1: RINGKASAN & ANALITIK */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total siswa terdaftar"
              value={students.length}
              hint="Akun siswa aktif di sekolah"
              icon={<Users className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Siswa menyetujui berbagi"
              value={consentingStudents.length}
              hint={`Dari ${students.length} siswa (${
                students.length > 0
                  ? Math.round((consentingStudents.length / students.length) * 100)
                  : 0
              }%)`}
              icon={<ShieldCheck className="h-4 w-4" />}
            />
            <StatCard
              label="Materi terpublikasi"
              value={materials.filter((m) => m.status === 'published').length}
              hint={`${materials.filter((m) => m.status === 'draft').length} materi masih draf`}
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatCard
              label="Kegiatan refleksi aktif"
              value={reflectionActivities.filter((a) => a.is_active).length}
              hint="Tampil langsung di Dashboard Siswa"
              icon={<ClipboardList className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-ink">
                Distribusi layanan dan partisipasi BK
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D8E2DF" />
                    <XAxis dataKey="name" tick={{ fill: '#526663', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#526663', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-5">
              <h2 className="font-display text-lg font-semibold text-ink">
                Status persetujuan privasi siswa
              </h2>
              <div className="mt-4 space-y-2.5">
                {students.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{st.full_name}</p>
                      <p className="text-xs text-ink-muted">{st.class_name}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        st.share_activity_consent
                          ? 'bg-accent-soft text-accent-ink'
                          : 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {st.share_activity_consent ? 'Berbagi aktif' : 'Privat'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA MATERI BK (Modal CRUD) */}
      {activeTab === 'materi' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Kelola materi pengenalan diri
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Materi berstatus Published otomatis muncul di menu Kenali Diriku siswa.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateMaterial}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah materi</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {materials.map((mat) => (
              <div key={mat.id} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-medium text-ink-muted">
                        {mat.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          mat.status === 'published'
                            ? 'bg-accent-soft text-accent-ink'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {mat.status}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink">
                      {mat.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{mat.summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditMaterial(mat)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-ink"
                      aria-label="Edit materi"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteMaterial(mat.id)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-red-700"
                      aria-label="Hapus materi"
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

      {/* TAB 3: KEGIATAN REFLEKSI SISWA (Modal CRUD) */}
      {activeTab === 'kegiatan-refleksi' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Kegiatan refleksi siswa
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Pertanyaan pemantik yang aktif akan langsung tampil di Dashboard Siswa.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateActivity}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Buat kegiatan</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reflectionActivities.map((act) => (
              <div key={act.id} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          act.is_active
                            ? 'bg-accent-soft text-accent-ink'
                            : 'bg-subtle text-ink-muted'
                        }`}
                      >
                        {act.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-xs text-ink-muted">Tenggat {act.due_date}</span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink">
                      {act.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{act.prompt}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditActivity(act)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-ink"
                      aria-label="Edit kegiatan"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteReflectionActivity(act.id)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-red-700"
                      aria-label="Hapus kegiatan"
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

      {/* TAB 4: RINGKASAN AKTIVITAS SISWA (BERBASIS PERSETUJUAN PRIVASI) */}
      {activeTab === 'aktivitas-siswa' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-4">
            <h2 className="font-display text-base font-semibold text-ink">Daftar siswa</h2>
            {students.map((st) => {
              const selected = selectedStudent?.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    selected ? 'border-accent bg-paper' : 'border-line bg-paper/70 hover:bg-paper'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{st.full_name}</p>
                    <p className="text-xs text-ink-muted">{st.class_name}</p>
                  </div>
                  {st.share_activity_consent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
                      <Eye className="h-3 w-3" />
                      Diizinkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                      <Lock className="h-3 w-3" />
                      Privat
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            {selectedStudent && !selectedStudent.share_activity_consent ? (
              <div className="rounded-2xl border border-line bg-paper p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-subtle text-ink-muted">
                  <Lock className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                  Ringkasan aktivitas {selectedStudent.full_name} bersifat privat
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  Siswa belum menyalakan persetujuan berbagi ringkasan aktivitas ke Guru BK. Sesuai
                  kebijakan privasi platform dan Supabase Row Level Security, detail refleksi, peta
                  potensi, serta rencana masa depan tidak ditampilkan.
                </p>
              </div>
            ) : selectedStudent ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-line bg-paper p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink">
                        {selectedStudent.full_name}
                      </h3>
                      <p className="text-xs text-ink-muted">{selectedStudent.class_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
                        Persetujuan berbagi aktif
                      </span>
                      <button
                        type="button"
                        onClick={() => openCreateFollowup(selectedStudent.id)}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
                      >
                        Kirim arahan
                      </button>
                    </div>
                  </div>

                  {selectedStudentMap ? (
                    <div className="mt-4 grid gap-6 md:grid-cols-2 md:items-center">
                      <PotentialRadarChart scores={selectedStudentMap} height={240} />
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-ink-muted">Kekuatan utama</p>
                          <p className="mt-1 text-ink">
                            {selectedStudentMap.top_strengths || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink-muted">Minat utama</p>
                          <p className="mt-1 text-ink">
                            {selectedStudentMap.top_interests || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-ink-muted">
                      Siswa belum mengisi Peta Potensi.
                    </p>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-paper p-5">
                    <h4 className="font-display text-base font-semibold text-ink">
                      Refleksi terbaru ({selectedStudentReflections.length})
                    </h4>
                    <div className="mt-3 space-y-3">
                      {selectedStudentReflections.map((r) => (
                        <div key={r.id} className="rounded-xl bg-canvas p-3.5 text-xs">
                          <p className="leading-relaxed text-ink">{r.reflection_content}</p>
                          {r.interest_notes && (
                            <p className="mt-2 text-ink-muted">
                              <strong className="text-ink">Minat:</strong> {r.interest_notes}
                            </p>
                          )}
                        </div>
                      ))}
                      {selectedStudentReflections.length === 0 && (
                        <p className="text-xs text-ink-muted">Belum ada catatan refleksi.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line bg-paper p-5">
                    <h4 className="font-display text-base font-semibold text-ink">
                      Rencana masa depan ({selectedStudentPlans.length})
                    </h4>
                    <div className="mt-3 space-y-3">
                      {selectedStudentPlans.map((p) => (
                        <div key={p.id} className="rounded-xl bg-canvas p-3.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-ink">{p.title}</p>
                            <span className="font-semibold text-accent">{p.progress}%</span>
                          </div>
                          <p className="mt-1 text-ink-muted">{p.target_goal}</p>
                        </div>
                      ))}
                      {selectedStudentPlans.length === 0 && (
                        <p className="text-xs text-ink-muted">Belum ada rencana tersimpan.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 5: ARAHAN & TINDAK LANJUT (Modal CRUD) */}
      {activeTab === 'tindak-lanjut' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Arahan dan tindak lanjut siswa
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Berikan catatan pendampingan, rekomendasi langkah, dan pembaruan status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateFollowup()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Send className="h-4 w-4" />
              <span>Kirim arahan</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {counselorFollowups.map((fu) => {
              const st = profiles.find((p) => p.id === fu.student_id);
              return (
                <div key={fu.id} className="rounded-2xl border border-line bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-base font-semibold text-ink">
                      {st?.full_name ?? 'Siswa'} ({st?.class_name ?? ''})
                    </p>
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold capitalize text-accent-ink">
                      {fu.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{fu.guidance_note}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    <strong className="text-ink">Rekomendasi:</strong> {fu.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: INFORMASI KONSULTASI BK (Modal CRUD) */}
      {activeTab === 'konsultasi' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Informasi dan jadwal konsultasi BK
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Jadwal dan kontak yang disimpan di sini tampil di menu Privasi dan Bantuan siswa.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateConsultation}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah jadwal</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {consultationInfo.map((info) => (
              <div key={info.id} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {info.counselor_name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-muted">{info.notes}</p>
                    <p className="mt-2 text-xs text-ink">
                      <strong>Jadwal:</strong> {info.schedule}
                    </p>
                    <p className="mt-1 text-xs text-ink">
                      <strong>Lokasi/Tautan:</strong> {info.location_or_link}
                    </p>
                    <p className="mt-1 text-xs text-ink">
                      <strong>Kontak:</strong> {info.contact_info}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditConsultation(info)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-ink"
                      aria-label="Edit jadwal"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteConsultationInfo(info.id)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-subtle hover:text-red-700"
                      aria-label="Hapus jadwal"
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

      {/* MODAL: TAMBAH / EDIT MATERI */}
      <Modal
        open={matModalOpen}
        onClose={() => setMatModalOpen(false)}
        title={editMatId ? 'Edit materi pengenalan diri' : 'Tambah materi baru'}
        description="Gunakan bilah alat di bawah untuk memformat judul, teks tebal/miring, perataan, dan daftar seperti di Word."
        maxWidthClass="max-w-3xl"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="bk-mat-title">
              Judul materi
            </label>
            <input
              id="bk-mat-title"
              type="text"
              required
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="bk-mat-cat">
                Kategori
              </label>
              <select
                id="bk-mat-cat"
                value={matCategory}
                onChange={(e) => setMatCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option value="Gaya Belajar">Gaya Belajar</option>
                <option value="Kepribadian">Kepribadian</option>
                <option value="Manajemen Emosi">Manajemen Emosi</option>
                <option value="Eksplorasi Bakat">Eksplorasi Bakat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="bk-mat-status">
                Status
              </label>
              <select
                id="bk-mat-status"
                value={matStatus}
                onChange={(e) => setMatStatus(e.target.value as MaterialStatus)}
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="bk-mat-sum">
              Ringkasan singkat
            </label>
            <input
              id="bk-mat-sum"
              type="text"
              value={matSummary}
              onChange={(e) => setMatSummary(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-ink">Isi materi</span>
            <RichTextEditor value={matContent} onChange={setMatContent} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMatModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {editMatId ? 'Simpan perubahan' : 'Simpan materi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH / EDIT KEGIATAN REFLEKSI */}
      <Modal
        open={actModalOpen}
        onClose={() => setActModalOpen(false)}
        title={editActId ? 'Edit kegiatan refleksi' : 'Buat kegiatan refleksi baru'}
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="act-title">
              Judul kegiatan
            </label>
            <input
              id="act-title"
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="Contoh: Refleksi Pilihan Jurusan Kelas XI"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="act-prompt">
              Pertanyaan pemantik refleksi
            </label>
            <textarea
              id="act-prompt"
              rows={4}
              required
              value={actPrompt}
              onChange={(e) => setActPrompt(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="act-due">
              Tenggat waktu
            </label>
            <input
              id="act-due"
              type="date"
              required
              value={actDueDate}
              onChange={(e) => setActDueDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={actActive}
              onChange={(e) => setActActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span>Tampilkan aktif di Dashboard Siswa</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {editActId ? 'Simpan perubahan' : 'Terbitkan kegiatan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: KIRIM ARAHAN & TINDAK LANJUT */}
      <Modal
        open={fuModalOpen}
        onClose={() => setFuModalOpen(false)}
        title="Kirim arahan dan tindak lanjut"
        description="Arahan akan langsung tampil di halaman Refleksi dan Tindak Lanjut siswa terkait."
      >
        <form onSubmit={handleSaveFollowup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="fu-student">
              Pilih siswa
            </label>
            <select
              id="fu-student"
              value={fuStudentId}
              onChange={(e) => setFuStudentId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.class_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="fu-status">
              Status pendampingan
            </label>
            <select
              id="fu-status"
              value={fuStatus}
              onChange={(e) => setFuStatus(e.target.value as FollowupStatus)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="menunggu">Menunggu</option>
              <option value="pendampingan">Pendampingan</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="fu-note">
              Catatan arahan Guru BK
            </label>
            <textarea
              id="fu-note"
              rows={3}
              required
              value={fuNote}
              onChange={(e) => setFuNote(e.target.value)}
              placeholder="Apresiasi kekuatan siswa dan catatan evaluasi singkat..."
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="fu-rec">
              Rekomendasi langkah lanjutan
            </label>
            <textarea
              id="fu-rec"
              rows={3}
              required
              value={fuRec}
              onChange={(e) => setFuRec(e.target.value)}
              placeholder="Langkah konkret atau ajakan sesi diskusi di ruang BK..."
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFuModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Kirim arahan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH / EDIT JADWAL KONSULTASI */}
      <Modal
        open={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        title={editConsultId ? 'Edit jadwal konsultasi BK' : 'Tambah jadwal konsultasi BK'}
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="c-name">
              Nama Guru BK
            </label>
            <input
              id="c-name"
              type="text"
              required
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="c-schedule">
              Jadwal layanan
            </label>
            <input
              id="c-schedule"
              type="text"
              required
              value={cSchedule}
              onChange={(e) => setCSchedule(e.target.value)}
              placeholder="Senin & Rabu, 09.00–14.30 WIB"
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="c-loc">
              Ruang atau tautan daring
            </label>
            <input
              id="c-loc"
              type="text"
              required
              value={cLocation}
              onChange={(e) => setCLocation(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="c-contact">
              Kontak BK
            </label>
            <input
              id="c-contact"
              type="text"
              required
              value={cContact}
              onChange={(e) => setCContact(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink" htmlFor="c-notes">
              Fokus layanan
            </label>
            <textarea
              id="c-notes"
              rows={2}
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setConsultModalOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {editConsultId ? 'Simpan perubahan' : 'Simpan jadwal'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
