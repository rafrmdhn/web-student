-- ============================================================================
-- Data Awal (Seed) untuk Platform Web BK & Pengembangan Potensi Siswa
-- Jalankan setelah supabase/schema.sql berhasil dieksekusi.
-- ============================================================================

insert into public.site_settings (id, site_name, tagline, accent_color, show_announcement_banner)
values (
  1,
  'ArahDiri',
  'Ruang Bimbingan Konseling dan Pemetaan Potensi Siswa',
  'teal',
  true
)
on conflict (id) do nothing;

insert into public.announcements (title, content, is_active)
values
  (
    'Pekan Pemetaan Minat dan Bakat Semester Genap',
    'Siswa kelas X dan XI dipersilakan melengkapi Peta Potensi serta satu catatan refleksi sebelum Jumat, 28 November. Jika ingin berdiskusi bersama Guru BK, aktifkan izin berbagi ringkasan di menu Privasi dan Bantuan.',
    true
  ),
  (
    'Layanan Konsultasi Karier dan Studi Lanjut Dibuka',
    'Ruang BK lantai 2 dan sesi konsultasi daring tersedia setiap Senin hingga Kamis pukul 09.00–14.30 WIB untuk pembahasan pilihan jurusan serta rencana belajar.',
    true
  );

insert into public.consultation_info (counselor_name, schedule, location_or_link, contact_info, notes)
values
  (
    'Ibu Ratna Wulandari, S.Pd., Kons.',
    'Senin & Rabu, 09.00–14.30 WIB',
    'Ruang BK Lantai 2 / meet.google.com/bk-arahdiri-ratna',
    'bk.ratna@sekolah.sch.id | WA 0812-3400-8811',
    'Pendampingan pemilihan jurusan, strategi belajar, dan pengembangan potensi akademik.'
  ),
  (
    'Bapak Hendra Kusuma, M.Psi.',
    'Selasa & Kamis, 10.00–15.00 WIB',
    'Ruang Konseling B / meet.google.com/bk-arahdiri-hendra',
    'bk.hendra@sekolah.sch.id | WA 0813-7721-9040',
    'Konseling pengelolaan emosi, kepercayaan diri, relasi sebaya, dan kesiapan karier.'
  );

insert into public.materials (title, category, summary, content, status)
values
  (
    'Mengenali Gaya Belajar yang Cocok dengan Kebiasaanmu',
    'Gaya Belajar',
    'Memahami perbedaan cara menyerap informasi secara visual, auditori, dan praktik langsung agar waktu belajar lebih efektif.',
    'Setiap siswa memiliki ritme dan jalur paling nyaman saat memahami materi baru. Sebagian orang cepat menangkap pola lewat peta konsep dan warna (visual), sebagian lain lebih kuat saat mendengar penjelasan atau berdiskusi lisan (auditori), sementara banyak pula yang baru benar-benar paham ketika langsung mencoba latihan atau eksperimen (kinestetik).\n\nLangkah praktis minggu ini:\n1. Amati dua mata pelajaran yang paling mudah kamu ikuti, lalu catat cara kamu mempelajarinya.\n2. Uji satu teknik baru selama tiga hari, misalnya merangkum satu halaman catatan menjadi diagram alur sederhana.\n3. Evaluasi apakah materi lebih cepat diingat dibanding cara belajarmu sebelumnya.',
    'published'
  ),
  (
    'Memetakan Minat vs Bakat Tanpa Terburu-buru',
    'Eksplorasi Bakat',
    'Cara membedakan hal yang sekadar menyenangkan sesaat dengan keterampilan yang layak diasah menjadi kekuatan jangka panjang.',
    'Minat adalah rasa ingin tahu yang membuatmu rela meluangkan waktu tanpa disuruh. Bakat adalah kecenderungan kemampuan yang membuatmu berkembang lebih cepat saat berlatih di bidang tersebut. Keduanya tidak harus langsung sempurna di bangku sekolah.\n\nCobalah membuat dua kolom di catatan refleksimu: kegiatan yang membuatmu lupa waktu, dan kegiatan di mana teman atau guru sering meminta bantuanmu. Irisan di antara dua kolom tersebut biasanya menjadi titik awal peta potensi yang kuat.',
    'published'
  ),
  (
    'Mengelola Tekanan Ujian dan Ekspektasi Sekitar',
    'Manajemen Emosi',
    'Teknik sederhana untuk mengenali tanda lelah mental, menata ulang target realistis, dan meminta bantuan sebelum kewalahan.',
    'Rasa tegang menjelang penilaian atau pemilihan jurusan adalah reaksi wajar. Yang perlu dijaga adalah agar ketegangan tidak berubah menjadi kelelahan berkepanjangan.\n\nGunakan pola jeda 4-4-4 saat pikiran mulai penuh: tarik napas empat hitungan, tahan empat hitungan, hembuskan perlahan empat hitungan. Setelah tenang, pecah beban besar menjadi satu langkah kecil berdurasi 20 menit. Jika tekanan terasa berat selama lebih dari dua pekan, jadwalkan obrolan santai di ruang BK.',
    'published'
  ),
  (
    'Mengenal Pola Kepribadian dan Cara Berkolaborasi di Tim',
    'Kepribadian',
    'Memahami sumber energi diri dan peran alami saat bekerja kelompok agar komunikasi dengan teman sebaya lebih sehat.',
    'Tidak semua pemimpin harus berbicara paling keras, dan tidak semua pendengar berarti pasif. Dalam kerja kelompok, ada siswa yang unggul merancang struktur tugas, ada yang cekatan mencairkan suasana, dan ada yang teliti memeriksa hasil akhir.\n\nKenali situasi yang membuat energimu terisi kembali: apakah setelah berdiskusi ramai atau setelah bekerja fokus sendiri? Mengenali batas energi membantumu memilih peran yang tepat sekaligus menghargai gaya kerja temanmu.',
    'published'
  );

