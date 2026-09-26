/**
 * Layanan SA-MP.
 *
 * `price: null` = belum ada harga resmi → tampil "Custom Pricing".
 * Ubah `price` ke angka (tanpa titik) saat harga sudah disepakati.
 *
 * `status` bisa: 'available' | 'soon' | 'custom' | 'unavailable'
 * Jangan menandai 'available' kalau layanan sedang tidak dibuka.
 * Services/paket yang punya `price` di bawah dianggap aktif.
 */

export const sampGeneral = [
  {
    id: 'samp-jasa',
    name: 'Jasa SA-MP',
    icon: 'terminal',
    price: null,
    status: 'custom',
    tagline: 'Bantuan scripting dan development untuk server SA-MP.',
    description: 'Handling pekerjaan Pawn scripting sampai pengembangan server system.',
    features: [
      'Pawn scripting',
      'Bug fixing',
      'Custom feature',
      'Server system',
      'Gamemode modification',
      'Development assistance',
    ],
    requirements: ['Server & gamemode milik customer'],
    notes: null,
  },
  {
    id: 'custom-samp',
    name: 'Custom SA-MP',
    icon: 'wand',
    price: null,
    status: 'custom',
    tagline: 'Request khusus di luar paket standar.',
    description: 'Feature khusus yang tidak termasuk paket bawaan, dikerjakan sesuai request.',
    features: ['Custom feature', 'Modification', 'System development', 'Request khusus'],
    requirements: ['Spesifikasi request', 'Server & gamemode milik customer'],
    notes: null,
  },
];

/** Tiga paket "Paket On Server". */
export const sampPackets = [
  {
    id: 'paket-basic',
    name: 'Basic',
    price: 2000,
    status: 'available',
    tagline: 'Paket paling ringan.',
    features: [
      'Hosting dari customer',
      'Rename server tidak full',
      'Gamemode dari customer',
    ],
    highlight: false,
  },
  {
    id: 'paket-standar',
    name: 'Standar',
    price: 10000,
    status: 'available',
    tagline: 'Paket paling umum.',
    features: [
      'Hosting dari customer',
      'Set admin 2x',
      'Rename server full',
      'Set starter pack jika diinginkan',
      'Gamemode dari customer',
    ],
    highlight: true,
  },
  {
    id: 'paket-advance',
    name: 'Advance',
    price: 15000,
    status: 'available',
    tagline: 'Paket paling lengkap.',
    features: [
      'Hosting dari customer',
      'Set admin 2x',
      'Rename server full',
      'Set starter pack jika diinginkan',
      'Add new fitur 2x',
      'Gamemode dari customer',
    ],
    highlight: false,
  },
];

/** Catatan wajib untuk paket On Server. */
export const sampPacketNote =
  'Gamemode harus mendukung hosting yang digunakan. Untuk Lemehost, gamemode harus kompatibel dengan Lemehost.';
