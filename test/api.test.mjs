import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../api/testimonials.js';
import { fetchTestimonials } from '../src/lib/discord.js';

const TOKEN = 'token-rahasia-yang-tidak-boleh-bocor';

function embed(nama, tanggal, harga = 'Rp19.500') {
  return {
    title: 'Rating ApisZ STORE',
    fields: [
      { name: 'Customer', value: `@${nama}` },
      { name: 'Rate', value: '\u2b50\u2b50\u2b50\u2b50\u2b50' },
      { name: 'Product/Jasa', value: 'Custom DC' },
      { name: 'Harga', value: harga },
      { name: 'Komentar', value: 'PELAYANAN CEPAT JOSJIS PKOKNYA' },
      { name: 'Invoice', value: 'INV-20260913-XXXX' },
      { name: 'Tanggal', value: tanggal },
    ],
  };
}

function makeRes() {
  const res = { statusCode: null, headers: {}, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

function mockDiscord(pages) {
  return async (url, options) => {
    assert.match(String(url), /^https:\/\/discord\.com\/api\/v10\/channels\//);
    assert.equal(options.headers.Authorization, `Bot ${TOKEN}`);
    const page = String(url).includes('before=') ? pages[1] : pages[0];
    return { status: 200, ok: true, json: async () => page };
  };
}

test('handler: 405 untuk selain GET', async () => {
  const res = makeRes();
  await handler({ method: 'POST', query: {} }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
});

test('handler: 500 bila env belum di-set, token tidak ikut pesan', async () => {
  const saved = { t: process.env.DISCORD_BOT_TOKEN, c: process.env.DISCORD_CHANNEL_ID };
  delete process.env.DISCORD_BOT_TOKEN;
  delete process.env.DISCORD_CHANNEL_ID;

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(JSON.stringify(res.body).includes(TOKEN), false);

  if (saved.t) process.env.DISCORD_BOT_TOKEN = saved.t;
  if (saved.c) process.env.DISCORD_CHANNEL_ID = saved.c;
});

test('fetchTestimonials: paginasi mundur membaca testimoni lama', async () => {
  // Discord selalu mengembalikan halaman berisi 100 pesan. Halaman yang
  // terisi penuh berarti masih ada pesan lebih lama di belakangnya.
  const filler = (prefix, count) =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, timestamp: '2026-01-01T00:00:00Z', embeds: [] }));

  const page1 = [
    { id: '300', timestamp: '2026-09-20T00:00:00Z', embeds: [embed('BUDI', '20 September 2026')] },
    ...filler('p1', 99),
  ];
  const page2 = [
    { id: '200', timestamp: '2026-09-13T00:00:00Z', embeds: [embed('IC MATEO_DEGUERRA', '13 September 2026')] },
    ...filler('p2', 99),
  ];
  const page3 = [
    { id: '100', timestamp: '2026-09-01T00:00:00Z', embeds: [embed('SITI', '1 September 2026', 'Rp25.000')] },
  ];

  let call = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/discord\.com\/api\/v10\/channels\//);
    assert.equal(options.headers.Authorization, `Bot ${TOKEN}`);
    const seq = String(url).includes('before=') ? ++call : 0;
    return { status: 200, ok: true, json: async () => [page1, page2, page3][seq] };
  };

  const result = await fetchTestimonials({ token: TOKEN, channelId: '999', limit: 10, maxPages: 5 });
  globalThis.fetch = original;

  assert.equal(result.testimonials.length, 3);
  assert.deepEqual(result.testimonials.map((t) => t.name), ['BUDI', 'IC MATEO_DEGUERRA', 'SITI']);
  assert.equal(result.testimonials[0].price, 'Rp19.500');
  assert.equal(result.testimonials[2].price, 'Rp25.000');
  assert.equal(result.scanned, 201);
  assert.equal(result.pages, 3);
  assert.equal(result.truncated, false);
});

test('maxPages dihormati saat rating dibatasi', async () => {
  // Setiap halaman harus berisi pesan yang benar-benar berbeda. Kalau tidak,
  // `dedupe` akan collapsenya menjadi satu sehingga hitungannya tidak terbaca.
  const makePage = (offset) =>
    Array.from({ length: 100 }, (_, i) => {
      const n = offset + i;
      return { id: String(n), timestamp: '2026-09-13T00:00:00Z', embeds: [embed(`U${n}`, '13 September 2026')] };
    });

  let call = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    const offset = call++ * 100;
    return { status: 200, ok: true, json: async () => makePage(offset) };
  };

  const result = await fetchTestimonials({ token: TOKEN, channelId: '999', limit: 1000, maxPages: 2 });
  globalThis.fetch = original;

  assert.equal(result.pages, 2);
  assert.equal(result.scanned, 200);
  assert.equal(result.testimonials.length, 200);
  assert.equal(result.truncated, true, 'harus bilang belum semua histori terbaca');
});

test('pesan duplikat di halaman berbeda tidak tampil dua kali', async () => {
  const dup = [{ id: '1', timestamp: '2026-09-13T00:00:00Z', embeds: [embed('BUDI', '13 September 2026')] }];

  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ status: 200, ok: true, json: async () => dup });

  const result = await fetchTestimonials({ token: TOKEN, channelId: '999', limit: 10, maxPages: 1 });
  globalThis.fetch = original;

  assert.equal(result.testimonials.length, 1);
});

