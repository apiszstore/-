/**
 * Testimonial.
 *
 * ============================================================
 *  PENTING: JANGAN ISI TESTIMONIAL PALSU.
 * ============================================================
 *  `demo: true` berarti kartu ini bukan review asli — frontend
 *  akan menandaiinya dengan badge "Demo" supaya tidak disalahartikan.
 *
 *  CARA MENAMBAH TESTIMONIAL ASLI
 * ============================================================
 *  1. Ambil review asli (dari Discord / chat customer).
 *  2. Tambahkan objek baru dengan `demo: false`.
 *  3. Hapus seluruh entri demo bila sudah ada review asli.
 *
 *  Field yang dipakai frontend:
 *  ────────────────────────────────────────────────────────────
 *  name     nama customer           : "Budi Santoso"
 *  tag      label di bawah nama     : "Verified Buyer" / "Repeat Order"
 *  username handle asli (opsional)   : "@budi"
 *  product  produk/jasa yang dipakai: "Discord Server Setup"
 *  rating   bintang 1-5             : 5   (wajib angka, bukan string)
 *  date     tanggal YYYY-MM-DD      : "2026-01-15"
 *  text     komentar                : "..."
 * ============================================================
 *
 *  `rating` dan `date` WAJIB diisi untuk entri non-demo. Kalau kosong,
 *  frontend menyembunyikan barisnya supaya tidak ada bintang atau
 *  tanggal yang terasa karangan.
 */

export const testimonials = [
  {
    id: 'demo-1',
    demo: true,
    name: 'Customer Name',
    tag: 'Verified Buyer',
    username: '@username',
    product: 'Discord Server Setup',
    rating: 5,
    date: '2026-01-15',
    text: 'Pelayanannya cepat dan hasilnya sesuai request.',
  },
  {
    id: 'demo-2',
    demo: true,
    name: 'Customer Name',
    tag: 'Custom Project',
    username: '@username',
    product: 'Custom Discord Bot',
    rating: 5,
    date: '2026-02-03',
    text: 'Ini contoh tampilan saja, bukan review asli.',
  },
  {
    id: 'demo-3',
    demo: true,
    name: 'Customer Name',
    tag: 'Paket On Server',
    username: '@username',
    product: 'SA-MP Standar',
    rating: 4,
    date: '2026-03-20',
    text: 'Contoh kartu testimonial. Ganti dengan review asli nanti.',
  },
];

/** Dipakai di section Testimonials untuk menyesuaikan judul & badge. */
export const hasRealTestimonials = testimonials.some((t) => !t.demo);
