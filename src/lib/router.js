/**
 * Router sederhana berbasis URL hash.
 * Format URL:
 *   #/            -> Home
 *   #/products    -> Halaman Store
 *   #/product/id  -> Detail produk
 *   #/services    -> Home + scroll ke section services
 * Tidak perlu library tambahan, ringan, dan jalan di hosting statis.
 */

export function normalizePath(to) {
  let path = String(to || '/');
  if (path.startsWith('#')) path = path.slice(1);
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path;
}

export function currentPath() {
  return normalizePath(window.location.hash || '/');
}

export function buildHash(path) {
  return `#${normalizePath(path)}`;
}
