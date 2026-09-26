/**
 * Tabel harga.
 *
 * Hanya layanan yang punya harga resmi yang dimunculkan di sini.
 * Layanan tanpa harga TIDAK dikembalikan sebagai angka — frontend
 * otomatis menulis "Custom Pricing" untuk yang `price: null`.
 *
 * Cara update: cukup ubah `price` di src/data/services.js dan
 * src/data/sampServices.js. Tabel ini ikut berubah otomatis.
 */

import { digitalServices } from './services.js';
import { sampGeneral, sampPackets } from './sampServices.js';
import { otherServices } from './otherServices.js';

const priced = [
  ...digitalServices.map((item) => ({ ...item, group: 'Digital Service' })),
  ...sampPackets.map((item) => ({ ...item, name: `Paket On Server ${item.name}`, group: 'SA-MP' })),
];

/** Baris yang punya harga, diurutkan termurah -> termahal. */
export const pricingRows = priced
  .filter((item) => typeof item.price === 'number' && item.price > 0)
  .sort((a, b) => a.price - b.price)
  .map(({ id, name, price, group }) => ({ id, name, price, group }));

/** Layanan tanpa harga resmi → tampil "Custom Pricing". */
export const pricingCustomRows = [
  ...digitalServices.filter((item) => typeof item.price !== 'number'),
  ...sampGeneral.filter((item) => typeof item.price !== 'number'),
  ...otherServices.filter((item) => typeof item.price !== 'number'),
].map(({ id, name, group }) => ({ id, name, group: group ?? 'Other Services' }));

/** Label untuk layanan tanpa harga. */
export const CUSTOM_PRICING_LABEL = 'Custom Pricing';
