import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  GAP,
  advance,
  cardWidthFor,
  countForWidth,
  setWidthFor,
  shouldScroll,
} from '../src/lib/carousel.js';

/* ---- Kapan carousel harus bergerak ---- */

test('tidak bergeser kalau kartu 3 atau kurang', () => {
  for (const n of [0, 1, 2, 3]) {
    assert.equal(shouldScroll(n), false, `${n} kartu seharusnya diam`);
  }
});

test('bergerak kalau kartu lebih dari 3', () => {
  for (const n of [4, 5, 12, 40]) {
    assert.equal(shouldScroll(n), true, `${n} kartu seharusnya bergeser`);
  }
});

/* ---- Jumlah kartu per lebar layar ---- */

test('satu kartu di layar kecil, tiga di layar besar', () => {
  assert.equal(countForWidth(320), 1);
  assert.equal(countForWidth(639), 1);
  assert.equal(countForWidth(640), 2);
  assert.equal(countForWidth(1023), 2);
  assert.equal(countForWidth(1024), 3);
  assert.equal(countForWidth(1920), 3);
});

test('jumlah kartu tidak pernah di bawah 1 walau lebarnya aneh', () => {
  for (const w of [0, -100, 1, 10]) {
    assert.ok(countForWidth(w) >= 1, `lebar ${w} menghasilkan ${countForWidth(w)}`);
  }
});

/* ---- Lebar kartu dan panjang satu set ---- */

test('tiga kartu muat persis di lebar container tanpa meluber', () => {
  const width = 1200;
  const card = cardWidthFor(width, 3);
  const total = 3 * card + 2 * GAP;
  assert.equal(Math.round(total), width, '3x kartu + 2x jarak harus sama dengan lebar');
});

test('satu kartu memenuhi seluruh lebar di layar kecil', () => {
  const width = 360;
  assert.equal(cardWidthFor(width, 1), width);
});

test('dua kartu muat persis di tablet', () => {
  const width = 800;
  const total = 2 * cardWidthFor(width, 2) + GAP;
  assert.equal(Math.round(total), width);
});

test('lebar 0 menghasilkan 0, bukan NaN', () => {
  assert.equal(cardWidthFor(0, 3), 0);
  assert.equal(cardWidthFor(-50, 3), 0);
  assert.equal(cardWidthFor(1200, 0), 0);
});

test('panjang satu set termasuk jarak setelah kartu terakhir', () => {
  const card = cardWidthFor(1200, 3);
  assert.equal(setWidthFor(4, card), 4 * (card + GAP));
  assert.equal(setWidthFor(0, card), 0);
});

/* ---- Logika balik ke awal ( seamless loop ) ---- */

test('offset bertambah normal selama belum melewati satu set', () => {
  const oneSet = 1000;
  assert.equal(advance(0, 16, oneSet), 16);
  assert.equal(advance(500, 16, oneSet), 516);
  assert.equal(advance(900, 16, oneSet), 916);
});

test('offset balik ke awal saat melewati batas, bukan melonjak', () => {
  const oneSet = 1000;
  // 995 + 16 = 1011, jadi dikurangi satu set -> 11
  assert.equal(advance(995, 16, oneSet), 11);
});

test('sisa setelah balik selalu di dalam satu set', () => {
  const oneSet = 800;
  let offset = 0;
  for (let i = 0; i < 20_000; i += 1) {
    offset = advance(offset, 0.48, oneSet);
    assert.ok(offset >= 0 && offset < oneSet, `offset ${offset} di luar rentang pada frame ${i}`);
  }
});

test('lompatan besar akibat tab tidak aktif tidak membuat posisi melompat jauh', () => {
  const oneSet = 1000;
  // Satu frame 5 detik = 150px pada 30px/detik, harus kembali ke dalam satu set.
  const next = advance(100, 150, oneSet);
  assert.ok(next >= 0 && next < oneSet);
});

test('satu set 0 tidak membagi dengan nol', () => {
  assert.equal(advance(50, 10, 0), 0);
  assert.equal(Number.isFinite(advance(0, 10, 0)), true);
});

/* ---- Kecepatan ---- */

test('kecepatan 30px per detik berarti maju ~0.5px per frame 60fps', () => {
  const perFrame = (30 * 1000) / 60 / 1000;
  assert.ok(Math.abs(perFrame - 0.5) < 0.01, `per frame ${perFrame}`);
});
