import assert from 'node:assert/strict';
import { test } from 'node:test';

import handler, { parseChannelList } from '../api/showcase.js';
import { fetchShowcaseProducts } from '../src/lib/discord.js';
import {
  dedupe,
  inferCategory,
  parsePrice,
  parseProductMessage,
  parseTitle,
  SHOWCASE_FILTERS,
  sortProducts,
} from '../src/lib/parse-showcase.js';

const TOKEN = 'token-rahasia-yang-tidak-boleh-bocor';
const GUILD = '1545657570549829662';

/**
 * Bentuk pesan yang persis seperti di channel #product-samp:
 * judul berdekor + status + deskripsi + CTA + attachment.
 */
function pesanSamp({ id = '900', judul = 'Textdraw Smartphone', deskripsi, extra = '' } = {}) {
  const isi = [
    `\u2726 ${judul} \u2726`,
    'FOR SALE',
    'Harga: Rp19.500',
    deskripsi ??
      'High-quality textdraw design\ndirancang untuk memberikan visual yang clean, modern, dan elegan\npada server GTA SAMP Anda.',
    extra,
    'Preview \u2192 #textdraw',
  ]
    .filter((baris) => baris !== '')
    .join('\n');

  return {
    id,
    timestamp: '2026-09-20T10:00:00Z',
    content: isi,
    attachments: [
      {
        id: 'att1',
        content_type: 'image/png',
        url: `https://cdn.discordapp.net/attachments/${GUILD}/${id}/preview.png`,
      },
    ],
    embeds: [],
  };
}

/** Bentuk pesan yang persis seperti di channel #digital-service. */
function pesanDigital({ id = '901', judul = 'Setup Discord', deskripsi, status = 'Exclusive Preview \u2022 Tidak Untuk Dijual' } = {}) {
  return {
    id,
    timestamp: '2026-09-19T10:00:00Z',
    content: [
      `\u2726 ${judul} \u2726`,
      status,
      deskripsi ??
        'High-quality desain\ndirancang untuk memberikan visual yang clean, rapi, dan simpel\npada server Discord Anda.',
      'Looking for a similar concept?',
      'Ingin konsep setup seperti ini?',
      'Silakan lakukan pemesanan melalui \u2192 #ticket',
    ].join('\n'),
    attachments: [
      {
        id: 'att2',
        content_type: 'image/png',
        url: `https://cdn.discordapp.net/attachments/${GUILD}/${id}/preview.png`,
      },
    ],
    embeds: [],
  };
}

const ctxSamp = { channelId: '1111111111111111111', channelName: 'product-samp', guildId: GUILD };
const ctxDigital = { channelId: '2222222222222222222', channelName: 'digital-service', guildId: GUILD };

// --- Parser: bentuk pesan asli dari Discord -------------------------------

test('parser: pesan #product-samp terbaca lengkap', () => {
  const item = parseProductMessage(pesanSamp(), ctxSamp);

  assert.equal(item.title, 'Textdraw Smartphone');
  assert.equal(item.category, 'SA-MP');
  assert.equal(item.status, 'available');
  assert.equal(item.statusLabel, 'For Sale');
  assert.equal(item.price, 'Rp19.500');
  assert.equal(item.image, `https://cdn.discordapp.net/attachments/${GUILD}/900/preview.png`);
  assert.equal(item.channelName, 'product-samp');
  assert.equal(item.postedAt, '2026-09-20T10:00:00Z');
  assert.equal(item.messageUrl, `https://discord.com/channels/${GUILD}/1111111111111111111/900`);
  assert.equal(item.source, 'discord');
});

test('parser: pesan #digital-service tidak dikarang harganya', () => {
  const item = parseProductMessage(pesanDigital(), ctxDigital);

  assert.equal(item.title, 'Setup Discord');
  assert.equal(item.category, 'Discord');
  assert.equal(item.status, 'unavailable');
  assert.equal(item.statusLabel, 'Exclusive Preview');
  assert.equal(item.price, null, 'Exclusive Preview tidak boleh punya harga palsu');
  assert.equal(item.description, 'High-quality desain dirancang untuk memberikan visual yang clean, rapi, dan simpel pada server Discord Anda.');
});

