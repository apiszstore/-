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
