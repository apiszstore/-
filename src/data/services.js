/**
 * ============================================================
 *  DATA LAYANAN - ubah di file ini untuk menambah / mengubah layanan.
 *  Struktur:
 *  - digitalServices : kartu besar section "OUR SERVICES"
 *  - sampServices    : kartu besar section SA-MP
 *  - discordServerTypes : jenis server Discord
 *  - botServices     : daftar jenis bot
 *  - onServerPackages: paket JASA ON SERVER
 *  - sampModules     : textdraw / filescript / mapping / streamer
 * ============================================================
 */

/* ---------------- DIGITAL SERVICE (kartu utama) ---------------- */
export const digitalServices = [
  {
    id: 'discord-setup',
    icon: 'discord',
    name: 'Discord Setup',
    group: 'DIGITAL SERVICE',
    short: 'Setup server Discord rapi sesuai kebutuhan, mulai dari kategori, role, sampai permission.',
    detail: 'Pembuildan server Discord dari nol: struktur channel, role, permission, embed, sampai bot setup.',
    priceLabel: 'Mulai dari Rp10.000',
    startingPrice: 10000,
    features: [
      'Setup category & channel',
      'Setup permission',
      'Role setup',
      'Embed setup',
      'Bot setup',
      'Server customization',
    ],
    orderLabel: 'ORDER SERVICE',
  },
  {
    id: 'discord-bot',
    icon: 'bot',
    name: 'Custom Discord Bot',
    group: 'DIGITAL SERVICE',
    short: 'Bot Discord custom dibuat dengan Node.js + discord.js, sesuai request.',
    detail:
      'Pengembangan bot Discord custom (moderation, ticket, store, fun, dan lain-lain) menggunakan Node.js + discord.js.',
    priceLabel: 'Mulai dari Rp20.000',
    startingPrice: 20000,
    features: [
      'Custom command & fitur',
      'Setup dan bantuan konfigurasi',
      'Dokumentasi penggunaan',
      'Revisi sesuai kesepakatan',
    ],
    orderLabel: 'ORDER BOT',
  },
  {
    id: 'discord-bundle',
    icon: 'bundle',
    name: 'Discord Bundle Service',
    group: 'DIGITAL SERVICE',
    short: 'Paket gabungan Discord Setup + Bot dengan harga lebih hemat.',
    detail:
      'Paket bundle untuk yang ingin server Discord sekaligus bot. Pilih BASIC, STANDARD, atau CUSTOM.',
    priceLabel: 'Mulai dari Rp10.000',
    startingPrice: 10000,
    features: [
      'Discord Setup',
      'Opsional custom bot',
      'Bonus request minor',
      'Harga fleksibel untuk bundle',
    ],
    orderLabel: 'ORDER BUNDLE',
  },
  {
    id: 'website',
    icon: 'code',
    name: 'Website / Landing Page',
    group: 'DIGITAL SERVICE',
    short: 'Landing page statis atau dinamis untuk portfolio, toko, atau kebutuhan sekolah.',
    detail:
      'Pembuatan website / landing page modern, responsif, dan ringan. Cocok untuk portfolio, toko, atau project campus.',
    priceLabel: 'Custom Price',
    startingPrice: null,
    features: [
      'Desain responsif (mobile & desktop)',
      'Struktur halaman rapi',
      'Form kontak / tombol order',
      'Optimasi kecepatan loading',
    ],
    orderLabel: 'ORDER WEBSITE',
  },
];

