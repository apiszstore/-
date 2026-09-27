import { useEffect, useMemo, useRef, useState } from 'react';
import { shouldScroll } from '../lib/carousel.js';
import { showcaseFilters, showcaseItems } from '../data/showcase.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import Icon from './Icon.jsx';
import MarqueeTrack from './MarqueeTrack.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';
import ShowcaseCard from './ShowcaseCard.jsx';
import ShowcaseLightbox from './ShowcaseLightbox.jsx';

/**
 * Ambil produk showcase dari channel Discord lewat `/api/showcase`.
 *
 * Pola ini sama dengan `useTestimonials` di TestimonialCard.jsx: token hanya
 * dibaca di server, browser cuma menerima JSON yang sudah diparse.
 * `connected` membedakan "endpoint sehat tapi channel belum ada produk" dari
 * "endpoint gagal".
 */
export function useShowcase({ limit = 24, pollMs = 0, endpoint = '/api/showcase' } = {}) {
  const [state, setState] = useState({ items: [], loading: true, error: null, connected: false });
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(`${endpoint}?limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!alive) return;
        setState({ items: data.items ?? [], loading: false, error: null, connected: true });
      } catch (error) {
        if (!alive) return;
        setState((prev) => ({ ...prev, loading: false, error, connected: false }));
      }
    }

    load();

    if (pollMs > 0) {
      timer.current = setInterval(load, pollMs);
      return () => { alive = false; clearInterval(timer.current); };
    }

    return () => { alive = false; };
  }, [limit, pollMs, endpoint]);

  return state;
}

/**
 * Galeri showcase.
 *
 * Sumber datanya channel Discord (#product-samp dan #digital-service) lewat
 * `/api/showcase`, jadi produk yang sudah diposting sebelumnya ikut tampil
 * tanpa input manual, dan produk baru ikut muncul begitu dikirim ke Discord.
 *
 * `data/showcase.js` tetap dipakai sebagai fallback kalau endpoint belum
 * dikonfigurasi atau Discord sedang tidak bisa dihubungi, supaya section
 * tidak pernah kosong dan tidak menampilkan gambar yang tidak relevan.
 *
 * ============================================================
 *  ATURAN TAMPIL
 * ============================================================
 *  - 1 sampai 3 produk : grid diam, tidak bergerak.
 *  - lebih dari 3 produk: gulir otomatis ke kiri (kanan ke kiri), kartu baru
 *                        masuk dari kanan.
 *  - 3 kartu di layar lebar, 2 di tablet, 1 di HP (lihat `countForWidth`).
 *  - klik gambar   : buka `ShowcaseLightbox`, gambar tampil utuh.
 *
 * Gulirnya berhenti sementara kalau kursor di atas area, kalau keyboard fokus
 * masuk, atau kalau lightbox sedang terbuka - jadi tidak ada yang bergerak di
 * belakang modal yang sedang dibaca.
 */
export default function Showcase() {
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);

  // pollMs bikin produk baru dari Discord muncul tanpa perlu refresh halaman.
  // Nilainya sedikit lebih besar dari s-maxage=60 di API supaya request kedua
  // biasanya dilayani cache Vercel, bukan memanggil Discord lagi.
  const { items, loading, error } = useShowcase({ limit: 24, pollMs: 90_000 });

  const fromDiscord = items.length > 0;
  // Endpoint sehat tapi channel belum berisi produk = semua produk dihapus dari
  // Discord. Kasus itu tetap memakai placeholder, bukan pesan error.
  const source = fromDiscord ? items : showcaseItems;

  const visible = useMemo(
    () => (filter === 'All' ? source : source.filter((item) => item.category === filter)),
    [filter, source],
  );

  // Filter yang menyisakan <= 3 produk ikut diam. Efeknya: memilih "UI" saat
  // produknya cuma satu akan menampilkan grid statis, bukan marquee isian
  // satu kartu yang berputar sendiri.
  const scrollable = shouldScroll(visible.length);
  const reduced = useReducedMotion();

  const notice = fromDiscord
    ? 'Showcase ini diambil langsung dari channel showcase Discord kami.'
    : loading
      ? 'Screenshot asli akan ditambahkan setelah tersedia.'
      : error
        ? 'Showcase dari Discord belum bisa dimuat. Menampilkan contoh tampilan.'
        : 'Belum ada produk yang dipublikasikan di channel showcase Discord kami.';

  return (
    <Section id="showcase" tone="raised">
      <SectionHeading
        eyebrow="Showcase"
        title="Our Showcase"
        subtitle="Kumpulan hasil project dan layanan yang pernah dikerjakan."
      />

      <div className="mt-8 flex flex-wrap gap-1.5">
        {showcaseFilters.map((item) => {
          const activeFilter = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={activeFilter}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                activeFilter
                  ? 'border-brand/50 bg-brand/12 text-brand'
                  : 'border-line text-muted hover:border-brand/35 hover:text-ink'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {scrollable && !reduced ? (
          <div data-showcase-marquee={visible.length}>
            <MarqueeTrack
              items={visible}
              label="Gambar showcase"
              paused={active !== null}
              renderItem={(item) => <ShowcaseCard item={item} onOpen={setActive} />}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item, index) => (
                <Reveal key={item.id} delay={index * 40}>
                  <ShowcaseCard item={item} onOpen={setActive} />
                </Reveal>
              ))}
            </div>
            {scrollable && reduced ? (
              <p className="mt-4 text-center text-[12px] text-faint">
                Gulir otomatis dimatikan karena perangkat Anda meminta gerakan seminimal mungkin.
              </p>
            ) : null}
          </>
        )}
      </div>

      {scrollable && !reduced ? (
        <p className="mt-4 text-center text-[12px] text-faint">
          Klik salah satu gambar untuk melihatnya ukuran penuh.
        </p>
      ) : null}

      <p className="mt-5 flex items-center gap-1.5 text-[12.5px] text-faint">
        <Icon name="info" size={14} />
        {notice}
      </p>

      <ShowcaseLightbox item={active} onClose={() => setActive(null)} />
    </Section>
  );
}
