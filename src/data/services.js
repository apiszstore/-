/**
 * Layanan Digital Service (Discord).
 *
 * ============================================================
 *  CARA MENGUBAH HARGA
 * ============================================================
 *  Ubah field `price` (angka, tanpa titik). Tulis `null` kalau
 *  belum ada harga resmi — section Pricing akan menampilkannya
 *  sebagai "Custom Pricing", bukan mengarang angka.
 *
 *  CARA MENAMBAH LAYANAN
 * ============================================================
 *  Tambahkan satu objek baru ke array `digitalServices`.
 *  field `icon` harus nama ikon dari lucide-react (lihat src/components/Icon.jsx).
 *
 *  field `recommended` opsional. Kalau `true`, kartu akan menampilkan
 *  label RECOMMENDED dan diberi border brand. Teksnya bisa diganti lewat
 *  `recommendedLabel`. Tidak ada batas berapa kartu yang boleh diberi label ini.
 *
 *  `status` bisa: 'available' | 'soon' | 'custom' | 'unavailable'
 *  Jangan menandai 'available' kalau layanan sedang tidak dibuka.
 *  Layanan yang punya `price` di bawah dianggap aktif — ubah ke
 *  'soon'/'unavailable' bila mau menutup pemesanannya sementara.
 *
 *  PENTING: `price` dan `status` harus konsisten. Kalau `price` sudah
 *  berupa angka, `status` harus 'available' (atau 'soon'/'unavailable').
 *  Menaruh `status: 'custom'` bersama harga angka membuat badge menulis
 *  "Custom Pricing" di sebelah angka harga yang sudah pasti, jadi saling
 *  bertentangan. 'custom' hanya untuk `price: null`.
 */

export const digitalServices = [
  {
    id: 'discord-setup',
    name: 'Discord Server Setup',
    icon: 'server',
    price: 10000,
    status: 'available',
    tagline: 'Server Discord yang rapi, terstruktur, dan siap dipakai.',
    description:
      'Setup server Discord dari awal: channel, role, permission, sampai tampilan server store.',
    features: [
      'Setup server Discord',
      'Setup category & channel',
      'Setup role',
      'Permission',
      'Welcome & goodbye',
      'Setup Discord Store',
      'Custom layout',
    ],
    requirements: ['Server Discord milik customer', 'Tentukan tema/tampilan server'],
    notes: null,
  },
  {
    id: 'custom-bot',
    name: 'Custom Discord Bot',
    icon: 'bot',
    price: 20000,
    status: 'available',
    tagline: 'Bot dengan fitur yang memang dipakai server kamu.',
    description:
      'Custom Discord bot menggunakan Node.js dan discord.js, dibuat sesuai kebutuhan server.',
    features: [
      'Moderation',
      'Ticket Support',
      'Discord Store',
      'Game / Fun',
      'Custom command',
      'Custom feature',
      'Node.js',
      'discord.js',
    ],
    requirements: ['Token bot', 'Server & permission bot'],
    notes: 'Hosting dan token dapat disediakan oleh customer sesuai kebutuhan.',
  },
  {
    id: 'bundle',
    name: 'Bundle Service',
    icon: 'layers',
    price: 25000,
    status: 'available',
    /** Tandai `true` untuk memunculkan label RECOMMENDED di kartu. */
    recommended: true,
    /** Teks labelnya. Tulis kapital di sini, tampilan tetap capitalize. */
    recommendedLabel: 'Recommended',
    tagline: 'Gabungkan beberapa layanan jadi satu paket.',
    description:
      'Paket gabungan dari beberapa layanan digital sekaligus, disesuaikan dengan kebutuhan project.',
    features: ['Discord Setup', 'Custom Bot', 'Service lainnya'],
    requirements: ['Diskusikan kebutuhan paket'],
    notes: null,
  },
];
