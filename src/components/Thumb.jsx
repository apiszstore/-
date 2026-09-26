import Icon from './Icons';

/**
 * Thumbnail placeholder.
 * Kalau `src` diisi, gambar asli yang dipakai.
 * Kalau kosong, tampilkan visual gradient + ikon dari `icon`.
 * Gradient-nya sengaja low-saturation (abu graphite, bronze, slate) supaya
 * terbaca seperti sampel material, bukan color swatch, dan tidak berada di
 * keluarga warna aksen amber.
 */

const PALETTES = [
  ['#2b2724', '#4c4239'],
  ['#26282b', '#41464c'],
  ['#332a1d', '#5e4626'],
  ['#2f2a26', '#584a3a'],
  ['#1f2225', '#3b4147'],
  ['#3a2e1b', '#6d4b1b'],
];

function hashCode(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Thumb({ src, alt = '', icon = 'spark', seed = '', label = '', className = '' }) {
  if (src) {
    return (
      <div className={`thumb ${className}`}>
        <img className="thumb__img" src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    );
  }

  const [from, to] = PALETTES[hashCode(seed || label || icon) % PALETTES.length];
  const style = {
    backgroundImage: `linear-gradient(140deg, ${from} 0%, ${to} 100%)`,
  };

  return (
    <div className={`thumb thumb--placeholder ${className}`} style={style} aria-hidden="true">
      <span className="thumb__grid" />
      <span className="thumb__icon">
        <Icon name={icon} size={30} />
      </span>
      {label ? <span className="thumb__label">{label}</span> : null}
    </div>
  );
}