test('parser: "Preview \u2192 #textdraw" tidak dianggap status', () => {
  // Kata "preview" ada di baris CTA. Kalau baris itu dipakai untuk status,
  // produk yang "FOR SALE" akan salah jadi "Exclusive Preview".
  const item = parseProductMessage(pesanSamp(), ctxSamp);
  assert.equal(item.statusLabel, 'For Sale');
});

test('parser: deskripsi berhenti di baris ajakan bertindak', () => {
  const item = parseProductMessage(pesanDigital(), ctxDigital);
  assert.equal(item.description.includes('Silakan'), false);
  assert.equal(item.description.includes('Looking for'), false);
});

test('parser: baris status tidak ikut jadi deskripsi', () => {
  const item = parseProductMessage(pesanSamp(), ctxSamp);
  assert.equal(item.description.includes('FOR SALE'), false);
  assert.equal(item.description.includes('Harga'), false);
});

test('parser: produk juga terbaca dari embed, bukan cuma content', () => {
  const message = {
    id: '950',
    timestamp: '2026-09-18T10:00:00Z',
    content: '',
    embeds: [
      {
        title: '\u2726 Panel Character \u2726',
        description: 'Panel karakter dengan desain clean untuk server SA-MP Anda.',
        fields: [{ name: 'Harga', value: 'Rp20.000' }],
        image: { url: 'https://cdn.discordapp.net/embed/panel.png' },
      },
    ],
    attachments: [],
  };

  const item = parseProductMessage(message, ctxSamp);
  assert.equal(item.title, 'Panel Character');
  assert.equal(item.price, 'Rp20.000');
  assert.equal(item.image, 'https://cdn.discordapp.net/embed/panel.png');
  assert.equal(item.category, 'SA-MP');
});

test('parser: percakapan biasa bukan produk', () => {
  // Tanpa gambar, tanpa judul berdekor, tanpa field berlabel.
  const ngobrol = { id: '960', timestamp: '2026-09-17T10:00:00Z', content: 'halo semua', embeds: [], attachments: [] };
  assert.equal(parseProductMessage(ngobrol, ctxSamp), null);
});

test('parser: pesan tanpa judul ditolak', () => {
  const kosong = { id: '961', timestamp: '2026-09-17T10:00:00Z', content: '', embeds: [], attachments: [] };
  assert.equal(parseProductMessage(kosong, ctxSamp), null);
});

test('parser: attachment non-gambar dilewati, gambar pertama yang dipakai', () => {
  const message = pesanSamp();
  message.attachments = [
    { id: 'a', content_type: 'application/pdf', url: 'https://cdn.discordapp.net/attachments/x/1/file.pdf' },
    { id: 'b', content_type: 'image/jpeg', url: 'https://cdn.discordapp.net/attachments/x/2/photo.jpg' },
    { id: 'c', content_type: 'image/png', url: 'https://cdn.discordapp.net/attachments/x/3/photo2.png' },
  ];
  assert.equal(parseProductMessage(message, ctxSamp).image, 'https://cdn.discordapp.net/attachments/x/2/photo.jpg');
});

test('parser: produk tanpa attachment tetap tampil sebagai placeholder kartu', () => {
  const message = pesanSamp();
  message.attachments = [];
  const item = parseProductMessage(message, ctxSamp);
  assert.equal(item.title, 'Textdraw Smartphone');
  assert.equal(item.image, null, 'gambar dikosongkan, bukan diisi gambar acak');
});

// --- Parser: harga --------------------------------------------------------

test('harga tidak pernah diformat ulang', () => {
  assert.equal(parsePrice('Harga: Rp19.500'), 'Rp19.500');
  assert.equal(parsePrice('harga Rp 25.000'), 'Rp 25.000'.replace(' ', ''));
  assert.equal(parsePrice('IDR 20.000'), 'IDR 20.000'.replace(' ', ''));
  assert.equal(parsePrice('Harga: Rp20K'), 'Rp20K');
});

