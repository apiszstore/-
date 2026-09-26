import { useEffect, useState } from 'react';
import { getProductById, productCategories, productStatus } from '../data/products';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../lib/links';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';
import Thumb from './Thumb';

/** Halaman detail produk (#/product/:id). */
export default function ProductDetail({ productId }) {
  const { navigate, openOrder } = useApp();
  const product = getProductById(productId);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    setOpenFaq(0);
  }, [productId]);

  if (!product) {
    return (
      <section className="section product-detail">
        <div className="container">
          <div className="empty">
            <Icon name="info" size={26} />
            <h3>Produk tidak ditemukan</h3>
            <p>Produk yang kamu cari mungkin sudah diubah atau dihapus.</p>
            <Button type="primary" size="sm" to="/products">
              Kembali ke Store
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const status = productStatus[product.status] || productStatus.custom;
  const category = productCategories.find((c) => c.id === product.category)?.label || 'OTHER';

  return (
    <section className="section product-detail">
      <div className="container">
        <Reveal>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={() => navigate('/')}>
              Home
            </button>
            <Icon name="arrowRight" size={14} />
            <button type="button" onClick={() => navigate('/products')}>
              Products
            </button>
            <Icon name="arrowRight" size={14} />
            <span>{product.name}</span>
          </nav>
        </Reveal>

        <div className="detail">
          <Reveal className="detail__media">
            <Thumb
              src={product.image || ''}
              seed={product.id}
              icon={product.icon}
              alt={product.name}
              className="thumb--tall"
            />
            <span className="product-card__status detail__status" style={{ '--dot': status.dot }}>
              <i />
              {status.label}
            </span>
          </Reveal>

          <Reveal delay={80} className="detail__info">
            <span className="detail__category">{category}</span>
            <h1 className="detail__name">{product.name}</h1>
            <p className="detail__desc">{product.description}</p>

            <div className="detail__price-box">
              <div>
                {product.priceNote ? (
                  <span className="detail__price-note">{product.priceNote}</span>
                ) : null}
                <strong className="detail__price">{product.priceLabel}</strong>
                {product.priceValue ? (
                  <span className="detail__price-raw">({formatRupiah(product.priceValue)})</span>
                ) : null}
              </div>
              <div className="detail__actions">
                <Button
                  type="primary"
                  size="md"
                  onClick={() =>
                    openOrder({
                      title: product.name,
                      subtitle: product.short,
                      price: product.priceLabel,
                      serviceId: product.id,
                    })
                  }
                  disabled={product.status === 'out-of-stock'}
                  iconRight={<Icon name="arrowRight" size={16} />}
                >
                  ORDER NOW
                </Button>
                <Button type="ghost" size="md" to="/products">
                  Lihat produk lain
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="detail__grid">
          <Reveal className="card detail__box">
            <h2 className="detail__box-title">
              <Icon name="check" size={18} /> Features
            </h2>
            <ul className="check-list">
              {product.features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={15} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="card detail__box" delay={70}>
            <h2 className="detail__box-title">
              <Icon name="info" size={18} /> Requirements
            </h2>
            <ul className="check-list check-list--muted">
              {product.requirements.map((req) => (
                <li key={req}>
                  <Icon name="arrowRight" size={14} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {product.faq?.length ? (
          <Reveal>
            <div className="card detail__box detail__box--faq">
              <h2 className="detail__box-title">
                <Icon name="chat" size={18} /> FAQ Produk
              </h2>
              <div className="accordion">
                {product.faq.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div className={`accordion__item ${isOpen ? 'is-open' : ''}`} key={item.q}>
                      <button
                        type="button"
                        className="accordion__trigger"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <Icon name="chevronDown" size={18} />
                      </button>
                      <div className="accordion__panel">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
