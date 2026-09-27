import { useCallback, useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';
import {
  GAP,
  SPEED_PX_PER_SEC,
  advance,
  cardWidthFor,
  countForWidth,
  setWidthFor,
} from '../lib/carousel.js';

/**
 * Track carousel yang gulir otomatis ke kiri (kanan ke kiri) tanpa henti.
 *
 * Dipakai bersama oleh TestimonialCarousel dan Showcase, jadi aturan
 * otomatisanya cuma ada di satu tempat:
 *   - 1 sampai 3 kartu: TIDAK bergerak, pemanggil merender grid biasa.
 *   - lebih dari 3 kartu: bergerak, kartu baru masuk dari kanan.
 *
 * Dua detail yang bikin gulirnya tidak "loncat":
 *   1. Daftar kartu digandakan dua kali. Set kedua disembunyikan dari
 *      accessibility tree (aria-hidden) supaya screen reader tidak
 *      membacakan item yang sama dua kali.
 *   2. Saat offset sudah melewati panjang satu set, dikurangi satu set.
 *      Karena isinya identik, perpindahan itu tidak terlihat sama sekali.
 *
 * Lebar kartu dihitung dari lebar container yang sebenarnya, bukan dari
 * class sm:/lg:, jadi titik balik pas walaupun jendela di-resize.
 *
 * Posisi track ditulis langsung ke style DOM di dalam requestAnimationFrame,
 * bukan lewat state. Kalau lewat state, React akan re-render 60 kali per
 * detik dan seluruh kartu ikut di-reconcile setiap frame.
 *
 * Otomatismenya berhenti kalau kursor di atas area, kalau keyboard fokus di
 * dalam, kalau `paused` dari luar (mis. lightbox sedang terbuka), atau kalau
 * tab-nya disembunyikan. Tombol jeda ikut disediakan karena WCAG 2.2.2 meminta
 * ada cara menghentikan konten yang bergerak sendiri.
 */
export default function MarqueeTrack({
  items,
  renderItem,
  getKey = (item, index) => item?.id ?? index,
  perViewFor = countForWidth,
  label,
  gap = GAP,
  speed = SPEED_PX_PER_SEC,
  paused: pausedProp = false,
  className = '',
}) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const offset = useRef(0);
  const lastTime = useRef(0);

  const [cardWidth, setCardWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const reduced = useReducedMotion();

  const paused = pausedProp || manuallyPaused || hovered;

  /* Lebar kartu mengikuti lebar container asli. */
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    const measure = () => {
      const width = node.clientWidth;
      if (width <= 0) return;
      setCardWidth(cardWidthFor(width, perViewFor(width)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [perViewFor]);

  const animate = !reduced && cardWidth > 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    if (!animate) {
      offset.current = 0;
      track.style.transform = 'translate3d(0,0,0)';
      return undefined;
    }

    const oneSet = setWidthFor(items.length, cardWidth);
    if (oneSet <= 0) return undefined;

    // PENTING: offset yang sudah ada TIDAK direset di sini. Effect ini ikut
    // jalan ulang setiap kali `paused` berubah, jadi kalau offset dipaksa 0
    // maka setiap hover akan membuat carousel meloncat balik ke awal.
    if (offset.current >= oneSet) offset.current %= oneSet;
    track.style.transform = `translate3d(${-offset.current}px,0,0)`;
    lastTime.current = performance.now();

    let frame = 0;
    let alive = true;

    const step = (now) => {
      if (!alive) return;
      // Dibatasi 64ms supaya loncat besar setelah tab tidak aktif terlewat.
      const delta = Math.min(now - lastTime.current, 64);
      lastTime.current = now;

      if (!paused && !document.hidden) {
        offset.current = advance(offset.current, (speed * delta) / 1000, oneSet);
        track.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [animate, cardWidth, items.length, gap, paused, speed]);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  const step = cardWidth + gap;

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        className="overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <ul
          ref={trackRef}
          style={{ display: 'flex', width: items.length * 2 * step, willChange: 'transform' }}
          className="m-0 list-none p-0"
        >
          {[0, 1].map((copy) =>
            items.map((item, index) => (
              <li
                key={`${copy}-${getKey(item, index)}`}
                aria-hidden={copy === 1 ? 'true' : undefined}
                /* Set kedua ini murni dekorasi visual. Tanpa `inert`, tombol di
                   dalamnya masih bisa terbakar focus pakai keyboard walau tidak
                   kelihatan, jadi user bisa membuka lightbox produk yang tidak
                   terlihat posisinya. */
                inert={copy === 1}
                style={{ flex: '0 0 auto', width: cardWidth, marginRight: gap }}
                className="m-0 p-0"
              >
                {renderItem(item, index, copy === 0)}
              </li>
            )),
          )}
        </ul>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setManuallyPaused((value) => !value)}
          aria-pressed={manuallyPaused}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-brand/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {manuallyPaused ? 'Lanjutkan gulir' : 'Jeda gulir'}
        </button>
      </div>
    </div>
  );
}
