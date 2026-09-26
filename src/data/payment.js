/**
 * Metode pembayaran.
 *
 * ============================================================
 *  CARA MENUBAH GAMBAR
 * ============================================================
 *  1. Simpan file logo ke folder `public/payment/`
 *  2. Tulis nama file-nya di `logo` (contoh: 'dana.png')
 *  3. Kalau logo belum ada / gagal dimuat, frontend otomatis
 *     menampilkan nama metode sebagai teks saja, jadi tidak
 *     muncul ikon gambar rusak.
 *
 *  File yang diharapkan:
 *  ─────────────────────────────────────────
 *  public/payment/dana.png
 *  public/payment/gopay.png
 *  public/payment/qris.png
 *
 *  Saran ukuran: logo 200x200 px (kotak) atau rasio 1:1, PNG/SVG.
 *  Kalau pakai SVG, ganti ekstensi di `logo` juga.
 *
 *  TIDAK ada nomor telepon / ID di data ini. Nominal diberikan
 *  lewat proses order di Discord.
 */

export const paymentMethods = [
  {
    id: 'dana',
    name: 'DANA',
    logo: '/payment/dana.png',
    /** Dipakai sebagai alt & teks cadangan kalau logo gagal dimuat. */
    fallback: 'DANA',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    logo: '/payment/gopay.png',
    fallback: 'GoPay',
  },
  {
    id: 'qris',
    name: 'QRIS',
    logo: '/payment/qris.png',
    fallback: 'QRIS',
  },
];
