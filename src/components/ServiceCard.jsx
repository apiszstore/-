import Icon from './Icons';
import Reveal from './Reveal';

/**
 * Kartu layanan untuk section OUR SERVICES.
 * item: { icon, name, group, short, priceLabel, orderLabel, features }
 */
export default function ServiceCard({ item, onOrder, onDetail, delay = 0 }) {
  return (
    <Reveal className="service-card-wrap" delay={delay}>
      <article className="card service-card">
        <header className="service-card__head">
          <span className="card__icon">
            <Icon name={item.icon} size={22} />
          </span>
          <span className="service-card__group">{item.group}</span>
        </header>

        <h3 className="service-card__title">{item.name}</h3>
        <p className="service-card__text">{item.short}</p>

        <div className="service-card__price">
          <span className="service-card__price-label">Harga mulai</span>
          <strong className="service-card__price-value">{item.priceLabel}</strong>
        </div>

        <div className="service-card__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onDetail(item)}>
            View Detail
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onOrder(item)}>
            {item.orderLabel || 'ORDER'}
          </button>
        </div>
      </article>
    </Reveal>
  );
}