insert into public.reflection_activities (title, prompt, due_date, is_active)
values
  (
    'Refleksi Pekan Ini: Aktivitas yang Membuatku Fokus',
    'Ceritakan satu kegiatan di sekolah atau luar sekolah selama tujuh hari terakhir yang membuatmu merasa bersemangat dan ingin mendalaminya lebih jauh. Kekuatan apa yang kamu pakai saat melakukannya?',
    current_date + interval '7 days',
    true
  ),
  (
    'Persiapan Arah Studi & Karier Semester Ini',
    'Bidang pelajaran atau proyek apa yang paling ingin kamu kuasai semester ini, dan hambatan kecil apa yang paling sering menghalangimu?',
    current_date + interval '14 days',
    true
  );


-- 25 Pertanyaan Kuesioner Peta Potensi (5 dimensi x 5 pertanyaan)
insert into public.potential_questions (question_number, dimension, question_text, is_active)
values
  (1, 'akademik', 'Saya senang membaca atau mencari penjelasan tambahan saat menemukan konsep pelajaran yang belum saya pahami.', true),
  (2, 'akademik', 'Saya mampu merangkum materi pelajaran menjadi catatan yang runtut dan mudah dipelajari kembali.', true),
  (3, 'akademik', 'Saya menikmati kegiatan menganalisis data, grafik, atau soal yang membutuhkan penalaran logis.', true),
  (4, 'akademik', 'Saya biasanya menyiapkan jadwal belajar atau target tugas jauh sebelum tenggat waktu tiba.', true),
  (5, 'akademik', 'Saya tertarik mendalami satu topik pelajaran hingga benar-benar mengerti alasan di balik setiap langkahnya.', true),
  (6, 'sosial', 'Saya mudah menangkap perasaan teman dan berusaha mendengarkan dengan penuh perhatian saat mereka bercerita.', true),
  (7, 'sosial', 'Saya merasa nyaman berdiskusi dan bertukar pendapat dengan teman baru maupun kelompok yang beragam.', true),
  (8, 'sosial', 'Ketika terjadi perbedaan pendapat di kelompok, saya berusaha mencairkan suasana dan mencari titik temu.', true),
  (9, 'sosial', 'Saya senang membantu menjelaskan pelajaran atau memberi dukungan kepada teman yang sedang kesulitan.', true),
  (10, 'sosial', 'Saya merasa berenergi ketika terlibat dalam kegiatan kolaboratif, bakti sosial, atau kepanitiaan bersama.', true),
  (11, 'kreatif', 'Saya sering memunculkan ide cara penyampaian tugas yang berbeda dari kebiasaan teman-teman lain.', true),
  (12, 'kreatif', 'Saya menikmati kegiatan merancang visual, menulis cerita, membuat musik, video, atau karya seni lainnya.', true),
  (13, 'kreatif', 'Saat menghadapi masalah yang buntu, saya suka mencoba sudut pandang baru yang belum terpikirkan sebelumnya.', true),
  (14, 'kreatif', 'Saya peka terhadap keindahan tata letak, warna, ritme, atau gaya bahasa dalam suatu karya.', true),
  (15, 'kreatif', 'Saya merasa tertantang ketika diberi tugas terbuka yang membebaskan saya menentukan bentuk karyanya sendiri.', true),
  (16, 'kepemimpinan', 'Saya berani mengambil inisiatif membagi tugas agar kerja kelompok berjalan teratur dan selesai tepat waktu.', true),
  (17, 'kepemimpinan', 'Saya percaya diri menyampaikan pendapat atau mempresentasikan hasil diskusi kelompok di depan kelas.', true),
  (18, 'kepemimpinan', 'Ketika kelompok menghadapi hambatan, saya berusaha tetap tenang dan mengajak anggota mencari keputusan bersama.', true),
  (19, 'kepemimpinan', 'Saya tertarik terlibat dalam kepengurusan organisasi sekolah, ekstrakurikuler, atau menjadi koordinator acara.', true),
  (20, 'kepemimpinan', 'Saya siap bertanggung jawab atas hasil kerja tim dan memastikan setiap anggota merasa dilibatkan.', true),
  (21, 'teknis', 'Saya cepat memahami cara kerja aplikasi baru, perangkat digital, atau alat praktik di laboratorium dan bengkel.', true),
  (22, 'teknis', 'Saya menikmati kegiatan merakit, memperbaiki, atau menguji coba cara kerja suatu sistem secara langsung.', true),
  (23, 'teknis', 'Saya teliti mengikuti langkah prosedural dan mengecek ulang detail teknis agar hasil praktik bebas kesalahan.', true),
  (24, 'teknis', 'Saya tertarik mempelajari keterampilan terapan seperti pemrograman, desain teknis, elektronika, atau pengolahan data.', true),
  (25, 'teknis', 'Ketika perangkat atau alat mengalami kendala, saya cenderung mencoba menelusuri sumber masalahnya secara bertahap.', true)
on conflict (question_number) do nothing;
