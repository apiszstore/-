import { priceLabel } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';

/**
 * Kartu layanan. Bentuknya sama untuk Digital Service, SA-MP, dan
 * Other Services, jadi dipakai bersama.
 *
 * Border orange + glow halus hanya saat hover, supaya tidak ada
 * garis orange di setiap kartu.
 *
 * Kalau `service.recommended` bernilai true, kartu memakai gaya highlight
 * yang sama dengan PacketCard di section SA-MP: border brand menyala dan
 * ribbon label yang menempel di tepi atas. Token, ukuran, dan posisi
 * ribbonnya sengaja disamakan supaya keduanya tidak terlihat seperti dua
 * komponen berbeda.
 */
export default function ServiceCard({ service, onViewDetails, compact = false }) {
  const recommended = service.recommended === true;

  return (
    <article
      data-recommended={recommended ? 'true' : undefined}
      className={`group relative flex h-full flex-col rounded-md border p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 sm:p-6 ${
        /* Kartu recommended memakai gaya yang sama persis dengan PacketCard
           yang ber-highlight di section SA-MP, supaya dua penanda "pilihan
           utama" di halaman ini terlihat sebagai satu bahasa visual. */
        recommended
          ? 'border-brand/50 bg-surface shadow-[0_10px_30px_-18px_rgb(255_138_0/0.55)] hover:border-brand/60'
          : 'border-line bg-surface hover:border-brand/45 hover:shadow-[0_10px_28px_-16px_rgb(255_138_0/0.5)]'
      }`}
    >
      {/* RibbonRecommended, ditempel di tepi atas kartu dengan gaya yang sama
          seperti label "Populer" di PacketCard section SA-MP. */}
      {recommended ? (
        <span
          data-recommended-badge
          className="absolute -top-2.5 left-5 rounded-full border border-brand/40 bg-brand px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-brand-ink uppercase"
        >
          {service.recommendedLabel ?? 'Recommended'}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-well text-brand transition-colors group-hover:border-brand/35">
          <Icon name={service.icon} size={19} />
        </span>
        <StatusBadge status={service.status} />
      </div>

      <h3 className="mt-4 text-[17px] font-semibold">{service.name}</h3>
      {service.tagline ? <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{service.tagline}</p> : null}

      {service.features?.length ? (
        <ul className={`mt-4 flex flex-col gap-2 ${compact ? '' : 'border-t border-line-soft pt-4'}`}>
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[13px] leading-snug text-muted">
              <Icon name="check" size={14} className="mt-0.5 shrink-0 text-brand/85" strokeWidth={2.5} />
              <span className="min-w-0">{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {service.notes ? (
        <p className="mt-4 rounded-sm border border-line-soft bg-well/60 px-3 py-2 text-[12px] leading-relaxed text-faint">
          {service.notes}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
        <p className="text-[13px] text-faint">
          Mulai{' '}
          <span
            className={`text-[15px] font-bold ${typeof service.price === 'number' ? 'text-brand' : 'text-muted'}`}
          >
            {priceLabel(service.price)}
          </span>
        </p>

        {onViewDetails ? (
          <Button variant="ghost" size="sm" iconRight="chevronDown" onClick={() => onViewDetails(service)}>
            View Details
          </Button>
        ) : null}
      </div>
    </article>
  );
}
