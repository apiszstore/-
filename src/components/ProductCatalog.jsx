import { useMemo, useState } from 'react';
import { productFilters, products } from '../data/products.js';
import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import ProductCard from './ProductCard.jsx';
import ProductDetailModal from './ProductDetailModal.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

export default function ProductCatalog() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const order = useOrder();

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = filter === 'All' || product.category === filter;
      if (!matchCategory) return false;
      if (!keyword) return true;
      return [product.name, product.category, product.tagline, product.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
    });
  }, [filter, search]);

  const catalogEmpty = products.length === 0;
  const noMatch = !catalogEmpty && visible.length === 0;

  const handleOrder = (product) => {
    setActive(null);
    order(product.name);
  };

  return (
    <Section id="products" tone="raised">
      <SectionHeading
        eyebrow="Product Catalog"
        title="Produk Digital"
        subtitle="Temukan berbagai produk digital yang tersedia di APISZ STORE."
      />

      {/* Kontrol */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter wrap (bukan scroll) supaya semua kategori selalu terlihat */}
        <div className="flex flex-wrap gap-1.5">
          {productFilters.map((item) => {
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

        <div className="relative w-full lg:max-w-xs">
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Cari produk"
            className="w-full rounded-md border border-line bg-surface py-2.5 pr-3.5 pl-10 text-[13.5px] text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <Reveal key={product.id} delay={index * 50} className="h-full">
              <ProductCard product={product} onDetails={setActive} onOrder={handleOrder} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState catalogEmpty={catalogEmpty} onReset={() => { setFilter('All'); setSearch(''); }} />
      )}

      {active ? (
        <ProductDetailModal
          product={active}
          onClose={() => setActive(null)}
          onOrder={handleOrder}
        />
      ) : null}
    </Section>
  );
}

function EmptyState({ catalogEmpty, onReset }) {
  if (catalogEmpty) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-line bg-surface/40 px-6 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-line bg-surface text-brand">
          <Icon name="layers" size={22} />
        </span>
        <h3 className="mt-4 text-base font-semibold">Produk sedang dipersiapkan</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
          Nantikan update terbaru dari APISZ STORE.
        </p>
        <Button variant="quiet" size="sm" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="mt-4">
          Hubungi kami
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-md border border-dashed border-line bg-surface/40 px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full border border-line bg-surface text-faint">
        <Icon name="search" size={20} />
      </span>
      <h3 className="mt-4 text-base font-semibold">Produk tidak ditemukan</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
        Coba kata kunci lain atau pilih kategori berbeda.
      </p>
      <Button variant="outline" size="sm" onClick={onReset} className="mt-4">
        Reset filter
      </Button>
    </div>
  );
}
