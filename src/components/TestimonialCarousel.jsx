import { shouldScroll } from '../lib/carousel.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import MarqueeTrack from './MarqueeTrack.jsx';
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
 * Perhitungan lebar kartu, pengulangan daftar, dan rAF-nya ada di
 * `MarqueeTrack.jsx` karena Showcase memakai aturan yang persis sama.
 *
 * Kalau user meminta prefers-reduced-motion, carousel tidak bergerak sama
 * sekali dan dirender sebagai grid supaya tetap terbaca.
 */
export default function TestimonialCarousel({ testimonials, label = 'Testimoni customer' }) {
  const items = testimonials ?? [];
  const scrollable = shouldScroll(items.length);
  const reduced = useReducedMotion();

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

  return (
    <div data-testimonial-carousel={items.length}>
      <MarqueeTrack
        items={items}
        label={label}
        renderItem={(item) => <TestimonialCard item={item} />}
      />
    </div>
  );
}
