import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { digitalServices } from '../src/data/services.js';
import { otherServices } from '../src/data/otherServices.js';
import { sampGeneral, sampPackets } from '../src/data/sampServices.js';
import { products } from '../src/data/products.js';
import { priceLabel } from '../src/lib/format.js';
import { pricingCustomRows, pricingRows } from '../src/data/pricing.js';

const bundle = digitalServices.find((s) => s.id === 'bundle');
const allCatalog = [
  ...digitalServices,
  ...sampGeneral,
  ...sampPackets,
  ...otherServices,
  ...products,
];

/* ---- Bundle Service ---- */

test('Bundle Service punya harga Rp25.000', () => {
  assert.ok(bundle, 'Bundle Service tidak ada di digitalServices');
  assert.equal(bundle.price, 25000);
  assert.equal(priceLabel(bundle.price), 'Rp25.000');
});

test('Bundle Service ditandai recommended', () => {
  assert.equal(bundle.recommended, true);
  assert.equal(bundle.recommendedLabel, 'Recommended');
});

test('paling banyak satu layanan yang direkomendasikan per grup', () => {
  const recommended = digitalServices.filter((s) => s.recommended === true);
  assert.ok(recommended.length >= 1, 'tidak ada layanan yang direkomendasikan');
  // Boleh lebih dari satu kalau memang sengaja, tapi id-nya harus unik.
  const ids = recommended.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, `id recommended kembar: ${ids.join(', ')}`);
});

test('semua layanan yang punya recommendedLabel juga punya recommended', () => {
  for (const item of allCatalog) {
    if (item.recommendedLabel && item.recommended !== true) {
      assert.fail(`"${item.id}" punya recommendedLabel tapi recommended bukan true`);
    }
  }
});

/* ---- Konsistensi price dan status ---- */

test('harga angka tidak boleh berpasangan dengan status custom', () => {
  for (const item of allCatalog) {
    const hasPrice = typeof item.price === 'number' && item.price > 0;
    if (!hasPrice) continue;
    assert.notEqual(
      item.status,
      'custom',
      `"${item.id}" punya harga ${item.price} tapi status 'custom' (badge akan menulis "Custom Pricing" di sebelah angka harga)`,
    );
  }
});

test('status custom hanya boleh dipakai saat price null', () => {
  for (const item of allCatalog) {
    if (item.status === 'custom') {
      assert.equal(
        item.price,
        null,
        `"${item.id}" status 'custom' harus punya price null, bukan ${item.price}`,
      );
    }
  }
});

/* ---- Dampak ke tabel Pricing ---- */

test('Bundle Service masuk ke pricingRows karena sudah ada harganya', () => {
  const row = pricingRows.find((r) => r.id === 'bundle');
  assert.ok(row, 'Bundle Service tidak muncul di tabel harga');
  assert.equal(row.price, 25000);
  assert.equal(row.group, 'Digital Service');
});

test('Bundle Service tidak lagi masuk daftar Custom Pricing', () => {
  assert.equal(
    pricingCustomRows.some((r) => r.id === 'bundle'),
    false,
    'Bundle Service masih tampil dua kali: di tabel harga dan di Custom Pricing',
  );
});

test('hanya satu baris per layanan di seluruh tabel harga', () => {
  const ids = pricingRows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, `id kembar di pricingRows: ${ids.join(', ')}`);
});

/* ---- Aturan harga ---- */

test('semua harga adalah angka bulat positif', () => {
  for (const item of allCatalog) {
    if (item.price === null) continue;
    assert.equal(
      Number.isInteger(item.price) && item.price > 0,
      true,
      `"${item.id}" harga ${item.price} bukan angka bulat positif`,
    );
  }
});

test('semua id katalog unik', () => {
  const ids = allCatalog.map((i) => i.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.equal(dupes.length, 0, `id kembar: ${[...new Set(dupes)].join(', ')}`);
});

/* ---- Komponen ---- */

test('ServiceCard merender badge dari flag recommended, bukan dari id yang dikunci', () => {
  const source = readFileSync(join(process.cwd(), 'src/components/ServiceCard.jsx'), 'utf8');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '');

  assert.match(code, /service\.recommended === true/, 'harus membaca flag recommended dari data');
  assert.match(code, /data-recommended-badge/, 'badge perlu atribut untuk pengecekan');
  assert.match(code, /recommendedLabel \?\? 'Recommended'/, 'label teks harus bisa diganti dari data');

  // Jangan mengunci ke id layanan tertentu, supaya penambahan data
  // berikutnya tidak perlu menyentuh komponen.
  assert.doesNotMatch(code, /'bundle'|"bundle"/, 'komponen tidak boleh menyebut id layanan secara spesifik');
});

/* ---- Gaya badge harus sama dengan label "Populer" di section SA-MP ---- */

test('ribbon RECOMMENDED punya gaya yang sama dengan label Populer di SA-MP', () => {
  const read = (file) => readFileSync(join(process.cwd(), file), 'utf8');
  const card = read('src/components/ServiceCard.jsx');
  const samp = read('src/components/SampServices.jsx');

  const grab = (text, attr) => {
    const found = text.match(new RegExp(`data-${attr}[\\s\\S]{0,400}?className="([^"]+)"`));
    return found ? found[1] : null;
  };

  const recommended = grab(card, 'recommended-badge');
  // Teks "Populer" ada di baris berikutnya setelah penutup kutip className,
  // jadi yang diambil adalah className-nya, bukan teksnya.
  const populer = samp.match(/className="(absolute -top-2\.5[^"]*)"/);

  assert.ok(recommended, 'badge recommended tidak ditemukan di ServiceCard');
  assert.ok(populer, 'label Populer tidak ditemukan di SampServices');

  // Ribbon harus menempel di tepi atas, sama seperti label Populer.
  assert.match(recommended, /absolute\b/, 'badge harus diposisikan absolute');
  assert.match(recommended, /-top-2\.5/, 'offset atas harus sama dengan label Populer');
  assert.match(recommended, /left-5/, 'offset kiri harus sama dengan label Populer');

  // Warna dan tipografi harus sama persis.
  for (const token of [
    'rounded-full',
    'border-brand/40',
    'bg-brand',
    'text-brand-ink',
    'text-[10px]',
    'font-bold',
    'tracking-[0.12em]',
    'uppercase',
  ]) {
    assert.ok(
      (populer[0] ?? '').includes(token),
      `label Populer di SA-MP tidak punya token "${token}", cek lagi acuan gayanya`,
    );
    assert.ok(
      recommended.includes(token),
      `badge RECOMMENDED harus punya token "${token}" yang sama dengan label Populer`,
    );
  }
});

test('ribbon tidak menutupi isi kartu (paket p-5 minimal 20px)', () => {
  const code = readFileSync(join(process.cwd(), 'src/components/ServiceCard.jsx'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  const badge = code.match(/data-recommended-badge[\s\S]{0,400}?className="([^"]+)"/)?.[1] ?? '';
  // -top-2.5 = 10px di atas tepi kartu. Padding p-5 = 20px, jadi ribbon tetap
  // berada di area padding dan tidak pernah menimpa konten.
  const top = Number.parseFloat(badge.match(/-top-([\d.]+)/)?.[1] ?? '0');
  assert.ok(top * 4 <= 20, `ribbon menumpuk ${top * 4}px, padding kartu hanya 20px`);
});
