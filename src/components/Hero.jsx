import { useApp } from '../context/AppContext';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';

/** Mockup dashboard/store, dibuat dengan CSS supaya ringan tanpa file gambar. */
function StoreMockup() {
  const rows = [
    { name: 'Discord Server Setup', price: 'Rp10.000', tone: 'blue' },
    { name: 'Custom Discord Bot', price: 'Rp20.000', tone: 'violet' },
    { name: 'Jasa On Server', price: 'Rp5.000', tone: 'cyan' },
  ];

  return (
    <div className="mockup" aria-hidden="true">
      <div className="mockup__glow" />
      <div className="mockup__window">
        <div className="mockup__bar">
          <span className="mockup__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="mockup__url">apisz.store</span>
        </div>
        <div className="mockup__body">
          <div className="mockup__side">
            <span className="mockup__side-title">APISZ</span>
            <span className="mockup__side-item is-active" />
            <span className="mockup__side-item" />
            <span className="mockup__side-item" />
            <span className="mockup__side-item" />
            <span className="mockup__side-item" />
          </div>
          <div className="mockup__main">
            <div className="mockup__head">
              <div>
                <span className="mockup__kicker">STORE</span>
                <span className="mockup__title">Layanan Digital</span>
              </div>
              <span className="mockup__pill">OPEN</span>
            </div>
            <div className="mockup__stats">
              <div className="mockup__stat">
                <span className="mockup__stat-value">50+</span>
                <span className="mockup__stat-label">Projects</span>
              </div>
              <div className="mockup__stat">
                <span className="mockup__stat-value">30+</span>
                <span className="mockup__stat-label">Customers</span>
              </div>
              <div className="mockup__stat">
                <span className="mockup__stat-value">10+</span>
                <span className="mockup__stat-label">Services</span>
              </div>
            </div>
            <div className="mockup__rows">
              {rows.map((row) => (
                <div className="mockup__row" key={row.name}>
                  <span className={`mockup__row-icon mockup__row-icon--${row.tone}`}>
                    <Icon name="spark" size={14} />
                  </span>
                  <span className="mockup__row-name">{row.name}</span>
                  <span className="mockup__row-price">{row.price}</span>
                </div>
              ))}
            </div>
            <div className="mockup__chart">
              <span style={{ height: '38%' }} />
              <span style={{ height: '62%' }} />
              <span style={{ height: '48%' }} />
              <span style={{ height: '80%' }} />
              <span style={{ height: '58%' }} />
              <span style={{ height: '92%' }} />
              <span style={{ height: '70%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mockup__float mockup__float--a">
        <span className="mockup__float-icon">
          <Icon name="check" size={14} />
        </span>
        <span>
          <strong>Order received</strong>
          <small>via Discord ticket</small>
        </span>
      </div>
      <div className="mockup__float mockup__float--b">
        <span className="mockup__float-icon mockup__float-icon--alt">
          <Icon name="bolt" size={14} />
        </span>
        <span>
          <strong>Fast response</strong>
          <small>student friendly</small>
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  const { config, navigate, openOrder } = useApp();

  return (
    <section className="hero" id="home">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__orb hero__orb--1" />
        <span className="hero__orb hero__orb--2" />
        <span className="hero__grid" />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <Reveal>
            <span className="pill">
              <Icon name="spark" size={14} />
              {config.tagline}
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="hero__title">
              BUILD YOUR DIGITAL PROJECT WITH <span className="text-gradient">APISZ</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="hero__subtitle">
              Jasa Discord, Bot, Website, dan SA-MP dengan harga terjangkau untuk kebutuhan personal
              maupun server.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="hero__actions">
              <Button
                type="primary"
                size="lg"
                icon={<Icon name="ticket" size={18} />}
                onClick={() => openOrder({ title: 'Custom Request' })}
              >
                ORDER NOW
              </Button>
              <Button
                type="outline"
                size="lg"
                icon={<Icon name="layout" size={18} />}
                onClick={() => navigate('/services')}
              >
                VIEW SERVICES
              </Button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="hero__note">
              <Icon name="info" size={16} />
              <span>{config.shortDescription}</span>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <ul className="hero__stats">
              {config.stats.map((stat) => (
                <li className="hero__stat" key={stat.id}>
                  <span className="hero__stat-value">{stat.value}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={140} className="hero__visual">
          <StoreMockup />
        </Reveal>
      </div>

      <div className="hero__bottom container">
        <span>Discord</span>
        <span>SA-MP</span>
        <span>Bot</span>
        <span>Textdraw</span>
        <span>Filescript</span>
        <span>Mapping</span>
        <span>Website</span>
      </div>
    </section>
  );
}
