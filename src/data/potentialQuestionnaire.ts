import type { PotentialScores } from '../components/common/PotentialRadarChart';
import type { PotentialDimensionId, PotentialQuestion } from '../types';

export type { PotentialDimensionId };

export interface PotentialDimensionMeta {
  id: PotentialDimensionId;
  scoreKey: keyof PotentialScores;
  label: string;
  shortLabel: string;
  description: string;
}

export interface AnswerOption {
  value: 1 | 2 | 3 | 4;
  label: string;
}

export const ANSWER_OPTIONS: AnswerOption[] = [
  { value: 4, label: 'Sangat Sesuai' },
  { value: 3, label: 'Sesuai' },
  { value: 2, label: 'Kurang Sesuai' },
  { value: 1, label: 'Tidak Sesuai' },
];

export const POTENTIAL_DIMENSIONS: PotentialDimensionMeta[] = [
  {
    id: 'akademik',
    scoreKey: 'academic_score',
    label: 'Akademik',
    shortLabel: 'Akademik',
    description: 'Ketekunan belajar, analisis informasi, dan kemampuan memahami konsep pelajaran.',
  },
  {
    id: 'sosial',
    scoreKey: 'social_score',
    label: 'Sosial',
    shortLabel: 'Sosial',
    description: 'Empati, komunikasi antarpersonal, dan kenyamanan bekerja sama dengan orang lain.',
  },
  {
    id: 'kreatif',
    scoreKey: 'creative_score',
    label: 'Kreatif',
    shortLabel: 'Kreatif',
    description: 'Kepekaan ide baru, daya imajinasi, dan kemampuan menghasilkan karya atau solusi orisinal.',
  },
  {
    id: 'kepemimpinan',
    scoreKey: 'leadership_score',
    label: 'Kepemimpinan',
    shortLabel: 'Pimpin',
    description: 'Inisiatif mengoordinasikan kelompok, mengambil keputusan, dan memotivasi tim.',
  },
  {
    id: 'teknis',
    scoreKey: 'technical_score',
    label: 'Teknis',
    shortLabel: 'Teknis',
    description: 'Keterampilan praktik, penggunaan perangkat digital/alat, dan pemecahan masalah sistematis.',
  },
];

export function calculatePotentialScores(
  answers: Record<string, number>,
  questions: PotentialQuestion[]
): PotentialScores {
  const totals: Record<PotentialDimensionId, number> = {
    akademik: 0,
    sosial: 0,
    kreatif: 0,
    kepemimpinan: 0,
    teknis: 0,
  };
  const counts: Record<PotentialDimensionId, number> = {
    akademik: 0,
    sosial: 0,
    kreatif: 0,
    kepemimpinan: 0,
    teknis: 0,
  };

  for (const q of questions) {
    counts[q.dimension] += 1;
    totals[q.dimension] += answers[q.id] ?? 0;
  }

  const calc = (dim: PotentialDimensionId) => {
    const maxScore = counts[dim] * 4;
    if (maxScore === 0) return 0;
    return Math.round((totals[dim] / maxScore) * 100);
  };

  return {
    academic_score: calc('akademik'),
    social_score: calc('sosial'),
    creative_score: calc('kreatif'),
    leadership_score: calc('kepemimpinan'),
    technical_score: calc('teknis'),
  };
}

export interface DimensionInterpretation {
  dimension: PotentialDimensionMeta;
  score: number;
  level: 'Sangat Menonjol' | 'Berkembang Baik' | 'Potensi Cukup' | 'Perlu Penguatan';
  summary: string;
  recommendation: string;
}

const INTERPRETATION_COPY: Record<
  PotentialDimensionId,
  {
    high: { summary: string; recommendation: string };
    medium: { summary: string; recommendation: string };
    low: { summary: string; recommendation: string };
  }
