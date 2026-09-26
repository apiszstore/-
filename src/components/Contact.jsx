import { useApp } from '../context/AppContext';
import { isPlaceholder, toWhatsAppLink } from '../lib/links';
import { useExternalLink } from '../lib/useExternalLink';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const SOCIAL_ITEMS = [
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
];

/** Section CONTACT US. */
export default function Contact() {
  const { config, openOrder } = useApp();
  const openExternal = useExternalLink();
  const { discord, whatsapp } = config.social;
  const waLink = toWhatsAppLink(whatsapp.link);

  return (
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="CONTACT"
            title="CONTACT US"
            subtitle="Paling cepat respons lewat Discord. Buat ticket, admin akan membalas."
          />
        </Reveal>

        <div className="contact__grid">
          <Reveal className="card contact-card">
            <span className="contact-card__icon contact-card__icon--discord">
              <Icon name="discord" size={24} />
            </span>
            <h3 className="contact-card__title">Discord</h3>
            <p className="contact-card__label">{discord.label}</p>
            <p className="contact-card__value">
              {isPlaceholder(discord.invite) ? 'Invite belum diatur' : discord.invite}
            </p>
            <Button
              type="primary"
              size="sm"
              onClick={() => openExternal(discord.invite, 'Link Discord APISZ STORE')}
              iconRight={<Icon name="arrowRight" size={15} />}
            >
              JOIN DISCORD
            </Button>
          </Reveal>

          <Reveal delay={70} className="card contact-card">
            <span className="contact-card__icon contact-card__icon--wa">
              <Icon name="whatsapp" size={24} />
            </span>
            <h3 className="contact-card__title">WhatsApp</h3>
            <p className="contact-card__label">{whatsapp.label}</p>
            <p className="contact-card__value">
              {isPlaceholder(whatsapp.link) ? 'Nomor belum tersedia' : whatsapp.link}
            </p>
            <Button
              type="soft"
              size="sm"
              onClick={() => openExternal(waLink, 'Link WhatsApp APISZ STORE')}
              iconRight={<Icon name="arrowRight" size={15} />}
            >
              CHAT ADMIN
            </Button>
          </Reveal>

          <Reveal delay={140} className="card contact-card">
            <span className="contact-card__icon contact-card__icon--social">
              <Icon name="share" size={24} />
            </span>
            <h3 className="contact-card__title">Social Media</h3>
            <p className="contact-card__label">Official APISZ STORE</p>
            <div className="contact-card__socials">
              {SOCIAL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="social-btn"
                  onClick={() => openExternal(config.social[item.id], `Link ${item.label} APISZ STORE`)}
                  aria-label={item.label}
                >
                  <Icon name={item.icon} size={18} />
                </button>
              ))}
            </div>
            <p className="contact-card__hint">Link akan aktif setelah diatur di config.</p>
          </Reveal>
        </div>

        <Reveal>
          <div className="contact__cta">
            <div>
              <h3 className="contact__cta-title">Punya kebutuhan khusus?</h3>
              <p className="contact__cta-text">
                Jelaskan request-mu, admin akan bantu estimasi harga dan waktu pengerjaan.
              </p>
            </div>
            <Button
              type="primary"
              size="lg"
              onClick={() => openOrder({ title: 'Custom Request' })}
              iconRight={<Icon name="arrowRight" size={18} />}
            >
              CUSTOM REQUEST
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
