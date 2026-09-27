import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMessage } from '../src/lib/parse-testimonial.js';
import { applyIdentities } from '../src/lib/discord.js';

/**
 * Bentuk embed yang BENAR-BENAR dipakai bot di channel, diambil dari
 * GetMessages pada 27 September 2026. Bot menulis "**Label:**" (titik dua
 * berada DI DALAM bold) dan Customer berupa Discord mention, bukan "@nama".
 */
const EMBED_ASLI = {
  title: '\u2b50 Rating ApisZ STORE',
  description: [
    '**Customer:** <@1368863471659122740>',
    '**Rate:** \u2b50\u2b50\u2b50\u2b50\u2b50',
    '**Product/Jasa:** custom textdraw + rapih dc',
    '**Harga:** Rp16.000',
    '**Komentar:** "Mantap jangan lupa pake jasa dia ,amanah cepat fast respon"',
    '**Invoice:** `INV-20260917-KAE2`',
    '**Tanggal:** 18 September 2026',
  ].join('\n'),
};

const pesanAsli = {
  id: '1550401588189990935',
  timestamp: '2026-09-18T04:20:00.000Z',
  embeds: [EMBED_ASLI],
};

test('embed asli bot: tidak ada "**" yang bocor ke nilai', () => {
  const t = parseMessage(pesanAsli);
  for (const key of ['name', 'username', 'text', 'product', 'price']) {
    assert.equal(
      String(t[key] ?? '').includes('**'),
      false,
      `${key} masih mengandung "**": ${t[key]}`,
    );
  }
});

test('embed asli bot: harga tetap verbatim tanpa markdown', () => {
  assert.equal(parseMessage(pesanAsli).price, 'Rp16.000');
});

test('embed asli bot: tanda kutip pembungkus komentar dibuang', () => {
  assert.equal(
    parseMessage(pesanAsli).text,
    'Mantap jangan lupa pake jasa dia ,amanah cepat fast respon',
  );
});

test('embed asli bot: customer jadi userId, bukan teks mention mentah', () => {
  const t = parseMessage(pesanAsli);
  assert.equal(t.userId, '1368863471659122740');
  assert.equal(t.name, null, 'nama tidak boleh menebak sebelum di-resolve');
  assert.equal(t.username, null);
  assert.equal(String(t.name ?? t.text).includes('<@'), false, 'mention tidak boleh bocor');
});

test('embed asli bot: tanggal & bintang terbaca', () => {
  const t = parseMessage(pesanAsli);
  assert.equal(t.rating, 5);
  assert.equal(t.date, '2026-09-18');
  assert.equal(t.dateDisplay, '18 September 2026');
});

test('embed asli bot: invoice tidak pernah ikut', () => {
  const t = parseMessage(pesanAsli);
  assert.equal('invoice' in t, false);
  assert.equal(JSON.stringify(t).includes('INV-20260917'), false);
});

test('global name dari Discord juga dibersihkan dari glif dekoratif', () => {
  // Regresi nyata di produksi: kartu tetap menampilkan "MATEO_DEGUERRA"
  // padahal parser sudah membersihkannya, karena name berasal dari
  // global_name Discord yang tidak melewati clean(). Test sebelumnya memakai
  // nama bersih sehingga bug ini tidak tertangkap.
  const parsed = [parseMessage(pesanAsli)];
  const filled = applyIdentities(parsed, new Map([
    ['1368863471659122740', { username: 'albertdaridesa_04469', globalName: '\u{1D408}\u{1D402} MATEO_DEGUERRA' }],
  ]));

  assert.equal(filled[0].name, 'MATEO_DEGUERRA');
  assert.equal(/[\u{1d400}-\u{1d7ff}]/u.test(filled[0].name), false);
  assert.equal(filled[0].username, '@albertdaridesa_04469');
});

test('username dari Discord juga dibersihkan', () => {
  const filled = applyIdentities([parseMessage(pesanAsli)], new Map([
    ['1368863471659122740', { username: '\u{1D41A}aldo', globalName: null }],
  ]));
  assert.equal(filled[0].username, '@aldo');
});

test('mention di-resolve jadi username asli', () => {
  const parsed = [parseMessage(pesanAsli)];
  const filled = applyIdentities(parsed, new Map([
    ['1368863471659122740', { username: 'albertdaridesa_04469', globalName: 'IC MATEO_DEGUERRA' }],
  ]));

  assert.equal(filled[0].name, 'IC MATEO_DEGUERRA');
  assert.equal(filled[0].username, '@albertdaridesa_04469');
});

test('global name dipakai kalau ada, kalau tidak pakai username', () => {
  const parsed = [parseMessage(pesanAsli)];
  const filled = applyIdentities(parsed, new Map([
    ['1368863471659122740', { username: 'idos_saputra', globalName: null }],
  ]));

  assert.equal(filled[0].name, 'idos_saputra');
  assert.equal(filled[0].username, '@idos_saputra');
});

test('user tidak ditemukan -> label cadangan, bukan kotak kosong', () => {
  const filled = applyIdentities([parseMessage(pesanAsli)], new Map());
  assert.equal(filled[0].name, 'Pelanggan Discord');
});

test('glif font fancy dibuang supaya tidak jadi tofu', () => {
  const pesan = {
    ...pesanAsli,
    embeds: [{
      description: EMBED_ASLI.description.replace('<@1368863471659122740>', '\u{1D408}\u{1D402} MATEO_DEGUERRA'),
    }],
  };
  const t = parseMessage(pesan);
  assert.equal(t.name, 'MATEO_DEGUERRA');
  assert.equal(/[\u{1d400}-\u{1d7ff}]/u.test(t.name), false, 'glif dekoratif masih ada');
});

test('mention ditempel di samping nama tetap terbaca', () => {
  const pesan = {
    ...pesanAsli,
    embeds: [{ description: EMBED_ASLI.description.replace('<@1368863471659122740>', 'Budi <@1368863471659122740>') }],
  };
  const t = parseMessage(pesan);
  assert.equal(t.name, 'Budi');
  assert.equal(t.userId, '1368863471659122740');
});

test('mention dengan nickname lama <@!id> tetap jalan', () => {
  const pesan = {
    ...pesanAsli,
    embeds: [{ description: EMBED_ASLI.description.replace('<@1368863471659122740>', '<@!1368863471659122740>') }],
  };
  assert.equal(parseMessage(pesan).userId, '1368863471659122740');
});

test('pesan tanpa nama tapi ada komentar tetap jadi testimoni', () => {
  const pesan = {
    id: '1',
    timestamp: '2026-09-18T04:20:00.000Z',
    embeds: [{ description: '**Rate:** \u2b50\u2b50\u2b50\n**Komentar:** Bagus' }],
  };
  const t = parseMessage(pesan);
  assert.equal(t.text, 'Bagus');
  assert.equal(t.userId, null);
});
