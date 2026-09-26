/**
 * ============================================================
 *  DATA PRODUK (STORE CATALOG)
 * ============================================================
 *  Cara menambah produk:
 *  1. Salin satu blok produk di bawah
 *  2. Ganti id (harus unik, tanpa spasi), name, dan isi kontennya
 *  3. Pilih status dari: available | limited | out-of-stock | custom
 *
 *  priceValue boleh null kalau harganya custom.
 *  Catatan: jangan mengarang harga yang belum ada di daftar resmi.
 * ============================================================
 */

export const productCategories = [
  { id: 'all', label: 'ALL' },
  { id: 'discord', label: 'DISCORD' },
  { id: 'samp', label: 'SA-MP' },
  { id: 'textdraw', label: 'TEXTDRAW' },
  { id: 'filescript', label: 'FILESCRIPT' },
  { id: 'mapping', label: 'MAPPING' },
  { id: 'other', label: 'OTHER' },
];

export const productStatus = {
  available: { id: 'available', label: 'AVAILABLE', dot: 'var(--success)' },
  limited: { id: 'limited', label: 'LIMITED', dot: 'var(--warning)' },
  'out-of-stock': { id: 'out-of-stock', label: 'OUT OF STOCK', dot: 'var(--danger)' },
  custom: { id: 'custom', label: 'CUSTOM', dot: 'var(--info)' },
};

