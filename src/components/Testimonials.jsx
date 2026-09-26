import { hasRealTestimonials, testimonials } from '../data/testimonials.js';
import { initials } from '../lib/format.js';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

export default function Testimonials() {
  return (
    <Section id="testimonials" tone="base">
      <SectionHeading
        eyebrow="Testimonials"
        title="What Our Customers Say"
        subtitle={
          hasRealTestimonials
            ? 'Review dari customer yang pernah memakai layanan kami.'
            : 'Kartu di bawah ini masih contoh tampilan, bukan review asli.'
        }
        align="center"
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <Reveal key={item.id} delay={index * 70} className="h-full">
            <figure className="flex h-full flex-col rounded-md border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-[13px] font-bold text-brand"
                    aria-hidden="true"
                  >
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0">
                    <figcaption className="truncate text-[14px] font-semibold">{item.name}</figcaption>
                    <p className="truncate text-[12px] text-faint">{item.username}</p>
                  </div>
                </div>

                {item.demo ? (
                  <span className="shrink-0 rounded-full border border-soon/35 bg-soon/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-soon uppercase">
                    Demo
                  </span>
                ) : null}
              </div>

              <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-muted">“{item.text}”</p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
                <span className="truncate text-[12px] text-faint">{item.product}</span>
                <Rating value={item.rating} />
              </div>            </figure>
          </Reveal>
        ))}

        {/* Slot untuk review asli berikutnya */}
        <Reveal delay={testimonials.length * 70} className="h-full">
          <figure className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-brand/35 bg-brand/[0.04] p-5 text-center">
            <span className="grid size-11 place-items-center rounded-full border border-brand/30 bg-surface text-brand">
              <Icon name="cart" size={20} />
            </span>
            <figcaption className="mt-3.5 text-[14.5px] font-semibold">Your testimonial could be here.</figcaption>
            <p className="mt-1.5 max-w-[15rem] text-[12.5px] leading-relaxed text-muted">
              Sudah pernah order? Bagikan pengalamannya lewat Discord.
            </p>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Bintang hanya dirender kalau `rating` benar-benar berisi angka.
 * Untuk data demo (rating null) kita tetap menandai bahwa penilaian
 * belum ada, supaya tidak muncul bintang palsu.
 */
function Rating({ value }) {
  if (typeof value !== 'number' || value < 1 || value > 5) {
    return <span className="shrink-0 text-[11.5px] text-faint">Belum ada rating</span>;
  }

  return (
    <span className="flex shrink-0 items-center gap-1" aria-label={`Rating ${value} dari 5`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            key={index}
            viewBox="0 0 20 20"
            className={`size-3.5 ${index < value ? 'fill-brand' : 'fill-line'}`}
          >
            <path d="M10 1.6l2.47 5.28 5.53.72-4.06 3.9 1.03 5.68L10 14.4l-4.97 2.78 1.03-5.68L2 7.6l5.53-.72L10 1.6z" />
          </svg>
        ))}
      </span>
      <span className="text-[11.5px] font-semibold text-faint">{value}.0</span>
    </span>
  );
}
