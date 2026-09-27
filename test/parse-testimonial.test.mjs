import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dedupe, parseMessage, parseRating, parseDate, sortTestimonials } from '../src/lib/parse-testimonial.js';

const EMBED_SPEC = {
  title: 'Rating ApisZ STORE',
  fields: [
    { name: 'Customer', value: '@IC MATEO_DEGUERRA' },
    { name: 'Rate', value: '\u2b50\u2b50\u2b50\u2b50\u2b50' },
    { name: 'Product/Jasa', value: 'Custom DC' },
    { name: 'Harga', value: 'Rp19.500' },
    { name: 'Komentar', value: 'PELAYANAN CEPAT JOSJIS PKOKNYA' },
    { name: 'Invoice', value: 'INV-20260913-XXXX' },
    { name: 'Tanggal', value: '13 September 2026' },
  ],
};

const MSG = { id: '1001', timestamp: '2026-09-13T10:00:00.000Z', embeds: [EMBED_SPEC] };

test('contoh resmi spec ter-parse persis', () => {
  const t = parseMessage(MSG);
  assert.equal(t.name, 'IC MATEO_DEGUERRA');
  assert.equal(t.username, '@IC MATEO_DEGUERRA');
  assert.equal(t.rating, 5);
  assert.equal(t.text, 'PELAYANAN CEPAT JOSJIS PKOKNYA');
  assert.equal(t.product, 'Custom DC');
  assert.equal(t.price, 'Rp19.500');
  assert.equal(t.date, '2026-09-13');
  assert.equal(t.dateDisplay, '13 September 2026');
});

test('invoice TIDAK pernah ikut ke card', () => {
  const t = parseMessage(MSG);
  assert.equal('invoice' in t, false);
  assert.equal(JSON.stringify(t).includes('INV-20260913'), false);
});

test('harga verbatim, tidak diformat ulang', () => {
  for (const raw of ['Rp19.500', 'Rp1.250.000', 'Rp 500', 'GRATIS', '19.500']) {
    const t = parseMessage({ ...MSG, embeds: [{ fields: [{ name: 'Customer', value: '@a' }, { name: 'Harga', value: raw }] }] });
    assert.equal(t.price, raw, `harga "${raw}" harus utuh`);
  }
});

test('embed description (teks bebas) juga jalan', () => {
  const msg = {
    id: '1',
    timestamp: '2026-09-13T10:00:00.000Z',
    embeds: [{
      description: [
        'Customer: @IC MATEO_DEGUERRA',
        'Rate: \u2b50\u2b50\u2b50\u2b50\u2b50',
        'Product/Jasa: Custom DC',
        'Harga: Rp19.500',
        'Komentar: PELAYANAN CEPAT JOSJIS PKOKNYA',
        'Tanggal: 13 September 2026',
      ].join('\n'),
    }],
  };
  const t = parseMessage(msg);
  assert.equal(t.name, 'IC MATEO_DEGUERRA');
  assert.equal(t.rating, 5);
  assert.equal(t.product, 'Custom DC');
  assert.equal(t.price, 'Rp19.500');
  assert.equal(t.date, '2026-09-13');
});

test('bintang dengan variation selector U+FE0F', () => {
  assert.equal(parseRating('\u2b50\ufe0f\u2b50\ufe0f\u2b50\ufe0f'), 3);
  assert.equal(parseRating('\u2b50\u2b50\u2b50\u2b50\u2b50'), 5);
});

test('batas 1-5 tidak pernah dilampaui', () => {
  assert.equal(parseRating('\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50'), 5);
  assert.equal(parseRating('4/5'), 4);
  assert.equal(parseRating('5 dari 5'), 5);
  assert.equal(parseRating('3'), 3);
  assert.equal(parseRating('nonsense'), null);
  assert.equal(parseRating(''), null);
});

test('tanggal Indonesia & Inggris', () => {
  assert.equal(parseDate('13 September 2026').display, '13 September 2026');
  assert.equal(parseDate('1 Januari 2026').iso, '2026-01-01');
  assert.equal(parseDate('7 agustus 2025').display, '7 Agustus 2025');
  assert.equal(parseDate('5 December 2024').iso, '2024-12-05');
  assert.equal(parseDate('2026-09-13').iso, '2026-09-13');
  assert.equal(parseDate('ngawur', '2026-09-13T00:00:00Z').iso, '2026-09-13');
  assert.equal(parseDate('ngawur'), null);
});

test('username ber-spasi tidak dipecah', () => {
  const t = parseMessage({ embeds: [{ fields: [{ name: 'Customer', value: '@IC MATEO_DEGUERRA' }] }] });
  assert.equal(t.username, '@IC MATEO_DEGUERRA');
  assert.equal(t.name, 'IC MATEO_DEGUERRA');
});

test('format username Discord modern & legacy', () => {
  const modern = parseMessage({ embeds: [{ fields: [{ name: 'Customer', value: '@budi.santoso' }] }] });
  assert.equal(modern.name, 'budi.santoso');
  const legacy = parseMessage({ embeds: [{ fields: [{ name: 'Customer', value: '@Budi#1234' }] }] });
  assert.equal(legacy.name, 'Budi');
  assert.equal(legacy.username, '@Budi#1234');
});

test('pesan tanpa embed / bukan testimoni ditolak', () => {
  assert.equal(parseMessage({ id: '1', embeds: [] }), null);
  assert.equal(parseMessage({ id: '1' }), null);
  assert.equal(parseMessage({ id: '1', embeds: [{ description: 'halo semua' }] }), null);
});

test('field tanpa nama tidak crash', () => {
  const t = parseMessage({ id: '1', timestamp: '2026-01-01T00:00:00Z', embeds: [{ fields: [{ value: 'x' }, null, { name: 'Komentar', value: 'bagus' }] }] });
  assert.equal(t.text, 'bagus');
  assert.equal(t.name, null);
});

test('urutan terbaru dulu + dedupe', () => {
  const mk = (id, tanggal) => ({ id, embeds: [{ fields: [{ name: 'Customer', value: `@${id}` }, { name: 'Komentar', value: 'ok' }, { name: 'Tanggal', value: tanggal }] }] });
  const list = [parseMessage(mk('a', '1 Januari 2026')), parseMessage(mk('b', '13 September 2026')), parseMessage(mk('c', '5 Maret 2026'))];
  assert.deepEqual(sortTestimonials(list).map((t) => t.id), ['b', 'c', 'a']);
  const dup = dedupe([list[0], list[0], list[1]]);
  assert.equal(dup.length, 2);
});

test('field alias Indonesia & Inggris', () => {
  const t = parseMessage({ embeds: [{ fields: [
    { name: 'Pembeli', value: '@Budi' },
    { name: 'Bintang', value: '4' },
    { name: 'Layanan', value: 'Custom DC' },
    { name: 'Harga', value: 'Rp19.500' },
    { name: 'Komentar', value: 'Mantap' },
    { name: 'Tanggal', value: '13 September 2026' },
  ] }] });
  assert.equal(t.name, 'Budi');
  assert.equal(t.rating, 4);
  assert.equal(t.product, 'Custom DC');
});
