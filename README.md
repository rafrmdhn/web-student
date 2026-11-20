# ArahDiri — Platform Web BK & Pengembangan Potensi Siswa

Platform web Bimbingan Konseling (BK) dan pengembangan potensi siswa berbasis **React 18 + Vite + TypeScript + Tailwind CSS + Supabase** yang dapat di-hosting secara gratis di **Vercel** dan **Supabase**.

## Fitur Utama

Aplikasi langsung berfokus pada **3 Dashboard Terintegrasi** (dengan 6 menu wajib proposal terpasang di navigasi Dashboard Siswa: *Beranda, Kenali Diriku, Peta Potensi, Rencana Masa Depan, Refleksi dan Tindak Lanjut, Privasi dan Bantuan*):

- **Dashboard Siswa**: Ringkasan progres, baca materi *Kenali Diriku* & tandai selesai, *Peta Potensi* (Radar Chart 5 dimensi), CRUD *Rencana Masa Depan*, *Refleksi & Arahan BK*, serta pengaturan *Privasi & Bantuan*.
- **Dashboard Guru BK**: Analitik partisipasi, CRUD Materi BK, CRUD Kegiatan Refleksi, Ringkasan Aktivitas Siswa berbasis persetujuan privasi, Arahan & Tindak Lanjut, dan Jadwal Konsultasi.
- **Dashboard Admin**: Pemantauan sistem & Activity Log, Kelola Akun & Hak Akses, Moderasi Materi, Pengaturan Tampilan Website (*live accent theme*), dan Pengumuman Global.

## Menjalankan Secara Lokal (Mode Demo Otomatis)

```bash
npm install
npm run dev
```

Jika file `.env` belum diisi, aplikasi otomatis berjalan dalam **Mode Demo Lokal** (`localStorage`) lengkap dengan data awal realistis dan tombol **Ganti Peran** (`Siswa` / `Guru BK` / `Admin`) di bilah atas dashboard.

## Menghubungkan ke Supabase (Gratis)

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan seluruh isi file `supabase/schema.sql`.
3. Jalankan isi file `supabase/seed.sql` untuk mengisi data awal (materi, pengumuman, jadwal konsultasi, pengaturan tampilan).
4. Salin `.env.example` menjadi `.env`, lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari menu **Project Settings → API** di Supabase.
5. Jalankan ulang `npm run dev`. Indikator di dashboard akan otomatis berubah menjadi **Supabase Terhubung**.

## Deploy Gratis ke Vercel

1. Unggah repositori ini ke GitHub.
2. Buka [vercel.com](https://vercel.com), pilih **Add New Project**, lalu impor repositori Anda.
3. Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klik **Deploy**.
