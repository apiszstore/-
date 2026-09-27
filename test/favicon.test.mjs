import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const FAVICON_SVG = join(process.cwd(), 'public/favicon.svg');
const source = readFileSync(FAVICON_SVG, 'utf8');

/**
 * Pagar terhadap file favicon yang tertimpa hasil vektorisasi.
 *
 * Pernah ada tool VTracer menulis ulang favicon.svg jadi hasil tracing dari
 * PNG 48x48: file balloon jadi 10 KB, warna #87653D (cokelat) yang bukan warna
 * brand, dan garis-<path> yang panjangnya ribuan karakter. Semuanya lolos
 * tanpapek proportionally karena secara teknis "SVG yang valid".
 *
 * Jadi yang dijaga di sini bukan cuma validitas, tapi ciri-ciri file yang
 * memang kita tulis sendiri.
 */

/* Batas 2 KB. Hasil trace dari PNG 48x48 saja sudah 10 KB. */
test('favicon.svg bukan hasil tracing (di bawah 2 KB)', () => {
  assert.ok(
    Buffer.byteLength(source) < 2048,
    `favicon.svg ${Buffer.byteLength(source)} byte, terlalu besar untuk file yang ditulis manual`,
  );
});

test('favicon.svg bukan hasil generator vektorisasi', () => {
  for (const marker of ['VTracer', 'Potrace', 'Inkscape', 'Adobe Illustrator', 'Generator:']) {
    assert.doesNotMatch(source, new RegExp(marker, 'i'), `favicon.svg mengandung tanda "${marker}"`);
  }
});

test('favicon.svg punya viewBox supaya skalabel', () => {
  assert.match(source, /viewBox="0 0 64 64"/, 'viewBox 0 0 64 64 hilang');
  assert.match(source, /width="512" height="512"/, 'ukuran intrinsik harus 512 supaya tajam di DPI tinggi');
});

test('favicon.svg memakai warna brand, bukan warna acak', () => {
  assert.match(source, /#2B2D31/i, 'warna latar brand #2B2D31 hilang');
  assert.match(source, /#FF8A00/i, 'warna aksen brand #FF8A00 hilang');
});

test('favicon.svg tetap ringkas jumlah node', () => {
  const paths = (source.match(/<(path|rect|circle|polygon)\b/g) ?? []).length;
  assert.ok(paths <= 12, `ada ${paths} node, terlalu banyak untuk logo sederhana`);
});

test('favicon.svg punya title untuk aksesibilitas', () => {
  assert.match(source, /<title>[^<]+<\/title>/, 'title untuk screen reader hilang');
});
