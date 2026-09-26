import { useMemo, useState } from 'react';
import { showcaseFilters, showcaseItems } from '../data/showcase.js';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

/**
 * Galeri showcase.
 * Semua item memakai `image: null` sampai ada file asli, jadi yang
 * tampil selalu placeholder berlabel — tidak ada gambar stok yang
 * tidak berhubungan dengan APISZ STORE.
 */
export default function Showcase() {
  const [filter, setFilter] = useState('All');

  const visible = useMemo(
    () => (filter === 'All' ? showcaseItems : showcaseItems.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <Section id="showcase" tone="raised">
      <SectionHeading
        eyebrow="Showcase"
        title="Our Showcase"
        subtitle="Kumpulan hasil project dan layanan yang pernah dikerjakan."
      />

      <div className="mt-8 flex flex-wrap gap-1.5">
        {showcaseFilters.map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={active}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? 'border-brand/50 bg-brand/12 text-brand'
                  : 'border-line text-muted hover:border-brand/35 hover:text-ink'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, index) => (
          <Reveal key={item.id} delay={index * 40}>
            <figure className="group relative overflow-hidden rounded-md border border-line bg-surface transition-[border-color] duration-200 hover:border-brand/45">
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

                {/* Overlay hover */}
                <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <figcaption className="text-[13px] font-semibold text-ink">{item.title}</figcaption>
                  <span className="text-[11px] font-medium text-brand">{item.category}</span>
                </div>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-[12.5px] text-faint">
        <Icon name="info" size={14} />
        Screenshot asli akan ditambahkan setelah tersedia.
      </p>
    </Section>
  );
}
