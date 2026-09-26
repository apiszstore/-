import { priceLabel } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';

/**
 * Placeholder thumbnail.
 * Kalau produk punya `image`, gambar itu yang dipakai.
 * Kalau belum, pakai tile abu-abu + nama kategori — bukan gambar stok,
 * supaya tidak pernah menampilkan visual yang tidak relevan.
 */
export function ProductThumb({ product, className = '' }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`grid h-full w-full place-items-center bg-well ${className}`}
      role="img"
      aria-label={`Thumbnail belum tersedia untuk ${product.name}`}
    >
      <span className="flex flex-col items-center gap-2 px-4 text-center">
        <Icon name="layers" size={22} className="text-brand/60" />
        <span className="text-[10.5px] font-bold tracking-[0.14em] text-faint uppercase">{product.category}</span>
      </span>
    </div>
  );
}

export default function ProductCard({ product, onDetails, onOrder }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-[0_10px_28px_-16px_rgb(255_138_0/0.5)]">
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => onDetails(product)}
        className="relative block h-36 w-full overflow-hidden border-b border-line"
        aria-label={`Lihat detail ${product.name}`}
      >
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <ProductThumb product={product} />
        </div>
        <span className="absolute top-2.5 left-2.5 rounded-xs bg-brand/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-ink uppercase">
          {product.category}
        </span>
      </button>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-[15px] leading-snug font-semibold">
            <button type="button" onClick={() => onDetails(product)} className="text-left hover:text-brand">
              {product.name}
            </button>
          </h3>
          <StatusBadge status={product.status} variant="plain" className="shrink-0" />
        </div>

        {product.tagline || product.description ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
            {product.tagline ?? product.description}
          </p>
        ) : null}

        <p className="mt-3 text-[17px] font-bold text-brand">{priceLabel(product.price)}</p>

        <div className="mt-4 flex gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => onDetails(product)} className="flex-1">
            Details
          </Button>
          <Button size="sm" icon="cart" onClick={() => onOrder(product)} className="flex-1">
            Order
          </Button>
        </div>
      </div>
    </article>
  );
}