test('angka polos tidak pernah dianggap harga', () => {
  assert.equal(parsePrice('Preview \u2192 #textdraw'), null);
  assert.equal(parsePrice('Terbit tahun 2026'), null);
  assert.equal(parsePrice('No. 3'), null);
  assert.equal(parsePrice(''), null);
});

test('produk tanpa harga tidak dapat harga karangan', () => {
  const item = parseProductMessage(
    { ...pesanSamp(), content: '\u2726 Panel Character \u2726\nFOR SALE\nPanel karakter ready.\nPreview \u2192 #textdraw' },
    ctxSamp,
  );
  assert.equal(item.price, null);
});

// --- Parser: kategori -----------------------------------------------------

test('kategori mengikuti isi produk', () => {
  const kasus = [
    ['Textdraw Smartphone', 'SA-MP'],
    ['Panel Character', 'SA-MP'],
    ['Custom Mapping roleplay', 'SA-MP'],
    ['Setup Discord', 'Discord'],
    ['Discord Server Premium', 'Discord'],
    ['Custom Bot Telegram', 'Bot'],
    ['Discord Bot Musik', 'Bot'],
    ['Website Store APISZ', 'Website'],
    ['Landing Page Promotion', 'Website'],
    ['Digital Speedometer', 'UI'],
    ['UI Pack House', 'UI'],
  ];

  for (const [judul, harapan] of kasus) {
    assert.equal(inferCategory({ title: judul, channelName: 'digital-service' }), harapan, judul);
  }
});

test('kategori dari nama channel dipakai saat judul tidak menunjuk', () => {
  assert.equal(inferCategory({ title: 'Panel Character', channelName: 'product-samp' }), 'SA-MP');
  assert.equal(inferCategory({ title: 'Setup Discord', channelName: 'digital-service' }), 'Discord');
});

test('pin env jadi default, bukan kunci mati di atas isi produk', () => {
  // Judul menang dulu: speedometer itu komponen UI, bukan script SA-MP.
  assert.equal(
    inferCategory({ title: 'Digital Speedometer', channelName: 'digital-service', pinned: 'SA-MP' }),
    'UI',
  );
  // Kalau judulnya tidak memancing, pin channel yang dipakai. Ini yang bikin
  // "Panel Character" di #product-samp tetap SA-MP walau channelnya dipin.
  assert.equal(
    inferCategory({ title: 'Panel Character', channelName: 'digital-service', pinned: 'SA-MP' }),
    'SA-MP',
  );
  // Tanpa pin, nama channel dipakai.
  assert.equal(inferCategory({ title: 'Panel Character', channelName: 'product-samp' }), 'SA-MP');
  // Pin yang bukan filter yang ada tidak boleh menggagalkan tebakan: ia diabaikan
  // lalu pencarian lanjut ke nama channel.
  assert.equal(inferCategory({ title: 'Halo', channelName: 'product-samp', pinned: 'ngawur' }), 'SA-MP');
  // Pin tidak dikenal DAN nama channel tidak memancing -> fallback.
  assert.equal(inferCategory({ title: 'Halo', channelName: 'random-channel', pinned: 'ngawur' }), 'UI');
});

test('kategori tidak pernah bernilai di luar filter yang sudah ada', () => {
  const semua = [
    ...['Textdraw Smartphone', 'Panel Character', 'Setup Discord', 'Custom Bot', 'Website Store', 'Digital Speedometer', 'Halo', ''].map(
      (title) => inferCategory({ title, channelName: 'product-samp' }),
    ),
    ...['Textdraw Smartphone', 'Panel Character', 'Setup Discord', 'Custom Bot', 'Website Store', 'Digital Speedometer', 'Halo', ''].map(
      (title) => inferCategory({ title, channelName: 'digital-service' }),
    ),
  ];

  for (const category of semua) {
    assert.ok(SHOWCASE_FILTERS.includes(category), `kategori di luar filter: ${category}`);
    assert.notEqual(category, 'All');
  }
});