> = {
  akademik: {
    high: {
      summary:
        'Kamu memiliki ketekunan belajar, daya analisis, dan kedisiplinan konseptual yang kuat dalam memahami materi pelajaran.',
      recommendation:
        'Asah lebih jauh melalui proyek riset kecil, olimpiade sains/sosial, atau menjadi tutor sebaya agar pemahaman makin mendalam.',
    },
    medium: {
      summary:
        'Fondasi belajar akademikmu sudah cukup baik dan mampu mengikuti alur pelajaran dengan strategi yang tepat.',
      recommendation:
        'Coba teknik rangkuman aktif (peta konsep atau latihan soal bertahap) serta jadwalkan sesi belajar rutin 30 menit setiap hari.',
    },
    low: {
      summary:
        'Gaya belajarmu mungkin lebih kuat di praktik langsung atau belum menemukan ritme belajar yang paling nyaman.',
      recommendation:
        'Eksplorasi materi tentang gaya belajar, pecah tugas besar menjadi bagian kecil, dan diskusikan strategi belajar dengan Guru BK.',
    },
  },
  sosial: {
    high: {
      summary:
        'Kamu peka terhadap orang lain, mudah menjalin relasi sehat, dan menjadi penghubung yang nyaman dalam kerja tim.',
      recommendation:
        'Kembangkan kekuatan ini di kegiatan konselor sebaya, klub debat/komunikasi, kepanitiaan sosial, atau bidang layanan masyarakat.',
    },
    medium: {
      summary:
        'Kamu mampu berinteraksi dan bekerja sama dengan baik dalam situasi kelompok yang sudah dikenal.',
      recommendation:
        'Latih keterampilan mendengar aktif dan ambil peran komunikasi kecil saat diskusi kelas untuk memperluas rasa nyaman bersosialisasi.',
    },
    low: {
      summary:
        'Kamu cenderung lebih nyaman bekerja mandiri dan memerlukan waktu lebih untuk membuka diri di lingkungan baru.',
      recommendation:
        'Mulailah berkolaborasi dalam kelompok kecil (2–3 teman) dengan pembagian peran yang jelas agar tetap nyaman sambil melatih interaksi.',
    },
  },
  kreatif: {
    high: {
      summary:
        'Kamu memiliki daya cipta yang kuat, senang mengeksplorasi sudut pandang baru, dan peka terhadap kualitas karya.',
      recommendation:
        'Kumpulkan karya terbaikmu dalam portofolio (desain, tulisan, media, atau proyek inovasi) dan ikuti lomba atau klub kreatif sekolah.',
    },
    medium: {
      summary:
        'Kamu mampu menghasilkan ide segar ketika diberi ruang bereksperimen atau inspirasi dari contoh yang jelas.',
      recommendation:
        'Biasakan mencatat ide harian dan uji satu variasi baru pada setiap tugas presentasi atau proyek sekolah.',
    },
    low: {
      summary:
        'Kamu lebih menyukai panduan terstruktur dibanding tugas yang terlalu bebas tanpa patokan awal.',
      recommendation:
        'Latih kreativitas bertahap dengan memodifikasi contoh yang sudah ada (amati–tiru–modifikasi) sebelum merancang dari nol.',
    },
  },
  kepemimpinan: {
    high: {
      summary:
        'Kamu berani mengambil inisiatif, mampu mengarahkan kerja kelompok, dan siap bertanggung jawab atas keputusan bersama.',
      recommendation:
        'Ambil peran pengurus OSIS, ketua ekstrakurikuler, atau koordinator proyek kelas sambil terus melatih gaya kepemimpinan yang inklusif.',
    },
    medium: {
      summary:
        'Kamu memiliki potensi mengoordinasikan tugas dan berani tampil saat situasi membutuhkan dukunganmu.',
      recommendation:
        'Latih pengambilan keputusan dan public speaking secara bertahap, misalnya dengan memimpin satu sesi diskusi atau menjadi penanggung jawab seksi acara.',
    },
    low: {
      summary:
        'Saat ini kamu lebih nyaman berkontribusi sebagai pelaksana yang fokus pada tugas spesifik daripada memimpin kelompok.',
      recommendation:
        'Bangun kepercayaan diri mulai dari memimpin pengelolaan waktu pribadimu sendiri, lalu coba menjadi moderator dalam diskusi kelompok kecil.',
    },
  },
  teknis: {
    high: {
      summary:
        'Kamu cekatan mengoperasikan perangkat, teliti terhadap prosedur, dan senang memecahkan masalah secara sistematis.',
      recommendation:
        'Dalami keterampilan terapan seperti pemrograman, robotika, desain CAD/digital, analisis data, atau praktik laboratorium sebagai bekal studi dan karier.',
    },
    medium: {
      summary:
        'Kamu cukup mudah beradaptasi dengan alat digital maupun tugas praktik selama langkah kerjanya jelas.',
      recommendation:
        'Pilih satu keterampilan teknis yang paling menarik minatmu dan latih melalui proyek mini mandiri setiap akhir pekan.',
    },
    low: {
      summary:
        'Kekuatan utamamu saat ini lebih banyak bertumpu pada sisi non-teknis seperti ide, analisis verbal, atau relasi sosial.',
      recommendation:
        'Pelajari keterampilan digital dasar yang menunjang minat utamamu (misalnya pengolahan dokumen, presentasi, atau spreadsheet dasar).',
    },
  },
};

export function getDimensionInterpretations(
  scores: PotentialScores
): DimensionInterpretation[] {
  return POTENTIAL_DIMENSIONS.map((dim) => {
    const score = scores[dim.scoreKey];
    const copy = INTERPRETATION_COPY[dim.id];

    if (score >= 85) {
      return {
        dimension: dim,
        score,
        level: 'Sangat Menonjol',
        summary: copy.high.summary,
        recommendation: copy.high.recommendation,
      };
    }
    if (score >= 70) {
      return {
        dimension: dim,
        score,
        level: 'Berkembang Baik',
        summary: copy.high.summary,
        recommendation: copy.medium.recommendation,
      };
    }
    if (score >= 55) {
      return {
        dimension: dim,
        score,
        level: 'Potensi Cukup',
        summary: copy.medium.summary,
        recommendation: copy.medium.recommendation,
      };
    }
    return {
      dimension: dim,
      score,
      level: 'Perlu Penguatan',
      summary: copy.low.summary,
      recommendation: copy.low.recommendation,
    };
  });
}