/* ---------------- SA-MP SERVICE (kartu utama) ---------------- */
export const sampServices = [
  {
    id: 'samp-dev',
    icon: 'terminal',
    name: 'Jasa SA-MP',
    group: 'SA-MP SERVICE',
    short: 'Layanan coding & custom script server SA-MP sesuai kebutuhan.',
    detail:
      'Layanan pengembangan script SA-MP: dari sistem dasar sampai fitur custom yang diminta client.',
    priceLabel: 'Custom',
    startingPrice: null,
    features: [
      'Scripting SA-MP (Pawn)',
      'Custom command & system',
      'Fix / overhaul script',
      'Integrasi dengan gamemode',
    ],
    orderLabel: 'ORDER SA-MP',
  },
  {
    id: 'samp-on-server',
    icon: 'server',
    name: 'Jasa On Server',
    group: 'SA-MP SERVICE',
    short: 'Setup dan konfigurasi langsung di server kamu. Paket BASIC sampai ADVANCE.',
    detail:
      'Kerja langsung di server kamu: rename, set admin, starterpack, sampai penambahan fitur baru.',
    priceLabel: 'Mulai dari Rp5.000',
    startingPrice: 5000,
    features: [
      'Rename server',
      'Set admin',
      'Starterpack setup',
      'Tambah fitur baru',
    ],
    orderLabel: 'ORDER ON SERVER',
  },
  {
    id: 'samp-textdraw',
    icon: 'textdraw',
    name: 'Textdraw',
    group: 'SA-MP SERVICE',
    short: 'Textdraw HP, speedometer, vehicle UI, garage UI, GPS, dan custom textdraw.',
    detail:
      'Pembuatan textdraw custom untuk kebutuhan UI server SA-MP, dari yang simpel sampai request bebas.',
    priceLabel: 'Mulai dari Rp10.000',
    startingPrice: 10000,
    features: [
      'Textdraw HP',
      'Speedometer',
      'Vehicle UI',
      'Garage UI',
      'Contact / WhatsApp UI',
      'GPS UI',
      'Custom Textdraw',
    ],
    orderLabel: 'ORDER TEXTDRAW',
  },
  {
    id: 'samp-filescript',
    icon: 'file',
    name: 'Filescript',
    group: 'SA-MP SERVICE',
    short: 'Filescript system, custom features, UI system, dan utility system.',
    detail:
      'Pekerjaan filescript terpisah dari gamemode: system, utility, UI, sampai custom request.',
    priceLabel: 'Custom',
    startingPrice: null,
    features: [
      'System Filescript',
      'Custom Features',
      'UI System',
      'Utility System',
      'Custom Request',
    ],
    orderLabel: 'ORDER FILESCRIPT',
  },
  {
    id: 'samp-mapping',
    icon: 'map',
    name: 'Mapping',
    group: 'SA-MP SERVICE',
    short: 'Mapping interior, exterior, lokasi, sampai custom mapping request.',
    detail: 'Pembuatan dan penyesuaian map server SA-MP, baik interior maupun exterior.',
    priceLabel: 'Custom',
    startingPrice: null,
    features: [
      'Interior',
      'Exterior',
      'Mapping lokasi',
      'Custom mapping',
    ],
    orderLabel: 'ORDER MAPPING',
  },
  {
    id: 'samp-streamer',
    icon: 'stream',
    name: 'Streamer',
    group: 'SA-MP SERVICE',
    short: 'SA-MP Streamer, promosi server, dan content support.',
    detail: 'Pembuatan streamer untuk server SA-MP, promosi server, dan content support.',
    priceLabel: 'Custom',
    startingPrice: null,
    features: [
      'SA-MP Streamer',
      'Server Promotion',
      'Content Support',
      'Custom Request',
    ],
    orderLabel: 'ORDER STREAMER',
  },
];

/* ---------------- SUB-DETAIL: DISCORD SERVER SETUP ---------------- */
export const discordServerSetup = {
  title: 'BUILD SERVER DISCORD',
  priceLabel: 'Mulai dari Rp10.000',
  startingPrice: 10000,
  orderLabel: 'ORDER SERVICE',
  serverTypes: [
    'Discord Store',
    'Discord Community',
    'Discord SA-MP',
    'Custom Server',
  ],
  features: [
    'Setup category & channel',
    'Setup permission',
    'Role setup',
    'Embed setup',
    'Bot setup',
    'Server customization',
  ],
};

/* ---------------- SUB-DETAIL: DISCORD BOT ---------------- */
export const discordBot = {
  title: 'DISCORD BOT DEVELOPMENT',
  priceLabel: 'Mulai dari Rp20.000',
  startingPrice: 20000,
  orderLabel: 'ORDER BOT',
  services: [
    'Moderation Bot',
    'Ticket Support Bot',
    'Store Bot',
    'Game / Fun Bot',
    'Custom Bot',
  ],
  tech: ['Node.js', 'discord.js'],
  note: 'Setup dan bantuan konfigurasi termasuk. Hosting dan token disediakan oleh client jika diperlukan.',
};

/* ---------------- SUB-DETAIL: TEXTDRAW ---------------- */
export const textdrawService = {
  title: 'TEXTDRAW',
  priceLabel: 'Mulai dari Rp10.000',
  startingPrice: 10000,
  orderLabel: 'ORDER TEXTDRAW',
  items: [
    'Textdraw HP',
    'Speedometer',
    'Vehicle UI',
    'Garage UI',
    'Contact / WhatsApp UI',
    'GPS UI',
    'Custom Textdraw',
  ],
};

/* ---------------- SUB-DETAIL: FILESCRIPT ---------------- */
export const filescriptService = {
  title: 'FILESCRIPT',
  priceLabel: 'Custom',
  startingPrice: null,
  orderLabel: 'ORDER FILESCRIPT',
  items: [
    'System Filescript',
    'Custom Features',
    'UI System',
    'Utility System',
    'Custom Request',
  ],
};