test('handler 500 dengan pesan jelas kalau channel id bukan snowflake', async () => {
  // Nilai yang dibungkus tanda kutip atau berisi nama channel membuat Discord
  // membalas 400 "Invalid Form Body" tanpa penjelasan. Handler harus menolak
  // sendiri sebelum memanggil Discord.
  const asli = globalThis.fetch;
  let dipanggil = false;
  globalThis.fetch = async () => {
    dipanggil = true;
    return { status: 200, ok: true, json: async () => [] };
  };

  for (const buruk of ['"1545657570549829662"', 'rating-store', '999', '15456 5705 49829662']) {
    process.env.DISCORD_BOT_TOKEN = TOKEN;
    process.env.DISCORD_CHANNEL_ID = buruk;

    const res = makeRes();
    await handler({ method: 'GET', query: {} }, res);

    assert.equal(res.statusCode, 500, `harus ditolak: ${buruk}`);
    assert.match(res.body.error, /Channel ID/);
    assert.equal(JSON.stringify(res.body).includes(TOKEN), false);
  }

  assert.equal(dipanggil, false, 'Discord tidak boleh dipanggil untuk channel id tak valid');
  globalThis.fetch = asli;
});

test('handler: spasi/newline di env tetap diterima karena sudah di-trim', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = mockDiscord([
    [{ id: '1001', timestamp: '2026-09-13T10:00:00Z', embeds: [embed('IC MATEO_DEGUERRA', '13 September 2026')] }],
  ]);
  process.env.DISCORD_BOT_TOKEN = `  ${TOKEN}\n`;
  process.env.DISCORD_CHANNEL_ID = ' 1545657570549829662 ';

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);
  globalThis.fetch = asli;

  assert.equal(res.statusCode, 200);
});

test('handler 200 tapi array kosong saat semua testimoni dihapus di Discord', async () => {
  // Kontrak yang diandalkan komponen: "terhubung tapi belum ada data" harus
  // dibedakan dari "endpoint gagal". Komponen memakai testimonials.length === 0
  // bersama flag connected untuk menampilkan empty state, bukan kartu Demo.
  const asli = globalThis.fetch;
  globalThis.fetch = async () => ({ status: 200, ok: true, json: async () => [] });
  process.env.DISCORD_BOT_TOKEN = TOKEN;
  process.env.DISCORD_CHANNEL_ID = '1545657570549829662';

  const res = makeRes();
  await handler({ method: 'GET', query: {} }, res);
  globalThis.fetch = asli;

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.testimonials, []);
  assert.equal(res.body.count, 0);
  assert.equal(res.body.source, 'discord');
});

test('handler 200: payload bersih, invoice tidak ada, token tidak bocor', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = mockDiscord([
    [{ id: '1001', timestamp: '2026-09-13T10:00:00Z', embeds: [embed('IC MATEO_DEGUERRA', '13 September 2026')] }],
  ]);
  process.env.DISCORD_BOT_TOKEN = TOKEN;
  process.env.DISCORD_CHANNEL_ID = '1545657570549829662';

  const res = makeRes();
  await handler({ method: 'GET', query: { limit: '12' } }, res);
  globalThis.fetch = original;

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 1);
  assert.match(res.headers['Cache-Control'], /s-maxage=60/);

  const item = res.body.testimonials[0];
  assert.equal(item.name, 'IC MATEO_DEGUERRA');
  assert.equal(item.username, '@IC MATEO_DEGUERRA');
  assert.equal(item.rating, 5);
  assert.equal(item.product, 'Custom DC');
  assert.equal(item.price, 'Rp19.500');
  assert.equal(item.dateDisplay, '13 September 2026');

  const json = JSON.stringify(res.body);
  assert.equal(json.includes('INV-'), false, 'invoice tidak boleh ikut');
  assert.equal(json.includes(TOKEN), false, 'token tidak boleh ikut');
});

test('embedTitle menyaring embed lain', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = mockDiscord([
    [
      { id: 'a', timestamp: '2026-09-20T00:00:00Z', embeds: [{ title: 'Pengumuman', description: 'bukan testimoni' }] },
      { id: 'b', timestamp: '2026-09-13T00:00:00Z', embeds: [embed('BUDI', '13 September 2026')] },
    ],
  ]);

  const result = await fetchTestimonials({ token: TOKEN, channelId: '999', limit: 10, embedTitle: 'Rating' });
  globalThis.fetch = original;

  assert.equal(result.testimonials.length, 1);
  assert.equal(result.testimonials[0].name, 'BUDI');
});

test('limit dibatasi agar tidak bisa diambil terlalu banyak', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = mockDiscord([
    Array.from({ length: 100 }, (_, i) => ({ id: String(i), timestamp: '2026-09-13T00:00:00Z', embeds: [embed(`U${i}`, '13 September 2026')] })),
  ]);

  const result = await fetchTestimonials({ token: TOKEN, channelId: '999', limit: 5, maxPages: 1 });
  globalThis.fetch = original;

  assert.equal(result.testimonials.length, 5);
});
