import { storeValues } from '../data/services';
import { useApp } from '../context/AppContext';
import Button from './Button';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Section ABOUT APISZ STORE. */
export default function About() {
  const { config, openOrder } = useApp();

  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="about__inner">
          <Reveal className="about__intro">
            <SectionHeading
              align="start"
              eyebrow="ABOUT"
              title="ABOUT APISZ STORE"
              subtitle={config.tagline}
            />
            <p className="about__text">
              APISZ STORE adalah digital service store yang menyediakan berbagai layanan Discord,
              development, website, dan SA-MP dengan fokus pada harga yang terjangkau dan pelayanan
              yang mudah untuk customer.
            </p>
            <p className="about__text about__text--muted">{config.shortDescription}</p>
            <Button
              type="primary"
              size="md"
              onClick={() => openOrder({ title: 'Custom Request' })}
              iconRight={<Icon name="arrowRight" size={16} />}
            >
              ORDER NOW
            </Button>
          </Reveal>

          <Reveal delay={90} className="about__values">
            <ul className="values">
              {storeValues.map((value) => (
                <li className="card value" key={value.id}>
                  <span className="value__icon">
                    <Icon name={value.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="value__title">{value.title}</h3>
                    <p className="value__text">{value.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
