import Icon from './Icon.jsx';

/**
 * Satu kartu showcase.
 *
 * ============================================================
 *  KARTU INI BISA DIKLIK
 * ============================================================
 *  Card-nya `<button>`, bukan `<div>` yang menempelkan `onClick`, supaya:
 *   - bisa reached pakai Tab dan diaktifkan pakai Enter/Space,
 *   - punya role dan nama yang benar untuk screen reader,
 *   - focus ring-nya otomatis dari browser.
 *
 *  Yang diklik adalah GAMBARNYA (permintaan user), dan label tombolnya
 *  menjelaskan aksinya: "Lihat ... ukuran penuh".
 *
 *  Placeholder (produk tanpa gambar) TIDAK diklik jadi apa-apa, karena tidak
 *  ada gambar untuk ditampilkan. Tombolnya tidak dirender, jadi tidak ada
 *  target yang seemingly bisa diklik tapi tidak melakukan apa pun.
 *
 *  Thumbnail tetap `object-cover` supaya grid tetap rapat. Pemotongan yang
 *  tidak diinginkan ditangani di `ShowcaseLightbox` yang memakai
 *  `object-contain`.
 */
export default function ShowcaseCard({ item, onOpen }) {
  const Wrapper = item.image ? 'button' : 'div';

  return (
    <Wrapper
      {...(item.image
        ? { type: 'button', onClick: () => onOpen?.(item), 'aria-label': `Lihat ${item.title} ukuran penuh` }
        : {})}
      className={`group relative block w-full overflow-hidden rounded-md border border-line bg-surface transition-[border-color] duration-200 ${
        item.image
          ? 'cursor-zoom-in hover:border-brand/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
          : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center bg-well"
            role="img"
            aria-label={`Screenshot belum tersedia untuk ${item.title}`}
          >
            <span className="flex flex-col items-center gap-2 px-3 text-center">
              <Icon name="map" size={20} className="text-brand/55" />
              <span className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
                {item.category}
              </span>
            </span>
          </div>
        )}

        {/* Overlay hover: judul, kategori, dan petunjuk bahwa bisa diklik. */}
        <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {/* `span`, bukan `figcaption`: `figcaption` hanya sah jadi anak
              langsung dari `figure`, sedangkan di sini induknya `button`. */}
          <span className="text-[13px] font-semibold text-ink">{item.title}</span>
          <span className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-brand">{item.category}</span>
            {item.image ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink/85">
                <Icon name="expand" size={12} />
                Lihat penuh
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
