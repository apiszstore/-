import { useState } from 'react';
import {
  filescriptService,
  mappingService,
  onServerPackages,
  sampServices,
  streamerService,
  textdrawService,
} from '../data/services';
import { useApp } from '../context/AppContext';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Kartu modul kecil: Textdraw / Filescript / Mapping / Streamer. */
function ModuleCard({ data, onOrder, delay }) {
  return (
    <Reveal className="module-card-wrap" delay={delay}>
      <article className="card module-card">
        <header className="module-card__head">
          <h3 className="module-card__title">{data.title}</h3>
          <span className="module-card__price">{data.priceLabel}</span>
        </header>
        <ul className="chip-list">
          {data.items.map((item) => (
            <li className="chip" key={item}>
              <Icon name="check" size={13} />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn--ghost btn--sm module-card__action"
          onClick={onOrder}
        >
          {data.orderLabel}
          <Icon name="arrowRight" size={15} />
        </button>
      </article>
    </Reveal>
  );
}

/** Section SA-MP SERVICES. */
export default function SampServices() {
  const { openOrder } = useApp();
  const [activePackage, setActivePackage] = useState(onServerPackages.packages[1].id);

  const order = (title, subtitle, price, serviceId) => () =>
    openOrder({ title, subtitle, price, serviceId });

  const pkg = onServerPackages.packages.find((p) => p.id === activePackage) || onServerPackages.packages[0];

  return (
    <section className="section samp" id="samp">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="SA-MP SERVICE"
            title="SA-MP SERVICES"
            subtitle="Layanan pengembangan dan konfigurasi server SA-MP."
          />
        </Reveal>

        {/* ---- JASA SA-MP (ringkasan kartu utama) ---- */}
        <Reveal>
          <div className="grid grid--2 samp__intro">
            {sampServices
              .filter((item) => ['samp-dev', 'samp-on-server'].includes(item.id))
              .map((item) => (
                <article className="card highlight-card" key={item.id}>
                  <span className="card__icon">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <div>
                    <h3 className="highlight-card__title">{item.name}</h3>
                    <p className="highlight-card__text">{item.short}</p>
                  </div>
                  <div className="highlight-card__foot">
                    <span className="highlight-card__price">{item.priceLabel}</span>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={order(item.name, item.short, item.priceLabel, item.id)}
                    >
                      {item.orderLabel}
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </Reveal>

        {/* ---- PAKET JASA ON SERVER ---- */}
        <Reveal>
          <div className="card panel" id="on-server">
            <div className="panel__head">
              <div>
                <span className="panel__eyebrow">PACKAGE</span>
                <h3 className="panel__title">{onServerPackages.title}</h3>
              </div>
              <span className="panel__price">{onServerPackages.priceLabel}</span>
            </div>

            <div className="tabs" role="tablist" aria-label="Paket Jasa On Server">
              {onServerPackages.packages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={item.id === activePackage}
                  className={`tabs__item ${item.id === activePackage ? 'is-active' : ''}`}
                  onClick={() => setActivePackage(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="package">
              <div className="package__info">
                <h4 className="package__name">{pkg.name}</h4>
                <strong className="package__price">{pkg.priceLabel}</strong>
                <ul className="check-list">
                  {pkg.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={15} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="package__compare" aria-hidden="true">
                {onServerPackages.packages.map((item) => {
                  const level = item.features.length;
                  return (
                    <div className="package__bar-row" key={item.id}>
                      <span className="package__bar-label">{item.name}</span>
                      <span className="package__bar">
                        <span
                          className="package__bar-fill"
                          style={{ width: `${(level / 6) * 100}%` }}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="panel__note">
              <Icon name="info" size={16} />
              <span>{onServerPackages.note}</span>
            </p>

            <Button
              type="primary"
              size="md"
              onClick={order(`Jasa On Server - ${pkg.name}`, pkg.features.join(', '), pkg.priceLabel, pkg.id)}
              iconRight={<Icon name="arrowRight" size={16} />}
            >
              {onServerPackages.orderLabel}
            </Button>
          </div>
        </Reveal>

        {/* ---- MODUL ---- */}
        <div className="grid grid--2">
          <ModuleCard
            data={textdrawService}
            delay={0}
            onOrder={order('Textdraw', textdrawService.items.join(', '), textdrawService.priceLabel, 'textdraw')}
          />
          <ModuleCard
            data={filescriptService}
            delay={60}
            onOrder={order('Filescript', filescriptService.items.join(', '), filescriptService.priceLabel, 'filescript')}
          />
          <ModuleCard
            data={mappingService}
            delay={0}
            onOrder={order('Mapping', mappingService.items.join(', '), mappingService.priceLabel, 'mapping')}
          />
          <ModuleCard
            data={streamerService}
            delay={60}
            onOrder={order('Streamer', streamerService.items.join(', '), streamerService.priceLabel, 'streamer')}
          />
        </div>
      </div>
    </section>
  );
}