test('judul dekoratif terbaca even kalau tidak ada gambar', () => {
  assert.equal(parseTitle(['\u2726 Panel Character \u2726', 'FOR SALE']), 'Panel Character');
  assert.equal(parseTitle(['\u2728  Textdraw Smartphone  \u2728']), 'Textdraw Smartphone');
  // Judul tanpa dekorasi tetap ketemu lewat baris pendek biasa.
  assert.equal(parseTitle(['Panel Character', 'FOR SALE']), 'Panel Character');
  assert.equal(parseTitle(['Preview \u2192 #textdraw']), null);
});

// --- Urut & duplikat ------------------------------------------------------

test('produk urut terbaru ke terlama', () => {
  const list = [
    { id: '1', postedAt: '2026-01-01T00:00:00Z' },
    { id: '3', postedAt: '2026-03-01T00:00:00Z' },
    { id: '2', postedAt: '2026-02-01T00:00:00Z' },
  ];
  assert.deepEqual(sortProducts(list).map((item) => item.id), ['3', '2', '1']);
});

test('produk duplikat tidak tampil dua kali', () => {
  const satu = { id: '1', postedAt: '2026-01-01T00:00:00Z' };
  assert.equal(dedupe([satu, { ...satu }]).length, 1);
});

// --- Discord: baca histori lama ------------------------------------------

function mockDiscord(penangan) {
  return async (url) => {
    const alamat = String(url);
    assert.match(alamat, /^https:\/\/discord\.com\/api\/v10\//);
    return penangan(alamat);
  };
}

function ok(body) {
  return { status: 200, ok: true, json: async () => body };
}

test('produk lama di channel kedua ikut terbaca lewat paginasi mundur', async () => {
  // Discord selalu mengembalikan 100 pesan per halaman. Halaman terisi penuh
  // berarti masih ada pesan lebih lama di belakangnya, jadi sistem wajib
  // meminta halaman berikutnya - inilah yang membuat produk lama ikut tampil.
  const filler = (prefix) =>
    Array.from({ length: 99 }, (_, i) => ({
      id: `${prefix}${i}`,
      timestamp: '2026-01-01T00:00:00Z',
      content: `chat ${i}`,
      embeds: [],
      attachments: [],
    }));

  const halaman1 = [pesanSamp({ id: '900' }), ...filler('a')];
  const halaman2 = [pesanSamp({ id: '850', judul: 'Panel Character' }), ...filler('b')];
  const halaman3 = [pesanSamp({ id: '800', judul: 'HUD Sapu Jagat' })];

  let halaman = 0;
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (alamat.endsWith('/channels/1111111111111111111')) return ok({ id: '1111111111111111111', name: 'product-samp' });
    if (alamat.includes('/channels/2222222222222222222/messages')) return ok([]);
    if (!alamat.includes('before=')) return ok(halaman1);
    return ok([halaman2, halaman3][halaman++]);
  });

  const hasil = await fetchShowcaseProducts({
    token: TOKEN,
    channels: [{ id: '1111111111111111111' }],
    limit: 10,
    maxPages: 3,
    guildId: GUILD,
  });
  globalThis.fetch = asli;

  assert.equal(hasil.items.length, 3);
  assert.deepEqual(hasil.items.map((item) => item.title), ['Textdraw Smartphone', 'Panel Character', 'HUD Sapu Jagat']);
  assert.equal(hasil.scanned, 201);
  assert.equal(hasil.channels[0].name, 'product-samp');
  assert.equal(hasil.truncated, false);
});

test('dua channel digabung, kategori mengikuti asal channel', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (alamat.endsWith('/channels/1111111111111111111')) return ok({ id: '1111111111111111111', name: 'product-samp' });
    if (alamat.endsWith('/channels/2222222222222222222')) return ok({ id: '2222222222222222222', name: 'digital-service' });
    if (alamat.includes('/1111111111111111111/messages')) return ok([pesanSamp()]);
    return ok([pesanDigital()]);
  });

  const hasil = await fetchShowcaseProducts({
    token: TOKEN,
    channels: [{ id: '1111111111111111111' }, { id: '2222222222222222222' }],
    limit: 10,
    guildId: GUILD,
  });
  globalThis.fetch = asli;

  assert.equal(hasil.items.length, 2);
  const perKategori = Object.fromEntries(hasil.items.map((item) => [item.title, item.category]));
  assert.deepEqual(perKategori, { 'Textdraw Smartphone': 'SA-MP', 'Setup Discord': 'Discord' });
  assert.deepEqual(hasil.items.map((item) => item.price), ['Rp19.500', null]);
  assert.equal(hasil.items[0].messageUrl, `https://discord.com/channels/${GUILD}/1111111111111111111/900`);
});

