/**
 * Logika murni carousel testimoni.
 *
 * Dipisah dari komponen supaya bisa diuji tanpa DOM. Tidak ada import React
 * di sini, dan tidak ada yang menyentuh document atau window.
 */

export const GAP = 20;
export const SPEED_PX_PER_SEC = 30;

/**
 * Berapa kartu yang muat di satu layar.
 *
 * Breakpoint-nya sengaja sama dengan yang dipakai class `sm:` (640) dan `lg:`
 * (1024) di Tailwind, supaya titik hitungnya tidak berbeda dengan grid yang
 * dipakai kalau kartu kurang dari 4.
 */
export function countForWidth(width) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

/**
 * Lebar satu kartu untukdapet jumlah kartu di atas.
 *
 * Jarak antar kartu dipotong satu kali saja karena yang terakhir tidak butuh
 * ruang di sisi kanan.
 */
export function cardWidthFor(containerWidth, perView) {
  if (containerWidth <= 0 || perView <= 0) return 0;
  return (containerWidth - GAP * (perView - 1)) / perView;
}

/** Panjang satu set kartu, termasuk jarak setelah kartu terakhir. */
export function setWidthFor(count, cardWidth) {
  if (count <= 0 || cardWidth <= 0) return 0;
  return count * (cardWidth + GAP);
}

/**
 * Majukan offset dan balik ke awal begitu melewati satu set.
 *
 * Karena daftar kartu digandakan dua kali, setiap kelipatan panjang satu set
 * menghasilkan gambar yang identik. Jadi pengurangan di bawah tidak terlihat,
 * tapi membuat posisi tidak pernah tumbuh tanpa batas.
 */
export function advance(offset, deltaPx, oneSet) {
  if (oneSet <= 0) return 0;
  let next = offset + deltaPx;
  if (next >= oneSet) next -= oneSet;
  return next;
}

/** Carousel hanya perlu bergerak kalau kartunya lebih dari 3. */
export function shouldScroll(count) {
  return count > 3;
}
