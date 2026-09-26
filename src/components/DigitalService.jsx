import { discordBot, discordServerSetup, websiteService } from '../data/services';
import { useApp } from '../context/AppContext';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';

/** Helper: daftar bullet dengan icon centang. */
function CheckList({ items }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Icon name="check" size={15} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Baris price + tombol order. */
function PriceAction({ price, label, onOrder }) {
  return (
    <div className="price-action">
      <div className="price-action__info">
        <span className="price-action__label">Harga</span>
        <strong className="price-action__value">{price}</strong>
      </div>
      <Button type="primary" size="md" onClick={onOrder} iconRight={<Icon name="arrowRight" size={16} />}>
        {label}
      </Button>
    </div>
  );
}

/** Section DIGITAL SERVICE. */
export default function DigitalService() {
  const { openOrder } = useApp();

  const order = (title, subtitle, price, serviceId) => () =>
    openOrder({ title, subtitle, price, serviceId });

  return (
    <section className="section digital" id="digital">
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <span className="section-heading__eyebrow">DIGITAL SERVICE</span>
            <h2 className="section-heading__title">JASA DIGITAL LENGKAP</h2>
            <p className="section-heading__subtitle">
              Dari setup server Discord sampai bot custom, dikerjakan dengan Node.js + discord.js.
            </p>
          </div>
        </Reveal>

        {/* ---- DISCORD SERVER SETUP ---- */}
        <Reveal>
          <article className="card block" id="discord-setup">
            <div className="block__side">
              <span className="block__badge">
                <Icon name="discord" size={16} /> Discord Setup
              </span>
              <h3 className="block__title">{discordServerSetup.title}</h3>
              <p className="block__text">
                Server Discord dibangun dari nol: struktur channel, role, permission, embed, sampai
                bot setup. Cocok untuk toko, komunitas, dan server SA-MP.
              </p>

              <div className="block__tags">
                {discordServerSetup.serverTypes.map((type) => (
                  <span className="tag" key={type}>
                    {type}
                  </span>
                ))}
              </div>

              <PriceAction
                price={discordServerSetup.priceLabel}
                label={discordServerSetup.orderLabel}
                onOrder={order('Discord Server Setup', discordServerSetup.serverTypes.join(', '), discordServerSetup.priceLabel, 'discord-setup')}
              />
            </div>
            <div className="block__main">
              <h4 className="block__label">Fitur</h4>
              <CheckList items={discordServerSetup.features} />
              <div className="block__visual" aria-hidden="true">
                <span className="block__chip" />
                <span className="block__chip" />
                <span className="block__chip" />
                <span className="block__chip" />
              </div>
            </div>
          </article>
        </Reveal>

        {/* ---- DISCORD BOT ---- */}
        <Reveal>
          <article className="card block block--reverse" id="discord-bot">
            <div className="block__side">
              <span className="block__badge">
                <Icon name="bot" size={16} /> Custom Bot
              </span>
              <h3 className="block__title">{discordBot.title}</h3>
              <p className="block__text">{discordBot.note}</p>

              <div className="block__tags">
                {discordBot.tech.map((tech) => (
                  <span className="tag tag--accent" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>

              <PriceAction
                price={discordBot.priceLabel}
                label={discordBot.orderLabel}
                onOrder={order('Discord Bot Development', discordBot.tech.join(' + '), discordBot.priceLabel, 'discord-bot')}
              />
            </div>
            <div className="block__main">
              <h4 className="block__label">Jenis layanan</h4>
              <ul className="type-list">
                {discordBot.services.map((service) => (
                  <li key={service}>
                    <Icon name="spark" size={14} />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>

        {/* ---- WEBSITE ---- */}
        <Reveal>
          <article className="card block" id="website">
            <div className="block__side">
              <span className="block__badge">
                <Icon name="layout" size={16} /> Website
              </span>
              <h3 className="block__title">{websiteService.title}</h3>
              <p className="block__text">{websiteService.description}</p>

              <PriceAction
                price={websiteService.priceLabel}
                label={websiteService.orderLabel}
                onOrder={order('Website / Landing Page', 'Landing page / website custom', websiteService.priceLabel, 'website')}
              />
            </div>
            <div className="block__main">
              <h4 className="block__label">Termasuk</h4>
              <CheckList items={websiteService.features} />
            </div>
          </article>
        </Reveal>

        <Reveal>
          <p className="section-note">
            <Icon name="info" size={16} />
            <span>
              Semua layanan di atas bisa dikustomisasi. Kirim detail request lewat Discord untuk
              estimasi harga yang lebih pasti.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
