import { useState } from 'react';
import { siteConfig } from '../config/site.js';

/**
 * Logo: gambar (kalau ada) + wordmark "APISZ STORE".
 *
 * Sumber gambar diambil dari `siteConfig.brand.logo`. Kalau file-nya
 * belum ada atau gagal dimuat, komponen ini otomatis kembali ke
 * wordmark teks supaya tidak pernah tampil bolong.
 *
 * `showName: false` di config akan menyembunyikan teksnya, jadi logo
 * berdiri sendiri. Dalam kasus itu gambar memakai alt yang bisa dibaca
 * screen reader.
 */

const SIZES = {
  sm: { text: 'text-[15px]', img: 26 },
  md: { text: 'text-lg', img: 30 },
  lg: { text: 'text-2xl', img: 40 },
};

export default function Logo({ size = 'md', className = '' }) {
  const { logo, logoAlt, showName = true } = siteConfig.brand;
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
             supaya screen reader tidak membacanya dua kali. */
          alt={withText ? '' : logoAlt}
          width={preset.img}
          height={preset.img}
          onError={() => setFailed(true)}
          className="shrink-0 object-contain"
          style={{ width: preset.img, height: preset.img }}
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
