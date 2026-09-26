/**
 * ============================================================
 *  APISZ STORE — KONFIGURASI UTAMA
 * ============================================================
 *  Semua link kontak, nominal, dan info toko ada di file ini.
 *  Ganti nilai yang masih "YOUR_..." / "COMING SOON" dengan data asli.
 *  Penting: JANGAN mengarang link / nomor. Biarkan placeholder
 *  sampai data aslinya tersedia.
 * ============================================================
 */

const storeConfig = {
  /* ---------- IDENTITAS ---------- */
  storeName: 'APISZ STORE',
  brandLine1: 'APISZ',
  brandLine2: 'STORE',
  tagline: 'Digital Service & SA-MP Service',
  shortDescription:
    'Solusi jasa digital, Discord, dan SA-MP dengan harga terjangkau untuk pelajar.',

  /* URL toko (untuk SEO / share link). Ganti dengan domain asli. */
  siteUrl: 'YOUR_SITE_URL_HERE',
  email: 'YOUR_EMAIL_HERE',

  /* ---------- KONTAK & SOSMED ---------- */
  social: {
    discord: {
      label: 'APISZ STORE',
      invite: 'YOUR_DISCORD_INVITE',
    },
    whatsapp: {
      label: 'Coming Soon',
      link: 'YOUR_WHATSAPP',
    },
    tiktok: 'YOUR_TIKTOK',
    instagram: 'YOUR_INSTAGRAM',
    youtube: 'YOUR_YOUTUBE',
  },

  /* ---------- ORDER ---------- */
  order: {
    message:
      'Untuk melakukan pemesanan, silakan create ticket di Discord APISZ STORE.',
    /** Link tujuan tombol "ORDER NOW" di navbar. */
    primaryLink: 'YOUR_DISCORD_INVITE',
    /** Label tombol utama. */
    primaryLabel: 'ORDER NOW',
  },

  /* ---------- PAYMENT ---------- */
  payment: {
    note: 'Pembayaran dilakukan setelah detail pesanan dikonfirmasi oleh admin.',
    /** Isi nomor/e-wallet di sini. Kosongkan jika belum tersedia. */
    methods: [
      {
        id: 'dana',
        name: 'DANA',
        accountName: 'YOUR_NAME_HERE',
        accountNumber: 'YOUR_DANA_NUMBER',
      },
      {
        id: 'gopay',
        name: 'GoPay',
        accountName: 'YOUR_NAME_HERE',
        accountNumber: 'YOUR_GOPAY_NUMBER',
      },
      {
        id: 'qris',
        name: 'QRIS',
        accountName: 'YOUR_NAME_HERE',
        accountNumber: 'YOUR_QRIS_NUMBER',
      },
    ],
  },

  /* ---------- STATISTIK HERO (GANTI ANGKA DI SINI) ---------- */
  stats: [
    { id: 'projects', value: '50+', label: 'Projects' },
    { id: 'customers', value: '30+', label: 'Customers' },
    { id: 'services', value: '10+', label: 'Services' },
    { id: 'response', value: 'Fast', label: 'Response' },
  ],

  /* ---------- META ---------- */
  copyrightYear: 2026,
  locale: 'id-ID',
};

export default storeConfig;
