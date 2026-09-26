import { useApp } from '../context/AppContext';
import { useExternalLink } from '../lib/useExternalLink';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';

/** Banner promosi (STUDENT FRIENDLY PRICE + CUSTOM REQUEST). */
export default function Promotion() {
  const { config, navigate, openOrder } = useApp();
  const openExternal = useExternalLink();

  return (
    <section className="section promotion">
      <div className="container">
        <div className="promotion__stack">
          <Reveal>
            <article className="banner banner--primary">
              <div className="banner__content">
                <span className="banner__eyebrow">
                  <Icon name="cap" size={15} /> PROMO
                </span>
                <h3 className="banner__title">STUDENT FRIENDLY PRICE</h3>
                <p className="banner__text">
                  Jasa digital dengan harga terjangkau untuk pelajar.
                </p>
                <Button
                  type="soft"
                  size="md"
                  onClick={() => navigate('/services')}
                  iconRight={<Icon name="arrowRight" size={16} />}
                >
                  SEE OUR SERVICES
                </Button>
              </div>
              <div className="banner__art" aria-hidden="true">
                <span className="banner__chip banner__chip--1">DISCORD</span>
                <span className="banner__chip banner__chip--2">SA-MP</span>
                <span className="banner__chip banner__chip--3">BOT</span>
                <span className="banner__ring" />
              </div>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="banner banner--ghost">
              <div className="banner__content">
                <span className="banner__eyebrow">
                  <Icon name="sliders" size={15} /> CUSTOM
                </span>
                <h3 className="banner__title">CUSTOM REQUEST?</h3>
                <p className="banner__text">
                  Punya kebutuhan khusus? Hubungi kami untuk mendapatkan harga custom.
                </p>
                <div className="banner__actions">
                  <Button
                    type="outline"
                    size="md"
                    onClick={() => openOrder({ title: 'Custom Request' })}
                    iconRight={<Icon name="arrowRight" size={16} />}
                  >
                    CONTACT US
                  </Button>
                  <Button
                    type="ghost"
                    size="md"
                    onClick={() => openExternal(config.social.discord.invite, 'Link Discord APISZ STORE')}
                    icon={<Icon name="discord" size={18} />}
                  >
                    JOIN DISCORD
                  </Button>
                </div>
              </div>
              <div className="banner__art banner__art--alt" aria-hidden="true">
                <span className="banner__ring" />
                <span className="banner__chip banner__chip--1">CUSTOM</span>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