/* ---------------- SUB-DETAIL: MAPPING ---------------- */
export const mappingService = {
  title: 'MAPPING',
  priceLabel: 'Custom',
  startingPrice: null,
  orderLabel: 'ORDER MAPPING',
  items: ['Interior', 'Exterior', 'Mapping lokasi', 'Custom mapping'],
};

/* ---------------- SUB-DETAIL: STREAMER ---------------- */
export const streamerService = {
  title: 'STREAMER',
  priceLabel: 'Custom',
  startingPrice: null,
  orderLabel: 'ORDER STREAMER',
  items: ['SA-MP Streamer', 'Server Promotion', 'Content Support', 'Custom Request'],
};

/* ---------------- PAKET JASA ON SERVER ---------------- */
export const onServerPackages = {
  title: 'JASA ON SERVER',
  priceLabel: 'Mulai dari Rp5.000',
  note: 'Gamemode harus support hosting yang digunakan, termasuk Lemehost jika menggunakan Lemehost.',
  orderLabel: 'ORDER ON SERVER',
  packages: [
    {
      id: 'on-server-basic',
      name: 'BASIC',
      priceLabel: 'Rp5.000',
      priceValue: 5000,
      features: [
        'Hosting dari client',
        'Rename server tidak full',
        'Gamemode dari client',
      ],
    },
    {
      id: 'on-server-standard',
      name: 'STANDARD',
      priceLabel: 'Rp10.000',
      priceValue: 10000,
      popular: true,
      features: [
        'Hosting dari client',
        'Set Admin 2x',
        'Rename server full',
        'Set starterpack jika diperlukan',
        'Gamemode dari client',
      ],
    },
    {
      id: 'on-server-advance',
      name: 'ADVANCE',
      priceLabel: 'Rp15.000',
      priceValue: 15000,
      features: [
        'Hosting dari client',
        'Set Admin 2x',
        'Rename server full',
        'Set starterpack jika diperlukan',
        'Add new fitur 2x',
        'Gamemode dari client',
      ],
    },
  ],
};

/* ---------------- PAKET DISCORD BUNDLE ---------------- */
export const bundlePackages = {
  title: 'DISCORD BUNDLE SERVICE',
  orderLabel: 'ORDER BUNDLE',
  packages: [
    {
      id: 'bundle-basic',
      name: 'BASIC',
      tagline: 'Discord Setup',
      priceLabel: 'Rp10.000',
      priceValue: 10000,
      features: ['Discord Setup', 'Kategori & channel', 'Role & permission'],
    },
    {
      id: 'bundle-standard',
      name: 'STANDARD',
      tagline: 'Discord Setup + Bot',
      priceLabel: 'Rp25.000',
      priceValue: 25000,
      popular: true,
      features: [
        'Discord Setup',
        '1 Custom Bot',
        'Role & permission',
        'Bot setup & konfigurasi',
      ],
    },
    {
      id: 'bundle-custom',
      name: 'CUSTOM',
      tagline: 'Discord Setup + Custom Bot + Request',
      priceLabel: 'Custom Price',
      priceValue: null,
      features: [
        'Semua paket STANDARD',
        'Custom request',
        'Fitur tambahan',
        'Konsultasi langsung dengan admin',
      ],
    },
  ],
};

/* ---------------- SUB-DETAIL: WEBSITE ---------------- */
export const websiteService = {
  title: 'WEBSITE / LANDING PAGE',
  priceLabel: 'Custom Price',
  startingPrice: null,
  orderLabel: 'ORDER WEBSITE',
  description:
    'Pembuatan website atau landing page yang modern, responsif, dan ringan. Cocok untuk portfolio, toko, atau project sekolah.',
  features: [
    'Desain responsif (mobile dan desktop)',
    'Struktur halaman yang rapi',
    'Form kontak dan tombol order',
    'Optimasi kecepatan loading',
  ],
};

/* ---------------- NILAI / KEUNGGULAN ---------------- */
export const storeValues = [
  {
    id: 'affordable',
    icon: 'wallet',
    title: 'Affordable',
    text: 'Harga disesuaikan untuk pelajar dan(owner) server pemula.',
  },
  {
    id: 'fast-response',
    icon: 'bolt',
    title: 'Fast Response',
    text: 'Admin membalas pesanan dan pertanyaan dengan cepat.',
  },
  {
    id: 'custom-request',
    icon: 'sliders',
    title: 'Custom Request',
    text: 'Bisa request fitur atau tampilan yang tidak ada di daftar.',
  },
  {
    id: 'student-friendly',
    icon: 'cap',
    title: 'Student Friendly',
    text: 'Komunikasi santai, mudah dipahami, tanpa jargon rumit.',
  },
  {
    id: 'support-after-order',
    icon: 'shield',
    title: 'Support After Order',
    text: 'Bantuan tetap tersedia setelah project selesai.',
  },
];
