import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { paymentMethods } from '../src/data/payment.js';

const PUBLIC_DIR = join(process.cwd(), 'public');

/** Batas sesuai rules R4 dan R6. */
const MAX_SIDE = 400;
const IDEAL_SIDE = 200;
const MAX_BYTES = 30 * 1024;

/** Ambil dimensi PNG dari header IHDR (width di offset 16, height di 20). */
function pngSize(file) {
  const buf = readFileSync(file);
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!isPng) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Ambil dimensi dari SVG lewat width/height, lalu viewBox sebagai cadangan. */
function svgSize(file) {
  const text = readFileSync(file, 'utf8');
  const attr = (name) => {
    const found = text.match(new RegExp(`<svg[^>]*\\s${name}\\s*=\\s*"([^"]+)"`, 'i'));
    return found ? found[1] : null;
  };
  const toNumber = (value) => {
    if (!value) return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const width = toNumber(attr('width'));
  const height = toNumber(attr('height'));
  if (width && height) return { width, height };

  const viewBox = attr('viewBox');
  if (!viewBox) return null;
  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  return { width: parts[2], height: parts[3] };
}

function sizeOf(file) {
  const extension = file.toLowerCase();
  if (extension.endsWith('.svg')) return svgSize(file);
  if (extension.endsWith('.webp')) return webpSize(file);
  if (extension.endsWith('.png')) return pngSize(file);
  return null;
}

/**
 * Ambil dimensi WebP dari header RIFF. Formatnya punya beberapa varian
 * chunk, jadi semuanya harus ditangani: VP8X (extended, bisaanimated),
 * VP8 (lossy), dan VP8L (lossless).
 */
function webpSize(file) {
  const buf = readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;

  let offset = 12;
  while (offset + 8 <= buf.length) {
    const fourcc = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const data = offset + 8;

    if (fourcc === 'VP8X') {
      return {
        width: 1 + (buf[data + 4] | (buf[data + 5] << 8) | (buf[data + 6] << 16)),
        height: 1 + (buf[data + 7] | (buf[data + 8] << 8) | (buf[data + 9] << 16)),
      };
    }
    if (fourcc === 'VP8 ' && buf[data + 3] === 0x9d && buf[data + 4] === 0x01 && buf[data + 5] === 0x2a) {
      return { width: buf.readUInt16LE(data + 6) & 0x3fff, height: buf.readUInt16LE(data + 8) & 0x3fff };
    }
    if (fourcc === 'VP8L') {
      const bits = buf.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }

    offset = data + size + (size % 2);
  }
  return null;
}

/** Signature magic per format, untuk memastikan ekstensi tidak berbohong. */
function magicOf(file) {
  const buf = readFileSync(file);
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (/<svg[\s>]/i.test(buf.toString('utf8', 0, 400))) return 'svg';
  return 'tidak dikenal';
}

const toDiskPath = (logo) => join(PUBLIC_DIR, logo.replace(/^\//, ''));
const fileNameOf = (logo) => logo.split('/').pop();
const stemOf = (logo) => fileNameOf(logo).replace(/\.[^.]+$/, '');

/* ---- R2 dan R10: nama file dan id ---- */

test('R2  nama file logo sama persis dengan id method', () => {
  for (const method of paymentMethods) {
    assert.equal(
      stemOf(method.logo),
      method.id,
      `"${method.id}" menunjuk file "${fileNameOf(method.logo)}", harusnya "${method.id}" plus ekstensi yang sah`,
    );
  }
});

test('R2  nama file hanya huruf kecil tanpa spasi', () => {
  for (const method of paymentMethods) {
    const name = fileNameOf(method.logo);
    assert.match(
      name,
      /^[a-z0-9][a-z0-9-]*\.(png|webp|svg)$/,
      `nama file "${name}" tidak sesuai pola`,
    );
  }
});

test('R10 id tiap method unik', () => {
  const ids = paymentMethods.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, `ada id kembar: ${ids.join(', ')}`);
});

/* ---- R1: lokasi file ---- */

test('R1  semua logo berada di folder public/payment', () => {
  for (const method of paymentMethods) {
    assert.match(
      method.logo,
      /^\/payment\/[a-z0-9-]+\.(png|webp|svg)$/,
      `"${method.logo}" di luar folder payment`,
    );
  }
});

/* ---- R9: panjang nama ---- */

test('R9  nama method maksimal 24 karakter', () => {
  for (const method of paymentMethods) {
    assert.ok(method.name.length <= 24, `"${method.name}" panjangnya ${method.name.length} karakter`);
    assert.ok(method.fallback?.length > 0, `"${method.id}" belum punya teks cadangan`);
  }
});

/* ---- R3, R4, R5, R6: aset yang benar-benar ada ---- */

test('R3 R4 R5 R6  logo yang ada di public/payment/ ikut semua rules', () => {
  const missing = [];
  const present = [];

  for (const method of paymentMethods) {
    const file = toDiskPath(method.logo);
    if (!existsSync(file)) {
      missing.push(fileNameOf(method.logo));
      continue;
    }
    present.push(method.id);

    const extension = fileNameOf(method.logo).toLowerCase();
    assert.ok(
      extension.endsWith('.png') || extension.endsWith('.webp') || extension.endsWith('.svg'),
      `${fileNameOf(method.logo)} bukan png/webp/svg`,
    );
    assert.ok(!extension.endsWith('.jpg') && !extension.endsWith('.jpeg'), 'R5: jangan pakai JPG, latarnya akan terlihat kotak');

    // Ekstensi harus jujur dengan isi filenya. Kalau ada file PNG yang
    // disimpan sebagai .webp, browser tetap menampilkannya, tapi test
    // dimensi akan salah membaca header dan menolocalkan file ini dengan
    // bahasa yang salah.
    const expected = extension.split('.').pop();
    assert.equal(
      magicOf(file),
      expected,
      `R5: ${fileNameOf(method.logo)} ekstensinya .${expected} tapi isi filenya bukan ${expected}`,
    );

    const size = sizeOf(file);
    assert.ok(size, `dimensi ${fileNameOf(method.logo)} tidak bisa dibaca`);

    // R3: harus persegi
    assert.equal(
      size.width,
      size.height,
      `R3: ${fileNameOf(method.logo)} bukan 1:1 (${size.width}x${size.height}), akan terlihat kecil di kotak 56px`,
    );

    // R4: tidak boleh lebih besar dari 400, dan 200 yang ideal
    assert.ok(size.width <= MAX_SIDE, `R4: ${fileNameOf(method.logo)} ${size.width}px, maksimal ${MAX_SIDE}px`);
    assert.ok(size.width >= 48, `R4: ${fileNameOf(method.logo)} terlalu kecil, minimal 48px`);

    // R6: berat file
    const bytes = statSync(file).size;
    assert.ok(
      bytes <= MAX_BYTES,
      `R6: ${fileNameOf(method.logo)} ${(bytes / 1024).toFixed(1)} KB, maksimal 30 KB`,
    );
  }

  // Logo yang belum ada tidak menggagalkan build: frontend jatuh ke teks nama.
  // Yang penting info ini terlihat, jadi dicatat sebagai diagnostic.
  if (missing.length > 0) {
    console.log(`\n  [info] logo belum ada (frontend pakai teks nama sebagai cadangan):`);
    for (const name of missing) console.log(`         - public/payment/${name}`);
  }
  if (present.length > 0) {
    console.log(`\n  [info] logo aktif dan lolos semua rules: ${present.join(', ')}`);
  }
  console.log('');
});

test('R4 ukuran ideal 200px (informasi, bukan error)', () => {
  for (const method of paymentMethods) {
    const file = toDiskPath(method.logo);
    if (!existsSync(file)) continue;
    const size = sizeOf(file);
    if (size && size.width !== IDEAL_SIDE) {
      console.log(`  [info] ${fileNameOf(method.logo)} ${size.width}px, idealnya ${IDEAL_SIDE}px`);
    }
  }
});

/* ---- R8: layout aman untuk jumlah method berapa pun ---- */

test('R8  layout Payment memakai auto-fit, bukan jumlah kolom yang dikunci', async () => {
  const { readFileSync: read } = await import('node:fs');
  const raw = read(join(process.cwd(), 'src/components/Payment.jsx'), 'utf8');

  // Komentar dibuang dulu. Tanpa ini, penyebutan class yang sengaja dilarang
  // di dalam komentar akan ikut terbaca dan membuat tes ini salah gagal.
  const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  assert.match(code, /grid-template-columns:repeat\(auto-fit,minmax\(/, 'grid harus auto-fit');
  assert.doesNotMatch(
    code,
    /sm:grid-cols-3/,
    'sm:grid-cols-3 mengunci jumlah kolom, akan meluber saat method bertambah',
  );
  // Setiap kolom minimal 136px supaya di layar 320px tidak scroll horizontal.
  const match = code.match(/minmax\((\d+(?:\.\d+)?)rem/);
  assert.ok(match, 'harus ada batas min dalam rem');
  assert.ok(Number(match[1]) >= 8, `kolom terlalu sempit: ${match[1]}rem`);

  // Kartu harus punya min-w-0 supaya nama panjang tidak jadi overflow.
  assert.match(code, /data-payment=\{id\}[\s\S]{0,220}?min-w-0/, 'kartu payment butuh min-w-0');
  assert.match(code, /break-words/, 'nama method butuh break-words');
});