test('channel yang tidak bisa dibaca tidak menggagalkan channel lain', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (alamat.includes('/9999999999999999999')) return { status: 403, ok: false, json: async () => ({}) };
    if (alamat.endsWith('/channels/1111111111111111111')) return ok({ id: '1111111111111111111', name: 'product-samp' });
    return ok([pesanSamp()]);
  });

  const hasil = await fetchShowcaseProducts({
    token: TOKEN,
    channels: [{ id: '1111111111111111111' }, { id: '9999999999999999999' }],
    limit: 10,
  });
  globalThis.fetch = asli;

  assert.equal(hasil.items.length, 1);
  const gagal = hasil.channels.find((item) => item.id === '9999999999999999999');
  assert.equal(gagal.count, 0);
  assert.equal(gagal.error, 'Bot tidak punya akses ke channel ini');
});

test('nama channel gagal dibaca tidak menggagalkan produk', async () => {
  // Bot bisa saja punya izin baca pesan tapi tidak punya izin baca metadata
  // channel. Kategori harus tetap ketemu dari isi produk.
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (!alamat.includes('/messages')) return { status: 403, ok: false, json: async () => ({}) };
    return ok([pesanSamp()]);
  });

  const hasil = await fetchShowcaseProducts({
    token: TOKEN,
    channels: [{ id: '1111111111111111111' }],
    limit: 10,
  });
  globalThis.fetch = asli;

  assert.equal(hasil.items[0].category, 'SA-MP');
  assert.equal(hasil.items[0].channelName, null);
});

test('limit membatasi jumlah produk yang dikirim', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (!alamat.includes('/messages')) return ok({ id: '1111111111111111111', name: 'product-samp' });
    return ok(Array.from({ length: 5 }, (_, i) => pesanSamp({ id: String(900 - i) })));
  });

  const hasil = await fetchShowcaseProducts({ token: TOKEN, channels: [{ id: '1111111111111111111' }], limit: 2 });
  globalThis.fetch = asli;

  assert.equal(hasil.items.length, 2);
});

test('token tidak ikut ke payload produk', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) =>
    alamat.includes('/messages') ? ok([pesanSamp(), pesanDigital()]) : ok({ id: '1', name: 'product-samp' }),
  );

  const hasil = await fetchShowcaseProducts({
    token: TOKEN,
    channels: [{ id: '1111111111111111111' }],
    limit: 10,
  });
  globalThis.fetch = asli;

  assert.equal(JSON.stringify(hasil).includes(TOKEN), false);
});

// --- Handler --------------------------------------------------------------

