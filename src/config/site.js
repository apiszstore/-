/**
 * Konfigurasi global website.
 *
 * ============================================================
 *  CARA GANTI LINK DISCORD
 * ============================================================
 *  Ubah nilai `discord` di bawah, seluruh tombol "Order Now"
 *  di seluruh website ikut berubah.
 *
 *  Selama masih berisi ISI_LINK_DISCORD, semua link order akan
 *  dianggap placeholder (tidak dibuka) dan muncul toast info.
 */

export const siteConfig = {
  name: 'APISZ STORE',
  shortName: 'APISZ',
  tagline: 'Digital Service & SA-MP Solutions',
  description:
    'APISZ STORE menyediakan layanan Discord, Custom Bot, Website, SA-MP, dan produk digital dengan harga terjangkau.',

  /** Ganti dengan invite Discord asli. */
  discord: 'https://discord.gg/ISI_LINK_DISCORD',

  social: {
    discord: 'https://discord.gg/ISI_LINK_DISCORD',
    tiktok: 'https://tiktok.com/@ISI_LINK_TIKTOK',
    // Isi dengan link profil asli. Jangan pakai URL karangan.
    instagram: 'https://instagram.com/ISI_LINK_INSTAGRAM',
  },

  contact: {
    // Isi dengan kontak asli nanti. Kosongkan berarti tampil sebagai placeholder.
    email: '',
  },

  order: {
    label: 'Order Now',
    /** Pesan yang dibuka di Discord. */
    message: 'Halo APISZ STORE, saya ingin melakukan order.',
  },

  /**
   * Logo & favicon.
   *
   * Letakkan file di `public/brand/`, lalu SESUAIKAN path di bawah.
   * Kalau file belum ada / gagal dimuat, frontend otomatis kembali
   * ke tampilan teks (APISZ + STORE) dan favicon bawaan — jadi
   * website tetap rapi walau gambarnya belum diunggah.
   */
  brand: {
    /** Logo di samping nama store. Kosongkan untuk pakai teks saja. */
    logo: '/brand/logo.png',
    /** Dipakai sebagai alt kalau teks nama disembunyikan. */
    logoAlt: 'Logo APISZ STORE',
    /** false = pakai logo saja, teks "APISZ STORE" disembunyikan. */
    showName: false,
    /**
     * Ukuran asli file logo (223x100).
     *
     * PENTING: isi sesuai file yang kamu unggah. Nilai ini dipakai
     * browser untuk menyisakan ruang yang benar sebelum gambar selesai
     * dimuat, jadi navbar tidak melompat (layout shift) begitu logo
     * muncul. Mengubahnya aman kalau logo diganti dengan ukuran lain.
     */
    logoWidth: 223,
    logoHeight: 100,
    /** Favicon. File PNG paling aman (32x32 atau 48x48). */
    favicon: '/brand/favicon.png',
  },

  copyright: '© 2026 APISZ STORE. All rights reserved.',
};

/** Navbar + footer. `id` dipakai untuk scroll ke section. */
export const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'Services', id: 'services' },
  { label: 'Products', id: 'products' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Showcase', id: 'showcase' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
];

export const footerNavItems = [
  { label: 'Home', id: 'home' },
  { label: 'Services', id: 'services' },
  { label: 'Products', id: 'products' },
  { label: 'Showcase', id: 'showcase' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
];

export const footerServices = [
  { label: 'Discord Setup', id: 'services' },
  { label: 'Custom Bot', id: 'services' },
  { label: 'SA-MP', id: 'samp' },
  { label: 'Website', id: 'other' },
  { label: 'Other Services', id: 'other' },
];

/** Link yang masih placeholder tidak boleh dibuka. */
export function isPlaceholder(url) {
  if (!url) return true;
  return /ISI_LINK|ISI_NOMOR|6280000000000/.test(url);
}

/** Nama tampilan social link, atau null kalau belum diisi. */
export function socialLabel(url) {
  return isPlaceholder(url) ? 'Belum tersedia' : 'Buka';
}
