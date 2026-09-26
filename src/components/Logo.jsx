import { useState } from 'react';
import { siteConfig } from '../config/site.js';

/**
 * Logo store.
 *
 * Sumber gambar: `siteConfig.brand.logo`.
 * - `showName: false` → logo berdiri sendiri, teks "APISZ STORE" disembunyikan.
 * - `showName: true`  → teks tetap tampil di sebelah logo.
 * - File belum ada / gagal dimuat → otomatis balik ke wordmark teks,
 *   supaya tidak pernah tampil bolong.
 *
 * Logo 223x100 itu rasio lebar (2.23:1), jadi pensizean memakai TINGGI
 * dengan `width: auto`. Kalau dipaksakan kotak, logo jadi kecil dengan
 * ruang kosong di atas dan bawah.
 *
 * Atribut width/height intrinsic dipakai browser untuk menyisakan ruang
 * dengan rasio yang benar SEBELUM gambar selesai dimuat — tanpa itu
 * navbar akan melompat (layout shift) begitu logo muncul.
 */

/* Tinggi logo dalam px. Navbar dibatasi button min-h-10 (40px) dengan
   py-1, jadi tinggi img harus <= 32px agar target sentuh tetap >= 40px. */
const SIZES = {
  sm: { text: 'text-[15px]', imgHeight: 30 },
  md: { text: 'text-lg', imgHeight: 34 },
  lg: { text: 'text-2xl', imgHeight: 46 },
};

export default function Logo({ size = 'md', className = '' }) {
  const { logo, logoAlt, showName = true, logoWidth, logoHeight } = siteConfig.brand;
  const [failed, setFailed] = useState(false);

  const preset = SIZES[size] ?? SIZES.md;
  const useImage = Boolean(logo) && !failed;
  const withText = useImage ? showName : true;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {useImage ? (
        <img
          src={logo}
          /* Kalau teks nama ikut ditampilkan, gambar cukup dekoratif
             supaya screen reader tidak membacanya dua kali. Kalau teksnya
             disembunyikan (showName: false), alt dipakai sebagai nama. */
          alt={withText ? '' : logoAlt}
          width={logoWidth || undefined}
          height={logoHeight || undefined}
          onError={() => setFailed(true)}
          className="shrink-0 object-contain"
          style={{ height: preset.imgHeight, width: 'auto' }}
        />
      ) : null}

      {withText ? (
        <span className={`font-display font-bold tracking-tight ${preset.text}`}>
          <span className="text-ink">{siteConfig.shortName}</span>
          <span className="text-brand">{siteConfig.name.replace(siteConfig.shortName, '')}</span>
        </span>
      ) : null}
    </span>
  );
}
