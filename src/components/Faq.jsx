import { useState } from 'react';
import { faqs } from '../data/faq.js';
import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

export default function Faq() {
  const [open, setOpen] = useState(faqs[0]?.id ?? null);
  const order = useOrder();

  return (
    <Section id="faq" tone="base">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            subtitle="Pertanyaan yang paling sering masuk. Kalau belum terjawab, tanya langsung lewat Discord."
          />
          <Button size="md" icon="cart" onClick={() => order()} className="mt-6">
            Order Now
          </Button>
        </div>

        <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {faqs.map((faq, index) => {
            const expanded = open === faq.id;
            return (
              <Reveal key={faq.id} delay={index * 45}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : faq.id)}
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${faq.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand/[0.04]"
                  >
                    <span className="text-[14.5px] font-semibold">{faq.question}</span>
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full border border-line text-brand transition-transform duration-200 ${
                        expanded ? 'rotate-180 border-brand/45' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <Icon name="chevronDown" size={15} />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-panel-${faq.id}`}
                  hidden={!expanded}
                  className="px-5 pb-4.5 text-[13.5px] leading-relaxed text-muted"
                >
                  {faq.answer}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
