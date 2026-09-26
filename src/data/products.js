/**
 * Katalog produk digital.
 *
 * ============================================================
 *  CARA MENAMBAH PRODUK BARU
 * ============================================================
 *  1. Salin satu blok di bawah ke dalam array `products`.
 *  2. Isi `id` (unik, tanpa spasi), `name`, `category`, `description`,
 *     `price` (angka tanpa titik, atau `null` = Custom Pricing).
 *  3. Pilih `status`: 'available' | 'soon' | 'custom' | 'unavailable'.
 *  4. Taruh file gambar di /public dan isi `image` dengan path-nya.
 *     Contoh: image: '/products/speedometer.png'
 *     Kalau `image` null, kartu memakai placeholder otomatis.
 *  5. `category` harus salah satu dari `productCategories` di bawah
 *     supaya filter bekerja.
 *
 *  PENTING: jangan isi produk fiktif. Array ini sengaja kosong sampai
 *  produk asli tersedia.
 */

export const productCategories = ['SA-MP', 'Textdraw', 'Discord', 'Website', 'Other'];

/** Filter yang tampil di katalog. */
export const productFilters = ['All', ...productCategories];

/**
 * @type {Array<{
 *   id: string, name: string, category: string, tagline: string,
 *   description: string, features: string[], price: number|null,
 *   status: string, image: string|null,
 *   requirements: string[], notes: string|null
 * }>}
 */
export const products = [
  /*
  {
    id: 'speedometer-modern',
    name: 'Modern SA-MP Speedometer',
    category: 'Textdraw',
    tagline: 'Speedometer vehicle modern untuk project SA-MP.',
    description: 'Modern vehicle speedometer untuk project SA-MP.',
    features: ['Modern UI', 'Easy installation', 'Responsive layout', 'Customizable'],
    price: 25000,
    status: 'available',
    image: null,
    requirements: ['SA-MP server', 'streamer.inc'],
    notes: null,
  },
  */
];
