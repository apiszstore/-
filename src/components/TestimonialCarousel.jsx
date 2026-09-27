import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GAP,
  SPEED_PX_PER_SEC,
  advance,
  cardWidthFor,
  countForWidth,
  setWidthFor,
  shouldScroll,
} from '../lib/carousel.js';
import TestimonialCard, { TestimonialGrid } from './TestimonialCard.jsx';

/**
 * Carousel testimoni.
 *
 * ============================================================
 *  ATURAN TAMPIL
 * ============================================================
 *  - 1 sampai 3 kartu : tampil sebagai grid biasa, TIDAK bergerak.
 *  - lebih dari 3 kartu : gulir otomatis ke kiri (kanan ke kiri) tanpa henti.
 *
 *  Dua detail yang bikin gulirnya tidak "loncat":
 *   1. Daftar kartu digandakan dua kali. Set kedua disembunyikan dari
 *      accessibility tree (aria-hidden) supaya screen reader tidak membacakan
 *      review yang sama dua kali.
 *   2. Saat offset sudah melewati panjang satu set, dikurangi satu set.
 *      Karena isinya identik, perpindahan itu tidak terlihat sama sekali.
 *
 *  Lebar kartu dihitung dari lebar container yang sebenarnya, bukan dari
 *  class sm:/lg:, jadi titik balik pas walaupun jendela di-resize.
 *
 *  Posisi track ditulis langsung ke style DOM di dalam requestAnimationFrame,
 *  bukan lewat state. Kalau lewat state, React akan re-render 60 kali per
 *  detik dan seluruh kartu ikut di-reconcile setiap frame.
 *
 *  Otomatismenya berhenti kalau kursor di atas area, kalau keyboard fokus di
 *  dalam, atau kalau tab-nya disembunyikan. Tombol jeda ikut disediakan karena
 *  WCAG 2.2.2 meminta ada cara menghentikan konten yang bergerak sendiri.
 *
 *  Kalau user meminta prefers-reduced-motion, carousel tidak bergerak sama
 *  sekali dan dirender sebagai grid supaya tetap terbaca.
 */
export default function TestimonialCarousel({ testimonials, label = 'Testimoni customer' }) {
  const items = testimonials ?? [];
  const scrollable = shouldScroll(items.length);

  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const offset = useRef(0);
  const lastTime = useRef(0);

  const [cardWidth, setCardWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* Lebar kartu mengikuti lebar container asli. */
  useEffect(() => {
    if (!scrollable) return undefined;
    const node = wrapRef.current;
    if (!node) return undefined;

    const measure = () => {
      const width = node.clientWidth;
      if (width <= 0) return;
      setCardWidth(cardWidthFor(width, countForWidth(width)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollable]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const animate = scrollable && !reduced && cardWidth > 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    // Kirim transform tepat satu kali agar tidak ada kedipan frame pertama.
    track.style.transform = 'translate3d(0,0,0)';

    if (!animate) {
      offset.current = 0;
      return undefined;
    }

    const oneSet = setWidthFor(items.length, cardWidth);
    let frame = 0;
    let alive = true;
    lastTime.current = performance.now();

    const step = (now) => {
      if (!alive) return;
      // Dibatasi 64ms supaya loncat besar setelah tab tidak aktif terlewat.
      const delta = Math.min(now - lastTime.current, 64);
      lastTime.current = now;

      if (!paused && !document.hidden) {
        offset.current = advance(offset.current, (SPEED_PX_PER_SEC * delta) / 1000, oneSet);
        track.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [animate, cardWidth, items.length, paused]);

  const onEnter = useCallback(() => setPaused(true), []);
  const onLeave = useCallback(() => setPaused(false), []);

  /* 1-3 kartu: grid biasa persis seperti sebelumnya. */
  if (!scrollable) return <TestimonialGrid testimonials={items} />;

  if (reduced) {
    return (
      <div>
        <TestimonialGrid testimonials={items} />
        <p className="mt-4 text-center text-[12px] text-faint">
          Gulir otomatis dimatikan karena perangkat Anda meminta gerakan seminimal mungkin.
        </p>
      </div>
    );
  }

  const step = cardWidth + GAP;

  return (
    <div data-testimonial-carousel={items.length}>
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
          style={{
            display: 'flex',
            width: items.length * 2 * step,
            willChange: 'transform',
          }}
          className="m-0 list-none p-0"
        >
          {[0, 1].map((copy) =>
            items.map((item, index) => (
              <li
                key={`${copy}-${item.id ?? index}`}
                aria-hidden={copy === 1 ? 'true' : undefined}
                style={{ flex: '0 0 auto', width: cardWidth, marginRight: GAP }}
                className="m-0 p-0"
              >
                <TestimonialCard item={item} />
              </li>
            )),
          )}
        </ul>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-brand/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {paused ? 'Lanjutkan gulir' : 'Jeda gulir'}
        </button>
      </div>
    </div>
  );
}
