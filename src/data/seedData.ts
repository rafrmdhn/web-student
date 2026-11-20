import type {
  ActivityLog,
  Announcement,
  ConsultationInfo,
  CounselorFollowup,
  FuturePlan,
  Material,
  MaterialProgress,
  PotentialMap,
  Profile,
  ReflectionActivity,
  SiteSettings,
  StudentReflection,
} from '../types';

export interface DemoDatabase {
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
}

export const INITIAL_DEMO_DB: DemoDatabase = {
  siteSettings: {
    id: 1,
    site_name: 'ArahDiri',
    tagline: 'Ruang Bimbingan Konseling dan Pemetaan Potensi Siswa',
    accent_color: 'teal',
    show_announcement_banner: true,
  },
  profiles: [
    {
      id: 'stu-nadia',
      full_name: 'Nadia Pramesti',
      email: 'nadia.siswa@sekolah.sch.id',
      role: 'siswa',
      class_name: 'XI IPA 2',
      is_active: true,
      share_activity_consent: true,
      created_at: '2026-08-10T08:00:00Z',
    },
    {
      id: 'stu-rafi',
      full_name: 'Rafi Mahendra',
      email: 'rafi.siswa@sekolah.sch.id',
      role: 'siswa',
      class_name: 'XI IPS 1',
      is_active: true,
      share_activity_consent: false,
      created_at: '2026-08-11T08:30:00Z',
    },
    {
      id: 'stu-salsa',
      full_name: 'Salsabila Putri',
      email: 'salsa.siswa@sekolah.sch.id',
      role: 'siswa',
      class_name: 'XII IPA 1',
      is_active: true,
      share_activity_consent: true,
      created_at: '2026-08-12T09:15:00Z',
    },
    {
      id: 'bk-ratna',
      full_name: 'Ibu Ratna Wulandari, S.Pd., Kons.',
      email: 'ratna.bk@sekolah.sch.id',
      role: 'guru_bk',
      class_name: 'Tim BK Sekolah',
      is_active: true,
      share_activity_consent: false,
      created_at: '2026-07-01T07:00:00Z',
    },
    {
      id: 'adm-budi',
      full_name: 'Budi Santoso',
      email: 'admin@sekolah.sch.id',
      role: 'admin',
      class_name: 'Pengelola Sistem',
      is_active: true,
      share_activity_consent: false,
      created_at: '2026-07-01T06:30:00Z',
    },
  ],
  materials: [
    {
      id: 'mat-1',
      title: 'Mengenali Gaya Belajar yang Cocok dengan Kebiasaanmu',
      category: 'Gaya Belajar',
      summary:
        'Memahami perbedaan cara menyerap informasi secara visual, auditori, dan praktik langsung agar waktu belajar lebih efektif.',
      content:
        'Setiap siswa memiliki ritme dan jalur paling nyaman saat memahami materi baru. Sebagian orang cepat menangkap pola lewat peta konsep dan warna (visual), sebagian lain lebih kuat saat mendengar penjelasan atau berdiskusi lisan (auditori), sementara banyak pula yang baru benar-benar paham ketika langsung mencoba latihan atau eksperimen (kinestetik).\n\nLangkah praktis minggu ini:\n1. Amati dua mata pelajaran yang paling mudah kamu ikuti, lalu catat cara kamu mempelajarinya.\n2. Uji satu teknik baru selama tiga hari, misalnya merangkum satu halaman catatan menjadi diagram alur sederhana.\n3. Evaluasi apakah materi lebih cepat diingat dibanding cara belajarmu sebelumnya.',
      status: 'published',
      author_id: 'bk-ratna',
      created_at: '2026-10-02T09:00:00Z',
    },
    {
      id: 'mat-2',
      title: 'Memetakan Minat vs Bakat Tanpa Terburu-buru',
      category: 'Eksplorasi Bakat',
      summary:
        'Cara membedakan hal yang sekadar menyenangkan sesaat dengan keterampilan yang layak diasah menjadi kekuatan jangka panjang.',
      content:
        'Minat adalah rasa ingin tahu yang membuatmu rela meluangkan waktu tanpa disuruh. Bakat adalah kecenderungan kemampuan yang membuatmu berkembang lebih cepat saat berlatih di bidang tersebut. Keduanya tidak harus langsung sempurna di bangku sekolah.\n\nCobalah membuat dua kolom di catatan refleksimu: kegiatan yang membuatmu lupa waktu, dan kegiatan di mana teman atau guru sering meminta bantuanmu. Irisan di antara dua kolom tersebut biasanya menjadi titik awal peta potensi yang kuat.',
      status: 'published',
      author_id: 'bk-ratna',
      created_at: '2026-10-08T10:15:00Z',
    },
    {
      id: 'mat-3',
      title: 'Mengelola Tekanan Ujian dan Ekspektasi Sekitar',
      category: 'Manajemen Emosi',
      summary:
        'Teknik sederhana untuk mengenali tanda lelah mental, menata ulang target realistis, dan meminta bantuan sebelum kewalahan.',
      content:
        'Rasa tegang menjelang penilaian atau pemilihan jurusan adalah reaksi wajar. Yang perlu dijaga adalah agar ketegangan tidak berubah menjadi kelelahan berkepanjangan.\n\nGunakan pola jeda 4-4-4 saat pikiran mulai penuh: tarik napas empat hitungan, tahan empat hitungan, hembuskan perlahan empat hitungan. Setelah tenang, pecah beban besar menjadi satu langkah kecil berdurasi 20 menit. Jika tekanan terasa berat selama lebih dari dua pekan, jadwalkan obrolan santai di ruang BK.',
      status: 'published',
      author_id: 'bk-ratna',
      created_at: '2026-10-15T11:30:00Z',
    },
    {
      id: 'mat-4',
      title: 'Mengenal Pola Kepribadian dan Cara Berkolaborasi di Tim',
      category: 'Kepribadian',
      summary:
        'Memahami sumber energi diri dan peran alami saat bekerja kelompok agar komunikasi dengan teman sebaya lebih sehat.',
      content:
        'Tidak semua pemimpin harus berbicara paling keras, dan tidak semua pendengar berarti pasif. Dalam kerja kelompok, ada siswa yang unggul merancang struktur tugas, ada yang cekatan mencairkan suasana, dan ada yang teliti memeriksa hasil akhir.\n\nKenali situasi yang membuat energimu terisi kembali: apakah setelah berdiskusi ramai atau setelah bekerja fokus sendiri? Mengenali batas energi membantumu memilih peran yang tepat sekaligus menghargai gaya kerja temanmu.',
      status: 'published',
      author_id: 'bk-ratna',
      created_at: '2026-10-24T08:45:00Z',
    },
    {
      id: 'mat-5',
      title: 'Panduan Awal Memilih Jurusan Kuliah dan Jalur Vokasi',
      category: 'Eksplorasi Bakat',
      summary:
        'Draf panduan membandingkan mata kuliah, proyek praktik, serta prospek pengembangan diri antara jalur akademik dan vokasi.',
      content:
        'Sebelum terpaku pada nama jurusan populer, telusuri daftar mata kuliah atau keterampilan praktik di semester 1 sampai 4. Tanyakan pada diri sendiri apakah kamu menikmati proses mempelajarinya setiap minggu, bukan hanya membayangkan hasil akhirnya.',
      status: 'draft',
      author_id: 'bk-ratna',
      created_at: '2026-11-12T13:20:00Z',
    },
  ],
  materialProgress: [
    {
      id: 'mp-1',
      student_id: 'stu-nadia',
      material_id: 'mat-1',
      completed_at: '2026-11-04T15:10:00Z',
    },
    {
      id: 'mp-2',
      student_id: 'stu-nadia',
      material_id: 'mat-2',
      completed_at: '2026-11-10T16:25:00Z',
    },
    {
      id: 'mp-3',
      student_id: 'stu-salsa',
      material_id: 'mat-1',
      completed_at: '2026-11-06T14:00:00Z',
    },
  ],
  reflectionActivities: [
    {
      id: 'act-1',
      title: 'Refleksi Pekan Ini: Aktivitas yang Membuatku Fokus',
      prompt:
        'Ceritakan satu kegiatan di sekolah atau luar sekolah selama tujuh hari terakhir yang membuatmu bersemangat dan ingin mendalaminya lebih jauh. Kekuatan apa yang kamu pakai saat melakukannya?',
      due_date: '2026-11-28',
      is_active: true,
      created_by: 'bk-ratna',
      created_at: '2026-11-15T08:00:00Z',
    },
    {
      id: 'act-2',
      title: 'Persiapan Arah Studi & Karier Semester Ini',
      prompt:
        'Bidang pelajaran atau proyek apa yang paling ingin kamu kuasai semester ini, dan hambatan kecil apa yang paling sering menghalangimu?',
      due_date: '2026-12-05',
      is_active: true,
      created_by: 'bk-ratna',
      created_at: '2026-11-17T09:30:00Z',
    },
  ],
  studentReflections: [
    {
      id: 'ref-1',
      student_id: 'stu-nadia',
      activity_id: 'act-1',
      interest_notes: 'Desain antarmuka digital, pengolahan data biologi, dan fotografi dokumenter.',
      strength_notes: 'Teliti menyusun catatan visual dan nyaman menjelaskan materi rumit ke teman.',
      reflection_content:
        'Minggu ini saat membuat poster penelitian biologi bersama kelompok, saya merasa paling menikmati bagian menyusun alur data supaya mudah dipahami. Saya sadar saya suka menggabungkan sains dengan penyampaian visual.',
      created_at: '2026-11-18T14:20:00Z',
    },
    {
      id: 'ref-2',
      student_id: 'stu-rafi',
      activity_id: 'act-1',
      interest_notes: 'Debat sosial, penulisan opini, dan manajemen acara sekolah.',
      strength_notes: 'Cepat membangun percakapan dan berani berbicara di depan kelas.',
      reflection_content:
        'Catatan pribadi: saya sedang mempertimbangkan antara ilmu komunikasi atau hukum, tetapi masih ingin memikirkannya sendiri sebelum membuka diskusi dengan Guru BK.',
      created_at: '2026-11-18T18:45:00Z',
    },
    {
      id: 'ref-3',
      student_id: 'stu-salsa',
      activity_id: 'act-2',
      interest_notes: 'Pemrograman web, logika matematika, dan robotika dasar.',
      strength_notes: 'Tekun memecahkan soal bertahap dan konsisten mencatat progres belajar.',
      reflection_content:
        'Saya ingin masuk jurusan Teknik Informatika tahun depan. Tantangan terbesar saya saat ini adalah membagi waktu antara persiapan ujian sekolah dan latihan proyek mandiri.',
      created_at: '2026-11-19T10:05:00Z',
    },
  ],
  potentialMaps: [
    {
      id: 'pm-nadia',
      student_id: 'stu-nadia',
      academic_score: 84,
      social_score: 76,
      creative_score: 90,
      leadership_score: 72,
      technical_score: 78,
      top_strengths: 'Visualisasi ide, ketelitian analisis, empati dalam kerja kelompok',
      top_interests: 'Desain produk digital, bioteknologi, komunikasi sains',
      updated_at: '2026-11-18T14:35:00Z',
    },
    {
      id: 'pm-rafi',
      student_id: 'stu-rafi',
      academic_score: 75,
      social_score: 88,
      creative_score: 74,
      leadership_score: 86,
      technical_score: 62,
      top_strengths: 'Komunikasi publik, negosiasi tim, kepekaan isu sosial',
      top_interests: 'Ilmu komunikasi, organisasi siswa, jurnalisme',
      updated_at: '2026-11-17T16:00:00Z',
    },
    {
      id: 'pm-salsa',
      student_id: 'stu-salsa',
      academic_score: 91,
      social_score: 70,
      creative_score: 75,
      leadership_score: 77,
      technical_score: 93,
      top_strengths: 'Pemecahan masalah logis, ketekunan teknis, manajemen waktu',
      top_interests: 'Rekayasa perangkat lunak, analisis data, kecerdasan buatan',
      updated_at: '2026-11-19T09:50:00Z',
    },
  ],
  futurePlans: [
    {
      id: 'plan-1',
      student_id: 'stu-nadia',
      title: 'Menyusun Portofolio Desain & Sains Kelas XI',
      timeframe: 'jangka_pendek',
      target_goal: 'Memiliki 3 karya infografis sains dan 1 studi kasus desain aplikasi pelajar.',
      action_steps: [
        { id: 's1', label: 'Mengumpulkan catatan praktikum biologi yang layak divisualkan', done: true },
        { id: 's2', label: 'Membuat sketsa tata letak di buku catatan atau Figma', done: true },
        { id: 's3', label: 'Meminta masukan Guru BK dan guru pembimbing klub desain', done: false },
      ],
      progress: 67,
      created_at: '2026-11-12T10:00:00Z',
    },
    {
      id: 'plan-2',
      student_id: 'stu-nadia',
      title: 'Eksplorasi Jurusan Desain Komunikasi Visual & Sains Data',
      timeframe: 'jangka_menengah',
      target_goal: 'Menentukan dua pilihan jurusan prioritas sebelum semester 1 kelas XII.',
      action_steps: [
        { id: 's4', label: 'Membaca kurikulum semester awal dua kampus tujuan', done: true },
        { id: 's5', label: 'Mengikuti sesi konsultasi pilihan jurusan di ruang BK', done: false },
        { id: 's6', label: 'Berdiskusi dengan alumni sekolah tentang pengalaman kuliah', done: false },
      ],
      progress: 33,
      created_at: '2026-11-14T11:30:00Z',
    },
    {
      id: 'plan-3',
      student_id: 'stu-salsa',
      title: 'Persiapan Seleksi Masuk Teknik Informatika',
      timeframe: 'jangka_menengah',
      target_goal: 'Menjaga nilai rapor eksakta di atas 88 dan menyelesaikan 2 proyek web.',
      action_steps: [
        { id: 's7', label: 'Menjadwalkan latihan penalaran kuantitatif 3 kali sepekan', done: true },
        { id: 's8', label: 'Menyelesaikan proyek aplikasi jadwal belajar', done: true },
        { id: 's9', label: 'Mengikuti tryout berkala dan evaluasi hasil bersama BK', done: false },
      ],
      progress: 67,
      created_at: '2026-11-15T13:00:00Z',
    },
  ],
  counselorFollowups: [
    {
      id: 'fu-1',
      student_id: 'stu-nadia',
      counselor_id: 'bk-ratna',
      guidance_note:
        'Kombinasi skor Kreatif (90) dan Akademik (84) pada Peta Potensi Nadia sangat selaras dengan catatan refleksinya. Minat pada visualisasi sains bisa menjadi jalur unik yang kuat.',
      recommendation:
        'Coba ikuti sesi diskusi pilihan jurusan pada Rabu minggu depan dan bawa satu contoh infografis buatanmu agar kita bisa memetakan jurusan yang paling sesuai.',
      status: 'pendampingan',
      updated_at: '2026-11-19T11:20:00Z',
    },
    {
      id: 'fu-2',
      student_id: 'stu-salsa',
      counselor_id: 'bk-ratna',
      guidance_note:
        'Arah studi Salsa sudah sangat terfokus dan progres rencana belajarnya konsisten. Perlu memastikan jeda istirahat tetap terjaga menjelang ujian akhir.',
      recommendation:
        'Susun jadwal belajar mingguan dengan satu hari bebas proyek mandiri agar energi tetap stabil sampai seleksi masuk perguruan tinggi.',
      status: 'selesai',
      updated_at: '2026-11-19T15:10:00Z',
    },
  ],
  consultationInfo: [
    {
      id: 'ci-1',
      counselor_name: 'Ibu Ratna Wulandari, S.Pd., Kons.',
      schedule: 'Senin & Rabu, 09.00–14.30 WIB',
      location_or_link: 'Ruang BK Lantai 2 / meet.google.com/bk-arahdiri-ratna',
      contact_info: 'bk.ratna@sekolah.sch.id | WA 0812-3400-8811',
      notes: 'Pendampingan pemilihan jurusan, strategi belajar, dan pengembangan potensi akademik.',
    },
    {
      id: 'ci-2',
      counselor_name: 'Bapak Hendra Kusuma, M.Psi.',
      schedule: 'Selasa & Kamis, 10.00–15.00 WIB',
      location_or_link: 'Ruang Konseling B / meet.google.com/bk-arahdiri-hendra',
      contact_info: 'bk.hendra@sekolah.sch.id | WA 0813-7721-9040',
      notes: 'Konseling pengelolaan emosi, kepercayaan diri, relasi sebaya, dan kesiapan karier.',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Pekan Pemetaan Minat dan Bakat Semester Genap',
      content:
        'Siswa kelas X dan XI dipersilakan melengkapi Peta Potensi serta satu catatan refleksi sebelum Jumat, 28 November. Jika ingin berdiskusi bersama Guru BK, aktifkan izin berbagi ringkasan di menu Privasi dan Bantuan.',
      is_active: true,
      created_by: 'adm-budi',
      created_at: '2026-11-16T07:30:00Z',
    },
    {
      id: 'ann-2',
      title: 'Layanan Konsultasi Karier dan Studi Lanjut Dibuka',
      content:
        'Ruang BK lantai 2 dan sesi konsultasi daring tersedia setiap Senin hingga Kamis pukul 09.00–14.30 WIB untuk pembahasan pilihan jurusan serta rencana belajar.',
      is_active: true,
      created_by: 'adm-budi',
      created_at: '2026-11-18T08:00:00Z',
    },
  ],
  activityLogs: [
    {
      id: 'log-1',
      user_id: 'stu-nadia',
      user_name: 'Nadia Pramesti',
      action: 'Memperbarui Peta Potensi',
      module: 'Peta Potensi',
      detail: 'Skor Kreatif diperbarui menjadi 90 dengan minat baru di komunikasi sains.',
      created_at: '2026-11-18T14:35:00Z',
    },
    {
      id: 'log-2',
      user_id: 'bk-ratna',
      user_name: 'Ibu Ratna Wulandari, S.Pd., Kons.',
      action: 'Mengirim Arahan & Tindak Lanjut',
      module: 'Pendampingan BK',
      detail: 'Memberikan rekomendasi diskusi jurusan untuk Nadia Pramesti (status: pendampingan).',
      created_at: '2026-11-19T11:20:00Z',
    },
    {
      id: 'log-3',
      user_id: 'adm-budi',
      user_name: 'Budi Santoso',
      action: 'Menerbitkan Pengumuman',
      module: 'Pengumuman',
      detail: 'Menayangkan pengumuman Layanan Konsultasi Karier dan Studi Lanjut.',
      created_at: '2026-11-18T08:00:00Z',
    },
  ],
};
