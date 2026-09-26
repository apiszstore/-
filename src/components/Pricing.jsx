import { useState } from 'react';
import { bundlePackages } from '../data/services';
import { useApp } from '../context/AppContext';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Section PRICING: paket bundle Discord. */
export default function Pricing() {
  const { openOrder } = useApp();
  const [active, setActive] = useState(bundlePackages.packages[1].id);
  const pkg = bundlePackages.packages.find((p) => p.id === active) || bundlePackages.packages[0];

  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="BUNDLE"
            title="DISCORD BUNDLE SERVICE"
            subtitle="Paket gabungan Discord Setup + Bot. Pilih yang paling sesuai dengan kebutuhanmu."
          />
        </Reveal>

        <div className="grid grid--3">
          {bundlePackages.packages.map((item, index) => (
            <Reveal key={item.id} delay={index * 70}>
              <article
                className={`card price-card ${item.popular ? 'is-popular' : ''} ${
                  item.id === active ? 'is-active' : ''
                }`}
                onClick={() => setActive(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActive(item.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={item.id === active}
              >
                {item.popular ? <span className="price-card__flag">POPULAR</span> : null}
                <h3 className="price-card__name">{item.name}</h3>
                <p className="price-card__tagline">{item.tagline}</p>
                <div className="price-card__price">{item.priceLabel}</div>
                <ul className="check-list check-list--sm">
                  {item.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn btn--sm ${item.id === active ? 'btn--primary' : 'btn--ghost'} price-card__btn`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openOrder({
                      title: `Discord Bundle - ${item.name}`,
                      subtitle: item.tagline,
                      price: item.priceLabel,
                      serviceId: item.id,
                    });
                  }}
                >
                  ORDER
                  <Icon name="arrowRight" size={15} />
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="section-note section-note--center">
            <Icon name="info" size={16} />
            <span>
              Harga bundle bisa disesuaikan lagi sesuai request tambahan. Pilih paket {pkg.name} lalu
              chat admin untuk konfirmasi.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