export const products = [
  /* ------------------------- DISCORD ------------------------- */
  {
    id: 'discord-store-server',
    name: 'Discord Store Server',
    category: 'discord',
    status: 'available',
    icon: 'discord',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'Server Discord untuk toko digital dengan katalog produk yang rapi.',
    description:
      'Server Discord untuk toko digital, cocok untuk menjual jasa digital, script, atau template dengan sistem channel per kategori.',
    features: [
      'Setup category dan channel produk',
      'Role setup (Admin, Staff, Buyer, Member)',
      'Permission per channel',
      'Embed setup untuk setiap produk',
      'Server customization (banner, ikon, deskripsi)',
    ],
    requirements: [
      'Server Discord kosong atau milik kamu sendiri',
      'Nama dan deskripsi toko',
      'Daftar produk yang ingin dipasang',
      'Logo atau banner (jika ada)',
    ],
    faq: [
      {
        q: 'Apakah bot ikut dipasang?',
        a: 'Bot setup termasuk. Untuk bot custom ada paket terpisah atau bundle.',
      },
      {
        q: 'Berapa lama pengerjaannya?',
        a: 'Tergantung jumlah channel dan fitur yang diminta. Details dibicarakan lewat Discord.',
      },
    ],
  },
  {
    id: 'discord-community-server',
    name: 'Discord Community Server',
    category: 'discord',
    status: 'custom',
    icon: 'users',
    priceLabel: 'Custom Price',
    priceValue: null,
    priceNote: 'Sesuai kebutuhan',
    short: 'Server komunitas dengan channel diskusi, welcome, dan rules.',
    description:
      'Struktur server untuk komunitas: channel welcome, rules, pengumuman, chatting, dan channel khusus topik.',
    features: [
      'Struktur category dan channel',
      'Welcome dan rules system',
      'Role dan permission',
      'Embed pengumuman',
      'Bot setup dasar',
    ],
    requirements: ['Server Discord kosong', 'Tema atau niche komunitas', 'Aturan komunitas (jika ada)'],
    faq: [
      {
        q: 'Bisa dibuat untuk server sekolah atau organisasi?',
        a: 'Bisa. Struktur dan gaya bahasa menyesuaikan jenis komunitasnya.',
      },
    ],
  },
  {
    id: 'discord-samp-server',
    name: 'Discord SA-MP Server',
    category: 'discord',
    status: 'custom',
    icon: 'terminal',
    priceLabel: 'Custom Price',
    priceValue: null,
    priceNote: 'Sesuai kebutuhan',
    short: 'Server Discord khusus komunitas SA-MP dengan channel support.',
    description:
      'Server Discord untuk pemilik server SA-MP: channel-SC list, banner role, channel report, sampai channel premium.',
    features: [
      'Struktur channel khusus SA-MP',
      'Channel report dan support',
      'Role player (sesuai wishlist karakter)',
      'Embed dan banner role',
      'Bot setup dasar',
    ],
    requirements: [
      'Server Discord kosong',
      'Nama dan banner server SA-MP',
      'Daftar channel yang dibutuhkan',
    ],
    faq: [
      {
        q: 'Bisa integrasi dengan SA-MP?',
        a: 'Bisa. Untuk channel-SC atau channel dinamis dibutuhkan script tambahan yang dikerjakan terpisah.',
      },
    ],
  },
  {
    id: 'discord-moderation-bot',
    name: 'Moderation Bot',
    category: 'discord',
    status: 'available',
    icon: 'shield',
    priceLabel: 'Rp20.000',
    priceValue: 20000,
    priceNote: 'Mulai dari',
    short: 'Bot moderasi otomatis: ban, mute, kick, dan log.',
    description:
      'Bot moderasi Discord dengan perintah ban, unban, mute, kick, slowmode, dan log punishment.',
    features: [
      'Ban, Unban, Kick, Mute',
      'Auto moderation (opsional)',
      'Log channel',
      'Warning system',
      'Konfigurasi command prefix',
    ],
    requirements: ['Node.js versi 18 atau lebih baru', 'Token bot dari Discord Developer Portal', 'Server Discord'],
    faq: [
      {
        q: 'Apakah hosting disediakan?',
        a: 'Hosting dan token disediakan oleh client. Setup dan konfigurasi termasuk layanan.',
      },
    ],
  },
  {
    id: 'discord-ticket-bot',
    name: 'Ticket Support Bot',
    category: 'discord',
    status: 'available',
    icon: 'chat',
    priceLabel: 'Rp20.000',
    priceValue: 20000,
    priceNote: 'Mulai dari',
    short: 'Sistem ticket dengan panel, transcript, dan auto close.',
    description:
      'Bot ticket untuk customer service atau support server Discord. User membuat ticket, lalu staff bisa menutup dan menyimpan transcript.',
    features: [
      'Sistem ticket per kategori',
      'Panel dan button',
      'Transcript otomatis',
      'Auto close dan claim ticket',
      'Permission staff',
    ],
    requirements: ['Node.js versi 18 atau lebih baru', 'Token bot', 'Server Discord'],
    faq: [
      {
        q: 'Bisa dipakai untuk order jasa?',
        a: 'Bisa. Ticket bisa dipakai sebagai sistem order sekaligus tempat diskusi pesanan.',
      },
    ],
  },
  {
    id: 'discord-store-bot',
    name: 'Discord Store Bot',
    category: 'discord',
    status: 'limited',
    icon: 'cart',
    priceLabel: 'Rp25.000',
    priceValue: 25000,
    priceNote: 'Paket bundle',
    short: 'Bot toko digital: katalog, order, dan delivery.',
    description:
      'Bot store untuk produk digital. User bisa melihat katalog dan melakukan order, lalu admin melakukan verifikasi secara manual tanpa payment gateway.',
    features: [
      'Katalog produk',
      'Command order',
      'Verifikasi admin',
      'Ticket otomatis untuk pesanan',
      'Kustomisasi harga dan deskripsi',
    ],
    requirements: ['Node.js versi 18 atau lebih baru', 'Token bot', 'Daftar produk dan harga'],
    faq: [
      {
        q: 'Apakah sudah termasuk payment gateway?',
        a: 'Belum. Pembayaran dikonfirmasi manual oleh admin melalui DANA, GoPay, atau QRIS.',
      },
    ],
  },
  {
    id: 'discord-game-bot',
    name: 'Game / Fun Bot',
    category: 'discord',
    status: 'custom',
    icon: 'dice',
    priceLabel: 'Custom Price',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Bot ringan untuk mini game, data harian, dan command interaktif.',
    description:
      'Bot untuk hiburan di server: mini game, daily claim, leaderboard, sampai command interaktif custom.',
    features: ['Mini game dan command fun', 'Leaderboard dan penyimpanan data', 'Cooldown command', 'Embed dan button'],
    requirements: ['Node.js versi 18 atau lebih baru', 'Token bot', 'Konsep atau referensi game'],
    faq: [
      {
        q: 'Bisa request game sendiri?',
        a: 'Bisa. Jelaskan mekaniknya ke admin untuk estimasi harga.',
      },
    ],
  },

  /* ------------------------- SA-MP ------------------------- */
  {
    id: 'samp-on-server-basic',
    name: 'On Server BASIC',
    category: 'samp',
    status: 'available',
    icon: 'server',
    priceLabel: 'Rp5.000',
    priceValue: 5000,
    priceNote: 'Paket',
    short: 'Setup dasar langsung di server kamu.',
    description:
      'Paket paling ringan untuk yang butuh bantuan setup dasar di server SA-MP milik sendiri.',
    features: ['Hosting dari client', 'Rename server tidak full', 'Gamemode dari client'],
    requirements: ['Hosting atau server sudah aktif', 'Gamemode dari client', 'Akses admin atau FTP'],
    faq: [
      {
        q: 'Apakah termasuk hosting?',
        a: 'Tidak. Hosting dari client.',
      },
      {
        q: 'Gamemode harus seperti apa?',
        a: 'Gamemode dari client, dan harus support hosting yang dipakai (termasuk Lemehost jika memakai Lemehost).',
      },
    ],
  },
  {
    id: 'samp-on-server-standard',
    name: 'On Server STANDARD',
    category: 'samp',
    status: 'available',
    icon: 'server',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Paket',
    short: 'Rename full, set admin, dan starterpack.',
    description:
      'Paket menengah untuk server SA-MP yang sudah berjalan dan ingin dirapikan.',
    features: [
      'Hosting dari client',
      'Set Admin 2x',
      'Rename server full',
      'Set starterpack jika diperlukan',
      'Gamemode dari client',
    ],
    requirements: ['Hosting atau server sudah aktif', 'Gamemode dari client', 'Akses admin dan FTP'],
    faq: [
      {
        q: 'Apa saja yang perlu disiapkan?',
        a: 'Nama server baru, daftar admin, dan referensi logo atau banner jika ada.',
      },
    ],
  },
  {
    id: 'samp-on-server-advance',
    name: 'On Server ADVANCE',
    category: 'samp',
    status: 'limited',
    icon: 'server',
    priceLabel: 'Rp15.000',
    priceValue: 15000,
    priceNote: 'Paket',
    short: 'Paket lengkap dengan tambahan 2 fitur baru.',
    description:
      'Paket paling lengkap untuk server SA-MP yang butuh banyak penyesuaian sekaligus.',
    features: [
      'Hosting dari client',
      'Set Admin 2x',
      'Rename server full',
      'Set starterpack jika diperlukan',
      'Add new fitur 2x',
      'Gamemode dari client',
    ],
    requirements: [
      'Hosting atau server sudah aktif',
      'Gamemode dari client',
      'Akses admin dan FTP',
      'Detail fitur baru yang diinginkan',
    ],
    faq: [
      {
        q: 'Apa batasan fitur barunya?',
        a: 'Dua fitur baru, dikerjakan sesuai kesepakatan sebelum project berjalan.',
      },
    ],
  },
  {
    id: 'samp-custom-script',
    name: 'Custom SA-MP Script',
    category: 'samp',
    status: 'custom',
    icon: 'code',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Scripting SA-MP custom: sistem, command, dan fitur bebas.',
    description:
      'Layanan coding SA-MP untuk sistem baru, optimasi, atau perbaikan pada script yang sudah ada.',
    features: ['Scripting Pawn', 'Custom command dan system', 'Perbaikan script', 'Integrasi gamemode'],
    requirements: [
      'Detail kebutuhan atau referensi fitur',
      'Script awal jika ada (untuk permintaan perbaikan)',
      'Versi SA-MP dan gamemode yang dipakai',
    ],
    faq: [
      {
        q: 'Berapa estimasi pengerjaannya?',
        a: 'Tergantung kompleksitas. Diskusikan dulu di Discord sebelum mulai.',
      },
    ],
  },

  /* ------------------------- TEXTDRAW ------------------------- */
  {
    id: 'textdraw-hp',
    name: 'Textdraw HP',
    category: 'textdraw',
    status: 'available',
    icon: 'phone',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'Textdraw HP custom sesuai tema server.',
    description:
      'Pembuatan textdraw HP (mobile phone) untuk server SA-MP dengan desain dan posisi yang disesuaikan.',
    features: ['Desain custom', 'Posisi dan ukuran menyesuaikan', 'Preview dan revisi ringan'],
    requirements: ['Referensi desain (jika ada)', 'Ukuran layar yang diinginkan', 'Akses untuk testing di server'],
    faq: [
      {
        q: 'Bisa pakai gambar sendiri?',
        a: 'Bisa. Sediakan file gambar atau referensinya.',
      },
    ],
  },
  {
    id: 'textdraw-speedometer',
    name: 'Speedometer Textdraw',
    category: 'textdraw',
    status: 'available',
    icon: 'gauge',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'Speedometer HUD dengan animasi RPM dan kecepatan.',
    description:
      'Textdraw speedometer untuk server SA-MP: indikator kecepatan, RPM, dan gear dengan animasi.',
    features: ['Indikator kecepatan', 'Animasi RPM dan gear', 'Warna dan font custom'],
    requirements: ['Gamemode dari client', 'Referensi desain (jika ada)'],
    faq: [
      {
        q: 'Apakah semua gamemode bisa?',
        a: 'Tergantung dukungan textdraw dinamis pada gamemode yang dipakai.',
      },
    ],
  },
  {
    id: 'textdraw-vehicle-ui',
    name: 'Vehicle UI Textdraw',
    category: 'textdraw',
    status: 'available',
    icon: 'car',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'UI kendaraan: nama mobil, indikator, dan informasi tambahan.',
    description:
      'Textdraw UI untuk kendaraan: nama kendaraan, indikator kondisi, dan informasi tambahan sesuai kebutuhan server.',
    features: ['Nama kendaraan', 'Indikator kondisi kendaraan', 'Layout custom'],
    requirements: ['Gamemode dari client', 'Referensi desain (jika ada)'],
    faq: [
      {
        q: 'Bisa untuk seluruh kendaraan?',
        a: 'Bisa, menyesuaikan dukungan model pada gamemode.',
      },
    ],
  },
  {
    id: 'textdraw-garage-ui',
    name: 'Garage UI Textdraw',
    category: 'textdraw',
    status: 'available',
    icon: 'garage',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'UI garage untuk memilih dan menyimpan kendaraan.',
    description: 'Textdraw UI untuk sistem garage: daftar kendaraan, slot simpan, dan preview mobil.',
    features: ['Panel garage', 'Slot kendaraan', 'Preview mobil'],
    requirements: ['Gamemode dari client', 'Sistem penyimpanan kendaraan'],
    faq: [
      {
        q: 'Apakah termasuk sistem simpan kendaraan?',
        a: 'Tergantung gamemode. Integrasi dikerjakan bersama client.',
      },
    ],
  },
  {
    id: 'textdraw-contact-ui',
    name: 'Contact / WhatsApp UI',
    category: 'textdraw',
    status: 'available',
    icon: 'chat',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'UI kontak atau WhatsApp in-game.',
    description: 'Textdraw kontak atau WhatsApp untuk komunikasi in-game antar karakter.',
    features: ['Daftar kontak', 'Tampilan chat', 'Warna bubble custom'],
    requirements: ['Gamemode dari client', 'Referensi tampilan (jika ada)'],
    faq: [
      {
        q: 'Bisa dipakai di HP in-game?',
        a: 'Bisa, dapat ditempatkan pada textdraw HP.',
      },
    ],
  },
  {
    id: 'textdraw-gps',
    name: 'GPS UI Textdraw',
    category: 'textdraw',
    status: 'limited',
    icon: 'map',
    priceLabel: 'Rp10.000',
    priceValue: 10000,
    priceNote: 'Mulai dari',
    short: 'Tampilan GPS dan rute yang modern.',
    description: 'Textdraw GPS untuk panduan arah ke lokasi dengan tampilan modern dan mudah dibaca.',
    features: ['Rute dan marker', 'HUD map', 'Estimasi jarak'],
    requirements: ['Gamemode dari client', 'Referensi tampilan (jika ada)'],
    faq: [
      {
        q: 'Bisa untuk banyak lokasi?',
        a: 'Bisa, untuk tiap lokasi atau memakai sistem dinamis.',
      },
    ],
  },

  /* ------------------------- FILESCRIPT ------------------------- */
  {
    id: 'filescript-system',
    name: 'System Filescript',
    category: 'filescript',
    status: 'custom',
    icon: 'file',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Sistem filescript terpisah dari gamemode.',
    description:
      'Pembuatan sistem filescript: penyimpanan data, admin system, sampai logika khusus.',
    features: ['System filescript', 'Custom features', 'Integrasi gamemode'],
    requirements: ['Detail kebutuhan', 'Script dan include yang sudah ada', 'Versi SA-MP'],
    faq: [
      {
        q: 'Bisa digabung dengan gamemode client?',
        a: 'Bisa, tetapi perlu penyesuaian API.',
      },
    ],
  },
  {
    id: 'filescript-ui-system',
    name: 'UI System Filescript',
    category: 'filescript',
    status: 'custom',
    icon: 'sliders',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Sistem UI dan textdraw sebagai filescript.',
    description:
      'Pisahkan sistem UI dan textdraw dari gamemode supaya lebih mudah dikelola dan bisa dipakai lintas gamemode.',
    features: ['UI system', 'Textdraw dinamis', 'Konfigurasi mudah'],
    requirements: ['Referensi UI', 'Gamemode dari client'],
    faq: [
      {
        q: 'Bisa dipakai semua gamemode?',
        a: 'Tergantung dukungan textdraw pada gamemode tersebut.',
      },
    ],
  },
  {
    id: 'filescript-utility',
    name: 'Utility System',
    category: 'filescript',
    status: 'custom',
    icon: 'wrench',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Kumpulan script kecil pendukung server.',
    description: 'Kumpulan script kecil: anti-flood, animasi, suara, sampai command tambahan.',
    features: ['Anti-flood dan anti-spam', 'Command tambahan', 'Animasi dan efek'],
    requirements: ['Daftar utility yang dibutuhkan', 'Gamemode dari client'],
    faq: [
      {
        q: 'Bisa request utility sendiri?',
        a: 'Bisa, jelaskan saja kebutuhannya.',
      },
    ],
  },

  /* ------------------------- MAPPING ------------------------- */
  {
    id: 'mapping-interior',
    name: 'Interior Mapping',
    category: 'mapping',
    status: 'available',
    icon: 'home',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Interior bangunan custom seperti rumah dan perkantoran.',
    description: 'Pembuatan interior bangunan untuk server SA-MP dengan denah dan furnishitur custom.',
    features: ['Interior bangunan', 'Objek akses dan pintu', 'Object dan furnishitur'],
    requirements: ['Referensi denah atau gambar', 'Bahan dan tekstur (jika ada)', 'Akses map editor'],
    faq: [
      {
        q: 'Bisa dibuat dari gambar?',
        a: 'Bisa, kirim denah atau referensinya.',
      },
    ],
  },
  {
    id: 'mapping-exterior',
    name: 'Exterior Mapping',
    category: 'mapping',
    status: 'available',
    icon: 'building',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Exterior dan landscape area untuk server.',
    description: 'Pembuatan area luar: taman kota, jalan, dan area custom lainnya.',
    features: ['Landscape', 'Jalan dan area hijau', 'Penempatan object'],
    requirements: ['Referensi area', 'Bahan dan tekstur (jika ada)'],
    faq: [
      {
        q: 'Berapa luas area yang bisa dikerjakan?',
        a: 'Tergantung budget dan tingkat detail.',
      },
    ],
  },
  {
    id: 'mapping-location',
    name: 'Mapping Lokasi',
    category: 'mapping',
    status: 'available',
    icon: 'pin',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Pembuatan lokasi spesifik, misalnya area roleplay.',
    description: 'Mapping untuk lokasi tertentu, misalnya pasar, terminal, atau area_roleplay lainnya.',
    features: ['Lokasi khusus', 'Interior dan exterior', 'Marker dan checkpoint'],
    requirements: ['Nama lokasi dan contohnya', 'Referensi gambar'],
    faq: [
      {
        q: 'Bisa referensi dari game lain?',
        a: 'Bisa sebagai referensi, dengan penyesuaian agar sesuai gaya server.',
      },
    ],
  },

  /* ------------------------- OTHER ------------------------- */
  {
    id: 'samp-streamer',
    name: 'SA-MP Streamer',
    category: 'other',
    status: 'out-of-stock',
    icon: 'stream',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Slot terbatas',
    short: 'Pembuatan streamer untuk promosi server SA-MP.',
    description: 'Pembuatan streamer untuk konten promosi server SA-MP, termasuk banner animasi.',
    features: ['SA-MP Streamer', 'Server Promotion', 'Content Support'],
    requirements: ['Nama server', 'Logo dan warna server', 'Durasi serta aspect ratio'],
    faq: [
      {
        q: 'Kenapa statusnya OUT OF STOCK?',
        a: 'Slot produksi sedang penuh. Hubungi admin untuk ketersediaan terbaru.',
      },
    ],
  },
  {
    id: 'website-landing-page',
    name: 'Landing Page',
    category: 'other',
    status: 'limited',
    icon: 'layout',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai kebutuhan',
    short: 'Landing page modern, ringan, dan responsif.',
    description: 'Landing page untuk portfolio, toko, atau project sekolah. Ringan dan cepat dibuka.',
    features: ['Desain responsif', 'Struktur halaman', 'Tombol order dan kontak', 'Optimasi kecepatan'],
    requirements: ['Konten atau teks yang dipakai', 'Logo dan warna', 'Contoh situs referensi'],
    faq: [
      {
        q: 'Apakah termasuk domain?',
        a: 'Domain dan hosting ditentukan terpisah oleh client.',
      },
    ],
  },
  {
    id: 'discord-brand-kit',
    name: 'Discord Brand Kit',
    category: 'other',
    status: 'custom',
    icon: 'palette',
    priceLabel: 'Custom',
    priceValue: null,
    priceNote: 'Sesuai request',
    short: 'Logo, banner, dan warna server agar lebih rapi.',
    description: 'Paket visual ringan untuk server Discord: banner server, ikon, dan palet warna.',
    features: ['Banner server', 'Ikon atau logo', 'Palet warna dan panduan singkat'],
    requirements: ['Nama server', 'Preferensi gaya', 'Logo lama (jika ada)'],
    faq: [
      {
        q: 'Format file apa yang diberikan?',
        a: 'PNG, dan file editable bila termasuk cakupan pekerjaan.',
      },
    ],
  },
];

/** Cari produk berdasarkan id. */
export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}
