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
 *  3. Isi `rating` dengan angka 1-5 sesuai penilaian asli.
 *  4. Hapus seluruh entri demo bila sudah ada review asli.
 *
 *  `rating` hanya ditampilkan kalau berisi angka.
 *  Demo sengaja memakai `rating: null` supaya tidak menampilkan
 *  bintang palsu yang bisa disalahartikan sebagai penilaian asli.
 *  `product` = service yang dipakai.
 */

export const testimonials = [
  {
    id: 'demo-1',
    demo: true,
    name: 'Customer Name',
    username: '@username',
    product: 'Discord Server Setup',
    rating: null,
    text: 'Pelayanannya cepat dan hasilnya sesuai request.',
  },
  {
    id: 'demo-2',
    demo: true,
    name: 'Customer Name',
    username: '@username',
    product: 'Custom Discord Bot',
    rating: null,
    text: 'Ini contoh tampilan saja, bukan review asli.',
  },
  {
    id: 'demo-3',
    demo: true,
    name: 'Customer Name',
    username: '@username',
    product: 'Paket On Server',
    rating: null,
    text: 'Contoh kartu testimonial. Ganti dengan review asli nanti.',
  },
];

/** Dipakai di section How To Order / CTA. */
export const hasRealTestimonials = testimonials.some((t) => !t.demo);
