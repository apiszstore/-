import { useState } from 'react';
import { faqs } from '../data/faq';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Section FAQ dengan accordion (hanya satu terbuka pada satu waktu). */
export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq" id="faq">
      <div className="container container--narrow">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="FREQUENTLY ASKED"
            subtitle="Pertanyaan yang sering masuk. Kalau tidak ada jawabannya, langsung chat admin."
          />
        </Reveal>

        <Reveal delay={70}>
          <div className="accordion">
            {faqs.map((item, index) => {
              const isOpen = open === index;
              return (
                <div className={`accordion__item card ${isOpen ? 'is-open' : ''}`} key={item.id}>
                  <button
                    type="button"
                    className="accordion__trigger"
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="accordion__q">{item.question}</span>
                    <span className="accordion__icon">
                      <Icon name="chevronDown" size={18} />
                    </span>
                  </button>
                  <div className="accordion__panel">
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
