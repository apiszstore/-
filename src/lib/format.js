/** Format angka ke Rupiah: 10000 -> "Rp10.000" */
export function formatPrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `Rp${value.toLocaleString('id-ID')}`;
}

/** Label harga atau "Custom Pricing" kalau belum ada harga. */
export function priceLabel(value, customLabel = 'Custom Pricing') {
  return formatPrice(value) ?? customLabel;
}

/** Inisial untuk avatar: "Budi Santoso" -> "BS" */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format tanggal YYYY-MM-DD -> "15 Januari 2026".
 *
 * Sengaja memecah string secara manual (bukan `new Date('2026-01-15')`)
 * supaya tidak bergeser sehari akibat konversi ke UTC.
 * Balikin null kalau formatnya tidak dikenali supaya komponen
 * bisa menyembunyikan baris tanggalnya.
 */
export function formatDate(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${day} ${MONTHS_ID[month - 1]} ${year}`;
}
