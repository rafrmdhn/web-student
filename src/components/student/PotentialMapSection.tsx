import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Database,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  ANSWER_OPTIONS,
  POTENTIAL_DIMENSIONS,
  calculatePotentialScores,
  getDimensionInterpretations,
  type PotentialDimensionId,
} from '../../data/potentialQuestionnaire';
import type { PotentialMap, PotentialQuestion } from '../../types';
import { PotentialRadarChart, type PotentialScores } from '../common/PotentialRadarChart';

interface PotentialMapSectionProps {
  questions: PotentialQuestion[];
  questionsError?: string | null;
  onReloadQuestions?: () => Promise<void>;
  savedMap?: PotentialMap;
  onSave: (input: {
    academic_score: number;
    social_score: number;
    creative_score: number;
    leadership_score: number;
    technical_score: number;
    top_strengths: string;
    top_interests: string;
  }) => Promise<void>;
}

type Stage = 'guide' | 'quiz' | 'result';

const LEVEL_STYLES: Record<string, string> = {
  'Sangat Menonjol': 'bg-accent-soft text-accent-ink border-accent/30',
  'Berkembang Baik': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Potensi Cukup': 'bg-amber-50 text-amber-800 border-amber-200',
  'Perlu Penguatan': 'bg-subtle text-ink-muted border-line',
};