function makeRes() {
  const res = { statusCode: null, headers: {}, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

test('handler: 405 untuk selain GET', async () => {
  const res = makeRes();
  await handler({ method: 'POST', query: {} }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
});

test('handler: 500 bila env belum di-set, token tidak ikut pesan', async () => {
  const saved = {
    t: process.env.DISCORD_BOT_TOKEN,
    c: process.env.DISCORD_SHOWCASE_CHANNELS,
  };
  delete process.env.DISCORD_BOT_TOKEN;
  delete process.env.DISCORD_SHOWCASE_CHANNELS;

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(JSON.stringify(res.body).includes(TOKEN), false);

  if (saved.t) process.env.DISCORD_BOT_TOKEN = saved.t;
  if (saved.c) process.env.DISCORD_SHOWCASE_CHANNELS = saved.c;
});

test('parseChannelList menerima id dan id:Kategori', () => {
  const hasil = parseChannelList(' 1111111111111111111 , 2222222222222222222:UI , ');
  assert.deepEqual(hasil.channels, [
    { id: '1111111111111111111', category: null },
    { id: '2222222222222222222', category: 'UI' },
  ]);
  assert.deepEqual(hasil.invalid, []);
  assert.deepEqual(hasil.unknown, []);
});

test('kategori di env tidak memperhatikan perbedaan huruf besar-kecil', () => {
  // Orang sering mengetik "samp" atau "samp" kecil di Vercel. Itu harus tetap
  // berarti filter "SA-MP" yang sudah ada, bukan kategori baru dan bukan
  // diabaikan diam-diam.
  const hasil = parseChannelList('1553622067746840709:samp,1553622274001735782:discord');
  assert.deepEqual(hasil.channels, [
    { id: '1553622067746840709', category: 'SA-MP' },
    { id: '1553622274001735782', category: 'Discord' },
  ]);
  assert.deepEqual(hasil.unknown, []);
});

test('kategori yang bukan nama filter dicatat, bukan diabaikan diam-diam', () => {
  // "digital" bukan nama filter website, jadi kategori dikosongkan (produknya
  // nanti ditebak otomatis) DAN aslinya dikembalikan supaya kelihatan.
  const hasil = parseChannelList('1553622067746840709:samp,1553622274001735782:digital');
  assert.deepEqual(hasil.channels, [
    { id: '1553622067746840709', category: 'SA-MP' },
    { id: '1553622274001735782', category: null },
  ]);
  assert.deepEqual(hasil.unknown, ['digital']);
});

test('kategori dari env tidak pernah bernilai di luar filter website', () => {
  const hasil = parseChannelList('1111111111111111111:all,2222222222222222222:Digital Service,3333333333333333333:web');
  for (const channel of hasil.channels) {
    // null itu sah: artinya "biarkan ditebak otomatis dari isi produk".
    if (channel.category === null) continue;
    assert.ok(SHOWCASE_FILTERS.includes(channel.category), `di luar filter: ${channel.category}`);
    assert.notEqual(channel.category, 'All');
  }
  assert.deepEqual(hasil.unknown, ['all', 'Digital Service']);
});

test('parseChannelList menolak nilai yang bukan snowflake', () => {
  // Empat input: tiga rusak, satu sah tapi kategorinya ngawur. Kategori yang
  // tidak dikenal harus diabaikan, bukan ikut merusak parsing.
  const hasil = parseChannelList('"1111111111111111111", product-samp, 111, 1111111111111111111:Kseisahan');
  assert.deepEqual(hasil.channels, [{ id: '1111111111111111111', category: null }]);
  assert.deepEqual(hasil.invalid, ['"1111111111111111111"', 'product-samp', '111']);
  assert.deepEqual(hasil.unknown, ['Kseisahan']);
});

test('handler: 500 dengan pesan jelas kalau channel id bukan snowflake', async () => {
  const asli = globalThis.fetch;
  let dipanggil = false;
  globalThis.fetch = async () => {
    dipanggil = true;
    return ok([]);
  };

  process.env.DISCORD_BOT_TOKEN = TOKEN;
  process.env.DISCORD_SHOWCASE_CHANNELS = 'product-samp';

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);
  globalThis.fetch = asli;

  assert.equal(res.statusCode, 500);
  assert.match(res.body.error, /SHOWCASE_CHANNELS/);
  assert.equal(JSON.stringify(res.body).includes(TOKEN), false);
  assert.equal(dipanggil, false, 'Discord tidak boleh dipanggil untuk channel id tak valid');
});

test('handler 200: payload bersih, kategori sesuai filter yang sudah ada', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => {
    if (!alamat.includes('/messages')) return ok({ id: '1111111111111111111', name: 'product-samp' });
    return ok([pesanSamp(), pesanDigital()]);
  });

  process.env.DISCORD_BOT_TOKEN = `  ${TOKEN}\n`;
  process.env.DISCORD_SHOWCASE_CHANNELS = ' 1111111111111111111 , 2222222222222222222 ';

  const res = makeRes();
  await handler({ method: 'GET', query: { limit: '24' } }, res);
  globalThis.fetch = asli;

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 2);
  assert.equal(res.body.source, 'discord');
  assert.match(res.headers['Cache-Control'], /s-maxage=60/);
  assert.deepEqual(res.body.categories, ['SA-MP', 'Discord', 'Bot', 'Website', 'UI']);

  for (const item of res.body.items) {
    for (const key of ['id', 'title', 'category', 'image']) {
      assert.ok(key in item, `card Showcase butuh field ${key}`);
    }
    assert.ok(SHOWCASE_FILTERS.includes(item.category), `kategori di luar filter: ${item.category}`);
  }

  assert.equal(JSON.stringify(res.body).includes(TOKEN), false, 'token tidak boleh ikut');
});

