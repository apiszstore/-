/**
 * Metode pembayaran.
 *
 * ============================================================
 *  CARA MENAMBAH / MENGGANTI LOGO
 * ============================================================
 *  1. Simpan file logo ke `public/payment/`
 *  2. Tulis nama file-nya di properti `logo`
 *  3. Selesai. Kalau file tidak ada atau gagal dimuat, frontend otomatis
 *     menampilkan nama metode sebagai teks, jadi tidak pernah ada gambar rusak.
 *
 * ============================================================
 *  RULES LOGO  (dijalankan otomatis oleh test)
 * ============================================================
 *  R1  Folder      : `public/payment/`
 *  R2  Nama file   : huruf kecil, tanpa spasi, WAJIB sama dengan `id`
 *                    method. Contoh id 'dana' -> dana.png / dana.svg
 *  R3  Rasio       : 1:1 (persegi). Width harus sama dengan height.
 *                    Logoodi oblong akan terlihat kecil di kotak 56x56.
 *  R4  Ukuran      : 200 x 200 px. Maximum 400 x 400 px.
 *  R5  Format      : PNG atau WebP dengan background transparan, atau SVG.
 *                    Jangan JPG: latar putihnya akan terlihat kotak.
 *                    WebP paling hemat untuk logo berbayar, dan didukung
 *                    semua browser yang dipakai visitors.
 *  R6  Berat file  : maksimal 30 KB per logo. Di atas itu, gambar tidak
 *                    perlu sebesar ini karena sudah diperkecil ke 56px.
 *                    Logo asli dari sumber resmi biasanya berukuran 980px
 *                    dan berukuran ratusan KB. Dikecilkan ke 200px, hasilnya
 *                    jadi belasan KB dan tampilannya tetap sama.
 *  R7  Padding     : beri ruang kosong di sekeliling logo, jangan sampai
 *                    logonya menempel tepi. Logo yang menyentuh tepi terlihat
 *                    terpotong begitu diperkecil.
 *
 * ============================================================
 *  RULES JUMLAH & LAYOUT
 * ============================================================
 *  R8  Jumlah bebas. Grid di Payment.jsx memakai auto-fit, jadi menambah
 *      method ke-4 atau ke-5 otomatis menambah kolom atau turun ke baris
 *      baru. Tidak perlu ubah class Tailwind.
 *  R9  Nama method maksimal 24 karakter. Nama yang lebih panjang dipecah
 *      sendiri oleh break-words, tapi lebih dari itu membuat kartu terlihat
 *      penuh.
 * R10  `id` WAJIB unik. Dipakai sebagai React key dan sebagai atribut
 *      data-payment untuk pengecekan.
 *
 * ============================================================
 *  DILARANG
 * ============================================================
 *  - Nomor telepon, nomor rekening, atau QR code yang berisi data asli
 *    TIDAK BOLEH disimpan di repo ini. Nominal dan cara bayar dikirim lewat
 *    proses order di Discord.
 *  - Jangan pakai logo resmi sebagai file milik sendiri kalau memang perlu
 *    menandai itu bukan aset asli. Cek soal izin pakai dengan pihak penerbit.
 */

export const paymentMethods = [
  {
    id: 'dana',
    name: 'DANA',
      logo: '/payment/dana.webp',
    /** Dipakai sebagai alt dan teks cadangan kalau logo gagal dimuat. */
    fallback: 'DANA',
  },
  {
    id: 'gopay',
    name: 'GoPay',
      logo: '/payment/gopay.webp',
    fallback: 'GoPay',
  },
  {
    id: 'qris',
    name: 'QRIS',
    logo: '/payment/qris.png',
    fallback: 'QRIS',
  },
];
