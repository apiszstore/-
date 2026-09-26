import { useOrder } from '../hooks/useOrder.js';
import { scrollToSection } from '../lib/scroll.js';
import Button from './Button.jsx';
import Reveal from './Reveal.jsx';

/** CTA besar sebelum footer. */
export default function CtaSection() {
  const order = useOrder();

  return (
    <section id="contact" className="glow-field relative overflow-hidden border-t border-line bg-raised">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="text-3xl leading-tight font-bold sm:text-4xl">
              Have A Project <span className="text-brand">In Mind?</span>
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
              Mari wujudkan project kamu bersama APISZ STORE.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" icon="cart" onClick={() => order()}>
                Start Your Order
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('products')}>
                Explore Products
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
