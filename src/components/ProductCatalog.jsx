import { useMemo, useState } from 'react';
import { productCategories, productStatus, products } from '../data/products';
import { useApp } from '../context/AppContext';
import Icon from './Icons';
import Reveal from './Reveal';
import Thumb from './Thumb';

/** Kartu produk untuk katalog. */
export function ProductCard({ product, onDetail, onOrder, delay = 0 }) {
  const status = productStatus[product.status] || productStatus.custom;
  const category =
    productCategories.find((c) => c.id === product.category)?.label || 'OTHER';

  return (
    <Reveal delay={delay} className="product-card-wrap">
      <article className="card product-card">
        <div className="product-card__media">
          <Thumb seed={product.id} icon={product.icon} alt={product.name} />
          <span className="product-card__status" style={{ '--dot': status.dot }}>
            <i />
            {status.label}
          </span>
        </div>

        <div className="product-card__body">
          <span className="product-card__category">{category}</span>
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__text">{product.short}</p>

          <div className="product-card__price">
            {product.priceNote ? (
              <span className="product-card__price-note">{product.priceNote}</span>
            ) : null}
            <strong>{product.priceLabel}</strong>
          </div>

          <div className="product-card__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onDetail(product)}>
              Detail
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onOrder(product)}
              disabled={product.status === 'out-of-stock'}
            >
              {product.status === 'out-of-stock' ? 'Unavailable' : 'Order'}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** Halaman Store / Products: search + filter kategori. */
export default function ProductCatalog({ compact = false }) {
  const { openOrder, navigate } = useApp();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = category === 'all' || product.category === category;
      if (!matchCategory) return false;
      if (!keyword) return true;
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.short.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
      );
    });
  }, [category, query]);

  const handleOrder = (product) =>
    openOrder({
      title: product.name,
      subtitle: product.short,
      price: product.priceLabel,
      serviceId: product.id,
    });

  const handleDetail = (product) => navigate(`/product/${product.id}`);

  return (
    <section className={`section products ${compact ? 'products--compact' : ''}`} id="products">
      <div className="container">
        {!compact ? (
          <Reveal>
            <div className="section-heading">
              <span className="section-heading__eyebrow">STORE</span>
              <h1 className="section-heading__title">PRODUCTS</h1>
              <p className="section-heading__subtitle">
                Katalog lengkap layanan digital, Discord, dan SA-MP. Pilih kategori atau cari produk
                yang kamu butuh.
              </p>
            </div>
          </Reveal>
        ) : null}

        <Reveal>
          <div className="catalog__toolbar">
            <div className="search">
              <Icon name="search" size={18} />
              <input
                type="search"
                className="search__input"
                placeholder="Cari produk atau layanan..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Cari produk"
              />
              {query ? (
                <button
                  type="button"
                  className="search__clear"
                  onClick={() => setQuery('')}
                  aria-label="Bersihkan pencarian"
                >
                  <Icon name="close" size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="filters" role="tablist" aria-label="Filter kategori produk">
            {productCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={category === item.id}
                className={`filters__item ${category === item.id ? 'is-active' : ''}`}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <p className="catalog__count">
          Menampilkan <strong>{filtered.length}</strong> dari {products.length} produk
        </p>

        {filtered.length ? (
          <div className="grid grid--products">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                delay={(index % 4) * 60}
                onDetail={handleDetail}
                onOrder={handleOrder}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Icon name="search" size={26} />
            <h3>Produk tidak ditemukan</h3>
            <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