export const PotentialMapSection: React.FC<PotentialMapSectionProps> = ({
  questions,
  questionsError,
  onReloadQuestions,
  savedMap,
  onSave,
}) => {
  const [stage, setStage] = useState<Stage>(() => (savedMap ? 'result' : 'guide'));
  const [dimensionIndex, setDimensionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string>('');
  const [computedScores, setComputedScores] = useState<PotentialScores | null>(() =>
    savedMap
      ? {
          academic_score: savedMap.academic_score,
          social_score: savedMap.social_score,
          creative_score: savedMap.creative_score,
          leadership_score: savedMap.leadership_score,
          technical_score: savedMap.technical_score,
        }
      : null
  );
  const [topStrengths, setTopStrengths] = useState<string>(savedMap?.top_strengths ?? '');
  const [topInterests, setTopInterests] = useState<string>(savedMap?.top_interests ?? '');
  const [saving, setSaving] = useState(false);

  // Sync when switching student profile or loading saved map from DB
  useEffect(() => {
    if (savedMap) {
      setComputedScores({
        academic_score: savedMap.academic_score,
        social_score: savedMap.social_score,
        creative_score: savedMap.creative_score,
        leadership_score: savedMap.leadership_score,
        technical_score: savedMap.technical_score,
      });
      setTopStrengths(savedMap.top_strengths ?? '');
      setTopInterests(savedMap.top_interests ?? '');
      setStage('result');
    } else {
      setComputedScores(null);
      setTopStrengths('');
      setTopInterests('');
      setStage('guide');
    }
    setAnswers({});
    setDimensionIndex(0);
    setValidationError('');
  }, [savedMap?.student_id]);

  const currentDimension = POTENTIAL_DIMENSIONS[dimensionIndex];
  const currentQuestions = useMemo(
    () => questions.filter((q) => q.dimension === currentDimension.id),
    [questions, currentDimension.id]
  );

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers]
  );
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const unansweredQuestions = useMemo(
    () => questions.filter((q) => answers[q.id] === undefined),
    [questions, answers]
  );

  const countTotalByDimension = (dimId: PotentialDimensionId) =>
    questions.filter((q) => q.dimension === dimId).length;

  const countAnsweredByDimension = (dimId: PotentialDimensionId) =>
    questions.filter((q) => q.dimension === dimId && answers[q.id] !== undefined).length;

  const handleSelectAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (validationError) setValidationError('');
  };

  const handleStartQuiz = () => {
    if (questions.length === 0) return;
    setAnswers({});
    setDimensionIndex(0);
    setValidationError('');
    setStage('quiz');
  };

  const handleFinishQuiz = () => {
    if (unansweredQuestions.length > 0) {
      const missingNumbers = unansweredQuestions
        .slice(0, 6)
        .map((q) => q.question_number)
        .join(', ');
      const suffix = unansweredQuestions.length > 6 ? ', ...' : '';
      setValidationError(
        `Masih ada ${unansweredQuestions.length} pertanyaan yang belum dijawab (nomor ${missingNumbers}${suffix}). Selesaikan seluruh ${totalQuestions} pertanyaan sebelum melihat hasil.`
      );
      return;
    }

    const nextScores = calculatePotentialScores(answers, questions);
    setComputedScores(nextScores);
    setValidationError('');
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToFirstUnanswered = () => {
    const first = unansweredQuestions[0];
    if (!first) return;
    const targetIdx = POTENTIAL_DIMENSIONS.findIndex((d) => d.id === first.dimension);
    if (targetIdx >= 0) {
      setDimensionIndex(targetIdx);
      setValidationError('');
    }
  };

  const handleSaveMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!computedScores) return;
    setSaving(true);
    try {
      await onSave({
        ...computedScores,
        top_strengths: topStrengths.trim(),
        top_interests: topInterests.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const interpretations = useMemo(
    () => (computedScores ? getDimensionInterpretations(computedScores) : []),
    [computedScores]
  );

  const dominantDimensions = useMemo(() => {
    if (interpretations.length === 0) return [];
    const highest = Math.max(...interpretations.map((i) => i.score));
    return interpretations.filter((i) => i.score === highest);
  }, [interpretations]);

  // =========================================================================
  // STAGE 1: HALAMAN PETUNJUK PENGISIAN PETA POTENSI
  // =========================================================================
  if (stage === 'guide') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
                <BookOpenCheck className="h-3.5 w-3.5" />
                <span>Petunjuk Pengisian Peta Potensi</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink">
                Kenali lima dimensi potensimu melalui {totalQuestions || 25} pertanyaan singkat
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Peta Potensi dihitung otomatis berdasarkan jawaban kuesioner dari database, bukan
                diisi secara manual. Tidak ada jawaban benar atau salah—pilih pernyataan yang paling
                menggambarkan dirimu saat ini.
              </p>
            </div>

            {savedMap && computedScores && (
              <button
                type="button"
                onClick={() => setStage('result')}
                className="rounded-lg border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle"
              >
                Lihat hasil tersimpan
              </button>
            )}
          </div>

          {questions.length === 0 && (
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              <div className="flex items-start gap-2.5">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold">Pertanyaan kuesioner belum tersedia di database</p>
                  <p className="mt-1">
                    {questionsError
                      ? `Detail dari Supabase: ${questionsError}`
                      : 'Pastikan tabel public.potential_questions memiliki 25 baris dengan kolom is_active = true dan policy SELECT aktif.'}
                  </p>
                </div>
              </div>
              {onReloadQuestions && (
                <button
                  type="button"
                  onClick={() => void onReloadQuestions()}
                  className="rounded-lg bg-amber-800 px-3 py-1.5 font-semibold text-white hover:bg-amber-900"
                >
                  Muat ulang dari database
                </button>
              )}
            </div>
          )}

          {/* 5 Dimensions Overview */}
          <div className="mt-6">
            <h3 className="font-display text-base font-semibold text-ink">
              Lima dimensi yang akan dipetakan
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {POTENTIAL_DIMENSIONS.map((dim) => (
                <div key={dim.id} className="rounded-xl border border-line bg-canvas p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-ink">{dim.label}</p>
                    <span className="text-[11px] font-medium text-ink-muted">
                      {countTotalByDimension(dim.id)} soal
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scale & Rules */}
          <div className="mt-6 grid gap-5 lg:grid-cols-12">
            <div className="rounded-xl border border-line bg-canvas p-5 lg:col-span-7">
              <h3 className="font-display text-sm font-semibold text-ink">
                Pilihan jawaban pada setiap pertanyaan
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {ANSWER_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    className="rounded-lg border border-line bg-paper px-3 py-2.5 text-center"
                  >
                    <p className="font-display text-lg font-bold text-accent">{opt.value}</p>
                    <p className="mt-0.5 text-xs font-medium text-ink">{opt.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-5 lg:col-span-5">
              <h3 className="font-display text-sm font-semibold text-ink">
                Hal yang perlu diperhatikan
              </h3>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-ink-muted">
                <li>
                  1. Seluruh {totalQuestions || 25} pertanyaan wajib dijawab agar hasil grafik radar
                  dapat dihitung.
                </li>
                <li>2. Estimasi waktu pengerjaan sekitar 4–6 menit.</li>
                <li>
                  3. Setelah selesai, kamu bisa melengkapi catatan kekuatan dan menyimpannya ke
                  database.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={questions.length === 0}
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Compass className="h-4 w-4" />
              <span>Mulai Kuesioner ({totalQuestions} Pertanyaan)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: KUESIONER DARI DATABASE DENGAN NAVIGASI MUDAH
  // =========================================================================
  if (stage === 'quiz') {
    const isFirstDim = dimensionIndex === 0;
    const isLastDim = dimensionIndex === POTENTIAL_DIMENSIONS.length - 1;

    return (
      <div className="space-y-5">
        {/* Top Progress & Dimension Stepper */}
        <div className="rounded-2xl border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-ink-muted">
                Tahap {dimensionIndex + 1} dari {POTENTIAL_DIMENSIONS.length}: Dimensi{' '}
                <strong className="text-ink">{currentDimension.label}</strong>
              </p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-ink">
                Kuesioner Pemetaan Potensi Diri
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tabular-nums text-accent-ink">
                Terjawab {answeredCount} / {totalQuestions}
              </span>
              <button
                type="button"
                onClick={() => setStage('guide')}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-subtle hover:text-ink"
              >
                Petunjuk
              </button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-accent transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 5 Dimension Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {POTENTIAL_DIMENSIONS.map((dim, idx) => {
              const dimTotal = countTotalByDimension(dim.id);
              const dimDone = countAnsweredByDimension(dim.id);
              const isActive = idx === dimensionIndex;
              const isComplete = dimTotal > 0 && dimDone === dimTotal;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setDimensionIndex(idx)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? 'border-accent bg-accent-soft text-accent-ink'
                      : isComplete
                        ? 'border-line bg-canvas text-ink'
                        : 'border-line bg-paper text-ink-muted hover:bg-canvas'
                  }`}
                >
                  <span className="truncate font-semibold">{dim.label}</span>
                  <span className="ml-1.5 shrink-0 tabular-nums">
                    {isComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      `${dimDone}/${dimTotal}`
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation alert */}
        {validationError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={handleJumpToFirstUnanswered}
              className="rounded-lg bg-amber-800 px-3 py-1.5 font-semibold text-white hover:bg-amber-900"
            >
              Lompat ke soal kosong
            </button>
          </div>
        )}

        {/* Questions of Active Dimension */}
        <div className="space-y-4">
          {currentQuestions.map((q) => {
            const selectedVal = answers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-2xl border bg-paper p-5 transition-colors ${
                  selectedVal !== undefined ? 'border-accent/35' : 'border-line'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                      selectedVal !== undefined
                        ? 'bg-accent text-white'
                        : 'bg-subtle text-ink-muted'
                    }`}
                  >
                    {q.question_number}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-ink sm:text-[15px]">
                    {q.question_text}
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label={`Pilihan jawaban pertanyaan ${q.question_number}`}
                  className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                >
                  {ANSWER_OPTIONS.map((opt) => {
                    const isSelected = selectedVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectAnswer(q.id, opt.value)}
                        className={`flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent text-white'
                            : 'border-line bg-canvas text-ink hover:border-accent/40 hover:bg-accent-soft/40'
                        }`}
                      >
                        <span className="text-xs font-semibold sm:text-sm">{opt.label}</span>
                        <span
                          className={`mt-0.5 text-[11px] ${
                            isSelected ? 'text-white/85' : 'text-ink-muted'
                          }`}
                        >
                          Skor {opt.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
          <button
            type="button"
            disabled={isFirstDim}
            onClick={() => {
              setDimensionIndex((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          {/* Compact 1-25 question status dots on larger screens */}
          <div
            className="hidden flex-wrap justify-center gap-1 md:flex"
            aria-label="Ringkasan nomor soal"
          >
            {questions.map((q) => {
              const isAnswered = answers[q.id] !== undefined;
              const qDimIdx = POTENTIAL_DIMENSIONS.findIndex((d) => d.id === q.dimension);
              const isCurrentGroup = qDimIdx === dimensionIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  title={`Nomor ${q.question_number} (${q.dimension})`}
                  onClick={() => setDimensionIndex(qDimIdx)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-colors ${
                    isAnswered
                      ? 'bg-accent text-white'
                      : isCurrentGroup
                        ? 'border border-accent bg-accent-soft text-accent-ink'
                        : 'bg-subtle text-ink-muted hover:bg-line'
                  }`}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>

          {!isLastDim ? (
            <button
              type="button"
              onClick={() => {
                setDimensionIndex((prev) => Math.min(POTENTIAL_DIMENSIONS.length - 1, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <span>Dimensi Berikutnya</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishQuiz}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Lihat Hasil Peta Potensi</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: HASIL GRAFIK RADAR + INTERPRETASI + SIMPAN PETA POTENSI
  // =========================================================================
  if (!computedScores) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink">Hasil Peta Potensi Diri</h2>
            {dominantDimensions.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent-ink">
                <Sparkles className="h-3.5 w-3.5" />
                Menonjol: {dominantDimensions.map((d) => d.dimension.label).join(' & ')}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Skor dihitung otomatis dari jawaban kuesioner (total skor dimensi ÷ skor maksimal × 100).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStage('guide')}
            className="rounded-lg border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink hover:bg-subtle"
          >
            Lihat Petunjuk
          </button>
          <button
            type="button"
            disabled={questions.length === 0}
            onClick={handleStartQuiz}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-subtle disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Isi Ulang Kuesioner</span>
          </button>
        </div>
      </div>

      {/* Radar Chart + Kekuatan & Minat + Simpan */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-line bg-paper p-6 lg:col-span-6">
          <h3 className="font-display text-lg font-semibold text-ink">
            Grafik radar lima dimensi potensi
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Visualisasi sebaran skor berdasarkan hasil kuesioner terbaru.
          </p>
          <div className="mt-3">
            <PotentialRadarChart scores={computedScores} height={300} />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 border-t border-line pt-4 text-center">
            {POTENTIAL_DIMENSIONS.map((dim) => (
              <div key={dim.id} className="rounded-lg bg-canvas px-1 py-2">
                <p className="truncate text-[11px] text-ink-muted">{dim.shortLabel}</p>
                <p className="font-display text-base font-bold tabular-nums text-ink">
                  {computedScores[dim.scoreKey]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSaveMap}
          className="flex flex-col justify-between space-y-5 rounded-2xl border border-line bg-paper p-6 lg:col-span-6"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                Catatan kekuatan dan minat diri
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Lengkapi refleksi kekuatan dan minat utamamu, lalu simpan agar Peta Potensi ini
                tersimpan di database dan dapat dibuka kembali kapan saja.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="text-xs font-semibold text-ink">Ringkasan skor hasil kuesioner</p>
              <div className="mt-2.5 space-y-2">
                {interpretations.map((item) => (
                  <div key={item.dimension.id} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs font-medium text-ink">
                      {item.dimension.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold tabular-nums text-ink">
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="pm-strengths">
                Kekuatan Utama Diri
              </label>
              <input
                id="pm-strengths"
                type="text"
                value={topStrengths}
                onChange={(e) => setTopStrengths(e.target.value)}
                placeholder="Contoh: Teliti analisis, komunikasi kelompok, desain visual"
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink" htmlFor="pm-interests">
                Minat Utama Saat Ini
              </label>
              <input
                id="pm-interests"
                type="text"
                value={topInterests}
                onChange={(e) => setTopInterests(e.target.value)}
                placeholder="Contoh: Desain produk, bioteknologi, komunikasi sains"
                className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            {savedMap && (
              <p className="text-xs text-ink-muted">
                Terakhir disimpan:{' '}
                {new Date(savedMap.updated_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Peta Potensi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interpretasi Hasil & Rekomendasi Pengembangan per Dimensi */}
      <div className="rounded-2xl border border-line bg-paper p-6">
        <h3 className="font-display text-lg font-semibold text-ink">
          Interpretasi hasil dan rekomendasi pengembangan potensi
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Gunakan rekomendasi di bawah ini sebagai bahan penyusunan Rencana Masa Depan atau diskusi
          bersama Guru BK.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {interpretations.map((item) => (
            <div key={item.dimension.id} className="rounded-xl border border-line bg-canvas p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-base font-semibold text-ink">
                    {item.dimension.label}
                  </h4>
                  <span className="font-display text-sm font-bold tabular-nums text-accent">
                    {item.score}/100
                  </span>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    LEVEL_STYLES[item.level]
                  }`}
                >
                  {item.level}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink">{item.summary}</p>
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-xs font-semibold text-accent-ink">Rekomendasi pengembangan:</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {item.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
