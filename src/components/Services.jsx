import { useState } from 'react';
import { digitalServices, sampServices } from '../data/services';
import { useApp } from '../context/AppContext';
import Icon from './Icons';
import Modal from './Modal';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import ServiceCard from './ServiceCard';

/** Section OUR SERVICES: semua kartu layanan digital + SA-MP. */
export default function Services() {
  const { openOrder } = useApp();
  const [detail, setDetail] = useState(null);

  const handleOrder = (item) =>
    openOrder({
      title: item.name,
      subtitle: item.short,
      price: item.priceLabel,
      serviceId: item.id,
    });

  return (
    <section className="section services" id="services">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="SERVICES"
            title="OUR SERVICES"
            subtitle="Pilih layanan yang sesuai dengan kebutuhanmu."
          />
        </Reveal>

        <div className="services__tabs" role="list">
          <span className="services__tab is-active" role="listitem">
            <Icon name="layers" size={16} /> DIGITAL SERVICE
          </span>
          <span className="services__tab" role="listitem">
            <Icon name="terminal" size={16} /> SA-MP SERVICE
          </span>
        </div>

        <div className="grid grid--3">
          {digitalServices.map((item, index) => (
            <ServiceCard
              key={item.id}
              item={item}
              delay={index * 60}
              onOrder={handleOrder}
              onDetail={setDetail}
            />
          ))}
        </div>

        <div className="divider-label">
          <span>SA-MP SERVICE</span>
        </div>

        <div className="grid grid--3">
          {sampServices.map((item, index) => (
            <ServiceCard
              key={item.id}
              item={item}
              delay={index * 60}
              onOrder={handleOrder}
              onDetail={setDetail}
            />
          ))}
        </div>
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.name}
        subtitle={detail?.group}
      >
        {detail ? (
          <div className="detail-modal">
            <p className="detail-modal__text">{detail.detail || detail.short}</p>

            {detail.features?.length ? (
              <>
                <h4 className="detail-modal__label">Yang kamu dapat</h4>
                <ul className="check-list">
                  {detail.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={15} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="detail-modal__foot">
              <div>
                <span className="detail-modal__price-label">Harga mulai</span>
                <strong className="detail-modal__price">{detail.priceLabel}</strong>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--md"
                onClick={() => {
                  handleOrder(detail);
                  setDetail(null);
                }}
              >
                {detail.orderLabel || 'ORDER'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
