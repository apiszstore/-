import { useState } from 'react';
import { otherServices } from '../data/otherServices.js';
import { useOrder } from '../hooks/useOrder.js';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';
import ServiceCard from './ServiceCard.jsx';
import ServiceDetailModal from './ServiceDetailModal.jsx';

export default function OtherServices() {
  const [active, setActive] = useState(null);
  const order = useOrder();

  return (
    <Section id="other" tone="base">
      <SectionHeading
        eyebrow="Other Services"
        title="Layanan Lainnya"
        subtitle="Sedang dikembangkan. Harga dan detailnya akan diumumkan setelah siap."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {otherServices.map((service, index) => (
          <Reveal key={service.id} delay={index * 70} className="h-full">
            <ServiceCard service={service} onViewDetails={setActive} />
          </Reveal>
        ))}
      </div>

      {active ? (
        <ServiceDetailModal
          service={active}
          onClose={() => setActive(null)}
          onOrder={() => {
            setActive(null);
            order(active.name);
          }}
        />
      ) : null}
    </Section>
  );
}
