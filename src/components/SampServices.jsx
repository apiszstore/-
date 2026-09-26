import { useState } from 'react';
import { sampGeneral, sampPacketNote, sampPackets } from '../data/sampServices.js';
import { priceLabel } from '../lib/format.js';
import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';
import ServiceCard from './ServiceCard.jsx';
import ServiceDetailModal from './ServiceDetailModal.jsx';

export default function SampServices() {
  const [active, setActive] = useState(null);
  const order = useOrder();

  return (
    <Section id="samp" tone="raised">
      <SectionHeading
        eyebrow="SA-MP Services"
        title="Layanan GTA SA-MP"
        subtitle="Scripting, perbaikan bug, sampai Paket On Server untuk server SA-MP kamu."
      />

      {/* Paket On Server */}
      <div className="mt-10">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.1em] text-ink uppercase">
          <Icon name="terminal" size={16} className="text-brand" />
          Paket On Server
        </h3>

        <div className="grid gap-5 md:grid-cols-3">
          {sampPackets.map((packet, index) => (
            <Reveal key={packet.id} delay={index * 70} className="h-full">
              <PacketCard packet={packet} onOrder={() => order(packet.name)} />
            </Reveal>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-md border border-line bg-surface/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
          <Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand" />
          {sampPacketNote}
        </p>
      </div>

      {/* Jasa umum */}
      <div className="mt-12">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.1em] text-ink uppercase">
          <Icon name="layers" size={16} className="text-brand" />
          Jasa SA-MP
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          {sampGeneral.map((service, index) => (
            <Reveal key={service.id} delay={index * 70} className="h-full">
              <ServiceCard service={service} onViewDetails={setActive} />
            </Reveal>
          ))}
        </div>
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

function PacketCard({ packet, onOrder }) {
  const highlighted = packet.highlight;

  return (
    <article
      className={`relative flex h-full flex-col rounded-md border p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 sm:p-6 ${
        highlighted
          ? 'border-brand/50 bg-surface shadow-[0_10px_30px_-18px_rgb(255_138_0/0.55)]'
          : 'border-line bg-surface/60 hover:border-brand/40'
      }`}
    >
      {highlighted ? (
        <span className="absolute -top-2.5 left-5 rounded-full border border-brand/40 bg-brand px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-brand-ink uppercase">
          Populer
        </span>
      ) : null}

      <h4 className="font-display text-base font-bold tracking-[0.08em] uppercase">{packet.name}</h4>
      <p className="mt-1 text-[13px] text-muted">{packet.tagline}</p>

      <p className="mt-4 text-2xl font-bold text-brand">{priceLabel(packet.price)}</p>

      <ul className="mt-4 flex flex-1 flex-col gap-2 border-t border-line-soft pt-4">
        {packet.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px] leading-snug text-muted">
            <Icon name="check" size={14} className="mt-0.5 shrink-0 text-brand/85" strokeWidth={2.5} />
            <span className="min-w-0">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? 'primary' : 'ghost'}
        icon="cart"
        onClick={onOrder}
        className="mt-5 w-full"
      >
        Order Now
      </Button>
    </article>
  );
}
