/**
 * guarding link & format harga.
 * Nilai placeholder tidak akan dianggap sebagai link asli,
 * sehingga website tidak pernah mengarah ke URL palsu.
 */

const PLACEHOLDER_PATTERN = /^(your_|coming soon|todo|change_?me|isi_?dengan|belum tersedia)/i;

/** True kalau nilai masih placeholder / kosong. */
export function isPlaceholder(value) {
  if (!value) return true;
  return PLACEHOLDER_PATTERN.test(String(value).trim());
}

/** Ubah link WA menjadi format wa.me */
export function toWhatsAppLink(link) {
  if (isPlaceholder(link)) return '';
  if (String(link).startsWith('http')) return link;
  const digits = String(link).replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

/** Format angka jadi format Rupiah: 10000 -> Rp10.000 */
export function formatRupiah(value) {
  if (value === null || value === undefined) return '';
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
}
