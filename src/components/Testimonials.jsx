import { useMemo, useState } from 'react';
import { dataDummy, testimonials } from '../data/testimonials';
import { useApp } from '../context/AppContext';
import { useExternalLink } from '../lib/useExternalLink';
import Button from './Button';
import Icon from './Icons';
import Modal from './Modal';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Bintang rating. */
function Rating({ value }) {
  return (
    <span className="rating" aria-label={`Rating ${value} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon key={index} name="star" size={14} className={index < value ? 'is-on' : ''} />
      ))}
    </span>
  );
}

function Avatar({ testimonial }) {
  if (testimonial.avatarUrl) {
    return <img className="avatar__img" src={testimonial.avatarUrl} alt={testimonial.name} loading="lazy" />;
  }
  return <span className="avatar__initials">{testimonial.avatar}</span>;
}

/** Section CUSTOMER TESTIMONIAL. */
export default function Testimonials() {
  const { config } = useApp();
  const openExternal = useExternalLink();
  const [showAll, setShowAll] = useState(false);

  const visible = useMemo(() => (showAll ? testimonials : testimonials.slice(0, 6)), [showAll]);

  return (
    <section className="section testimonials" id="testimonials">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="TESTIMONIAL"
            title="CUSTOMER TESTIMONIAL"
            subtitle="Cerita dari customer yang sudah memakai layanan APISZ STORE."
          />
        </Reveal>

        {dataDummy ? (
          <Reveal>
            <p className="section-note section-note--center section-note--soft">
              <Icon name="info" size={16} />
              <span>
                Testimoni di bawah masih data contoh. Ganti dengan testimoni asli di{' '}
                <code>src/data/testimonials.js</code>.
              </span>
            </p>
          </Reveal>
        ) : null}

        <div className="grid grid--3">
          {visible.map((item, index) => (
            <Reveal key={item.id} delay={(index % 3) * 60}>
              <article className="card tcard">
                <div className="tcard__head">
                  <span className="avatar">
                    <Avatar testimonial={item} />
                  </span>
                  <div className="tcard__id">
                    <strong>{item.name}</strong>
                    <span>{item.handle}</span>
                  </div>
                  <Rating value={item.rating} />
                </div>
                <p className="tcard__text">&ldquo;{item.text}&rdquo;</p>
                <div className="tcard__foot">
                  <span className="tcard__service">
                    <Icon name="ticket" size={13} /> {item.service}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="center">
            {testimonials.length > 6 ? (
              <Button
                type="outline"
                size="md"
                onClick={() => setShowAll((v) => !v)}
                iconRight={<Icon name={showAll ? 'chevronDown' : 'arrowRight'} size={16} />}
              >
                {showAll ? 'SHOW LESS' : 'VIEW ALL TESTIMONIALS'}
              </Button>
            ) : null}
            <Button
              type="soft"
              size="md"
              onClick={() => openExternal(config.social.discord.invite, 'Link Discord APISZ STORE')}
              icon={<Icon name="discord" size={18} />}
            >
              JOIN DISCORD
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