test('handler 200 tapi array kosong saat semua produk dihapus di Discord', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord((alamat) => (alamat.includes('/messages') ? ok([]) : ok({ id: '1', name: 'product-samp' })));
  process.env.DISCORD_BOT_TOKEN = TOKEN;
  process.env.DISCORD_SHOWCASE_CHANNELS = '1111111111111111111';

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);
  globalThis.fetch = asli;

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.items, []);
  assert.equal(res.body.count, 0);
});

/* ==========================================================================
 * TES BERBASIS PESAN ASLI
 *
 * Di bawah ini salinan mentah `message.content` dari channel #product-samp dan
 * #digital-service APISZ STORE (Agustus 2026, diambil lewat Discord REST API).
 * Test ini sengaja memakai data nyata, bukan contoh karangan, karena tiga bug
 * di parser ini hanya ketahuan dari data nyata:
 *   - judul ditulis sebagai heading markdown ("# ...", bukan glyph saja),
 *   - status ditulis di dalam backtick (`` `Exclusive Preview ... ` ``),
 *   - pesan ditutup `<#channelId>` dan `@everyone` yang tidak boleh tampil.
 * Kalau format post di Discord berubah, test ini yang pertama gagal.
 * ========================================================================== */

const REAL_SAMP_PREVIEW =
  '# \u2726 Announcement Modern\u2726\n' +
  '`Exclusive Preview \u2022 Tidak Untuk Dijual`\n' +
  '**High-quality textdraw design\n' +
  'dirancang untuk memberikan visual yang clean, modern, dan elegan\n' +
  'pada server GTA SAMP Anda.**\n' +
  '\u2728 Looking for a similar concept?\n' +
  'Ingin konsep textdraw seperti ini?\n' +
  'Silakan lakukan pemesanan melalui \u279c <#1545657764833919118> \n' +
  '@everyone';

const REAL_SETUP_DISCORD =
  '# \u2726 Setup Discord\u2726\n' +
  '`Exclusive Preview \u2022 Tidak Untuk Dijual`\n' +
  '**High-quality design dirancang untuk memberikan visual yang clean, rapi, dan simpel pada server Discord Anda.**\n' +
  '\u2728 Looking for a similar concept?\n' +
  'Silakan lakukan pemesanan melalui \u279c <#1545657764833919118> \n' +
  '@everyone';

function pesanAsli(content, name = 'image.png') {
  return {
    id: '1553637719287009292',
    timestamp: '2026-09-27T05:21:37.471000+00:00',
    content,
    embeds: [],
    attachments: [
      { filename: name, content_type: 'image/webp', url: `https://cdn.discordapp.com/a/${name}` },
    ],
  };
}

test('pesan asli: heading "# " tidak ikut jadi bagian dari judul', () => {
  // Kegagalan #1: judul jadi "# Announcement Modern". Heading markdown adalah
  // penanda level di Discord, bukan bagian dari nama produk.
  const produk = parseProductMessage(pesanAsli(REAL_SAMP_PREVIEW), {
    channelId: '1553622067746840709',
    channelName: '\u2728 product-samp',
    pinnedCategory: 'SA-MP',
  });

  assert.equal(produk.title, 'Announcement Modern');
  assert.ok(!produk.title.includes('#'), 'heading "# " tidak boleh bocor ke judul');
  assert.ok(!produk.title.includes('\u2726'), 'glyph dekoratif tidak boleh bocor ke judul');
});

