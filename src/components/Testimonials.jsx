import { useEffect, useState } from 'react';
import { testimonials as fallbackTestimonials } from '../data/testimonials.js';
import { useTestimonials } from './TestimonialCard.jsx';
import TestimonialCarousel from './TestimonialCarousel.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

/**
 * Section testimoni.
 *
 * Sumber data adalah channel Discord lewat `/api/testimonials` (Vercel
 * serverless). Kalau endpoint belum dikonfigurasi atau Discord sedang tidak
 * bisa dihubungi, section falls back ke `data/testimonials.js` supaya
 * halaman tidak pernah kosong. Entri fallback tetap memakai badge "Demo" sehingga
 * tidak pernah disalahartikan sebagai review asli.
 */
export default function Testimonials() {
  // pollMs bikin testimoni baru dari Discord muncul tanpa perlu refresh.
  // Nilainya purposely sedikit lebih besar dari s-maxage=60 di API supaya
  // request kedua biasanya dilayani cache Vercel, bukan memanggil Discord lagi.
  const { testimonials, loading, error, connected } = useTestimonials({
    limit: 12,
    pollMs: 90_000,
  });

  const fromDiscord = testimonials.length > 0;

  // Endpoint sehat tapi belum ada data = semua testimoni di Discord dihapus.
  // Kasus itu TIDAK boleh diisi kartu Demo, karena data Discord-nya nyata
  // (connected true) sedangkan badge "Demo" berarti review karangan.
  const emptyFromDiscord = connected && !fromDiscord && !error;
  const showDemo = !fromDiscord && !emptyFromDiscord;
  const items = fromDiscord ? testimonials : showDemo ? fallbackTestimonials : [];

  return (
    <Section id="testimonials" tone="base">
      <SectionHeading
        eyebrow="Testimonials"
        title="What Our Customers Say"
        subtitle={
          fromDiscord
            ? 'Review dari customer yang pernah memakai layanan kami.'
            : emptyFromDiscord
              ? 'Belum ada testimoni yang dipublikasikan di channel Discord kami.'
              : 'Kartu di bawah ini masih contoh tampilan, bukan review asli.'
        }
        align="center"
      />

      <div className="mt-10">
        {loading ? <TestimonialSkeleton /> : null}

        <Reveal className="min-w-0">
          <TestimonialCarousel testimonials={items} />
        </Reveal>

        {emptyFromDiscord ? <EmptyNotice /> : null}
        {showDemo && !loading ? <DiscordNotice error={error} /> : null}
      </div>

      <Reveal delay={120} className="mt-5 h-full">
        <figure
          data-testimonial-cta
          className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-brand/35 bg-brand/[0.04] p-5 text-center"
        >
          <span className="grid size-11 place-items-center rounded-full border border-brand/30 bg-surface text-brand">
            <Icon name="cart" size={20} />
          </span>
          <figcaption className="mt-3.5 text-[14.5px] font-semibold">
            Your testimonial could be here.
          </figcaption>
          <p className="mt-1.5 max-w-[15rem] text-[12.5px] leading-relaxed text-muted">
            Sudah pernah order? Bagikan pengalamannya lewat Discord.
          </p>
        </figure>
      </Reveal>
    </Section>
  );
}

/** Placeholder biar layout tidak bergeser saat data Discord masih dimuat. */
function TestimonialSkeleton() {
  return (
    <div aria-hidden="true" className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-40 rounded-xl border border-line bg-surface" />
      ))}
    </div>
  );
}

/** Fallback dipakai kalau data statis yang tampil, bukan data Discord. */
function DiscordNotice({ error }) {
  return (
    <p className="mt-4 text-center text-[12px] text-faint">
      {error
        ? 'Testimoni dari Discord belum bisa dimuat. Menampilkan contoh tampilan.'
        : 'Testimoni dari Discord akan muncul di sini setelah channel terhubung.'}
    </p>
  );
}

/**
 * Channel Discord terhubung tapi belum punya embed testimoni - misalnya semua
 * review lama dihapus dari Discord. Menampilkan kartu Demo di sini akan
 * menyesatkan karena terlihat seperti review asli, jadi cukup tampil kosong.
 */
function EmptyNotice() {
  return (
    <p className="mt-4 text-center text-[12px] text-faint">
      Belum ada testimoni yang dipublikasikan. Review baru akan muncul otomatis
      begitu bot mengirimkannya ke channel Discord.
    </p>
  );
}
