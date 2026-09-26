import { siteConfig } from '../config/site.js';
import { scrollToSection } from '../lib/scroll.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import HeroMockup from './HeroMockup.jsx';

const QUICK_LINKS = [
  { label: 'Discord Setup', icon: 'server' },
  { label: 'Custom Bot', icon: 'bot' },
  { label: 'SA-MP', icon: 'terminal' },
  { label: 'Website', icon: 'globe' },
];

export default function Hero() {
  return (
    <section id="home" className="glow-field relative overflow-hidden border-b border-line bg-canvas">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Copy */}
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              {siteConfig.tagline}
            </p>

            <h1 className="mt-6 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-[3.4rem]">
              Build Your Digital World With{' '}
              <span className="text-brand">APISZ STORE</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
              Solusi digital untuk kebutuhan Discord, Custom Bot, Website, dan SA-MP dengan harga terjangkau dan
              proses yang mudah.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" iconRight="arrowRight" onClick={() => scrollToSection('services')}>
                Explore Services
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('products')}>
                View Products
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2.5">
              {QUICK_LINKS.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-[13px] text-faint">
                  <Icon name={item.icon} size={14} className="text-brand/80" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="animate-fade" style={{ animationDelay: '120ms' }}>
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