test('pesan asli: backtick dan bullet status tidak bocor ke statusLabel', () => {
  // Kegagalan #2: status ditulis `` `Exclusive Preview \u2022 ... ` ``. Tanpa
  // dibersihkan, teksnya jadi "`Exclusive Preview \u2022 ...`".
  const produk = parseProductMessage(pesanAsli(REAL_SAMP_PREVIEW), {
    channelId: '1553622067746840709',
    channelName: '\u2728 product-samp',
  });

  assert.equal(produk.status, 'unavailable');
  assert.equal(produk.statusLabel, 'Exclusive Preview');
  assert.ok(!produk.statusLabel.includes('`'), 'backtick tidak boleh ikut');
});

test('pesan asli: mention channel dan @everyone tidak tampil di website', () => {
  // Kegagalan #3: `<#1545657764833919118>` dan `@everyone` ikut jadi deskripsi
  // kalau markup Discord tidak dibuang.
  const produk = parseProductMessage(pesanAsli(REAL_SAMP_PREVIEW), {
    channelId: '1553622067746840709',
    channelName: '\u2728 product-samp',
  });

  assert.ok(!produk.description.includes('@everyone'), '@everyone tidak boleh tampil');
  assert.ok(!/\d{17,20}/.test(produk.description), 'id channel tidak boleh bocor ke deskripsi');
  assert.ok(!produk.description.includes('<'), 'sisa markup Discord tidak boleh bocor');
  assert.equal(
    produk.description,
    'High-quality textdraw design dirancang untuk memberikan visual yang clean, modern, dan elegan pada server GTA SAMP Anda.',
  );
});

test('pesan asli: deskripsi berhenti sebelum baris ajakan bertindak', () => {
  const produk = parseProductMessage(pesanAsli(REAL_SAMP_PREVIEW), {
    channelId: '1553622067746840709',
    channelName: '\u2728 product-samp',
  });

  assert.ok(!/looking for/i.test(produk.description), 'baris penutup tidak ikut');
  assert.ok(!/silakan/i.test(produk.description), 'baris CTA tidak ikut');
});

test('pesan asli: produk dari channel digital-service dapat kategori Discord', () => {
  const produk = parseProductMessage(pesanAsli(REAL_SETUP_DISCORD), {
    channelId: '1553622274001735782',
    channelName: '\u2728 digital-service',
  });

  assert.equal(produk.title, 'Setup Discord');
  assert.equal(produk.category, 'Discord');
  assert.ok(SHOWCASE_FILTERS.includes(produk.category));
});

test('pesan asli: channel dipin SA-MP tapi judul speedometer tetap jadi UI', () => {
  // Ini alasan pin env diturunkan jadi default: satu pin untuk satu channel
  // selalu lebih kasar daripada isi tiap produknya.
  const produk = parseProductMessage(
    pesanAsli('# \u2726 Digital Speedometer\u2726\n`For Sale`\nSpeedometer digital untuk server SA-MP anda.\nPreview \u2192 #speedometer', 'sa-mp-042.png'),
    { channelId: '1553622067746840709', channelName: '\u2728 product-samp', pinnedCategory: 'SA-MP' },
  );

  assert.equal(produk.title, 'Digital Speedometer');
  assert.equal(produk.category, 'UI');
});

test('pesan asli tanpa dekorasi tapi berheading tetap jadi judul', () => {
  // Varian kedua yang dipakai author: heading markdown tanpa glyph.
  assert.equal(parseTitle(['# Paket Botsmurder']), 'Paket Botsmurder');
  assert.equal(parseTitle(['## Paket Botsmurder']), 'Paket Botsmurder');
});

test('baris deskripsi tidak salah jadi judul sekarang pola judul longgar', () => {
  // Penjaga untuk pola `HEADING_TITLE` dan `DECORATED_TITLE`: kalau nanti
  // digabung jadi satu regex yang semua opsional, baris ini ikut jadi judul.
  const produk = parseProductMessage(
    pesanAsli('# \u2726 Panel Character\u2726\n`For Sale`\nPanel karakter custom yang bisa dipakai langsung.\nPreview \u2192 #panel', 'sa-mp-055.png'),
    { channelId: '1553622067746840709', channelName: '\u2728 product-samp' },
  );

  assert.equal(produk.title, 'Panel Character');
  assert.equal(produk.description, 'Panel karakter custom yang bisa dipakai langsung.');
});
