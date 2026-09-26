import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';

const STEPS = [
  {
    number: '01',
    title: 'Choose',
    text: 'Pilih produk atau layanan yang kamu butuhkan.',
    icon: 'cart',
  },
  {
    number: '02',
    title: 'Contact',
    text: 'Klik tombol Order Now.',
    icon: 'external',
  },
  {
    number: '03',
    title: 'Discuss',
    text: 'Diskusikan detail kebutuhan melalui Discord.',
    icon: 'info',
  },
  {
    number: '04',
    title: 'Start',
    text: 'Setelah detail dan harga disepakati, project mulai dikerjakan.',
    icon: 'checkCircle',
  },
];

export default function HowToOrder() {
  const order = useOrder();

  return (
    <Section id="order" tone="raised">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand uppercase">How To Order</p>
        <h2 className="text-2xl font-bold sm:text-3xl">Empat Langkah Sederhana</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Tidak ada checkout yang rumit. Diskusi dulu, deal harga, baru project jalan.
        </p>
      </div>

      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <Reveal as="li" key={step.number} delay={index * 80} className="relative h-full">
            <div className="flex h-full flex-col rounded-md border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-brand/35">{step.number}</span>
                <span className="grid size-9 place-items-center rounded-md border border-line bg-well text-brand">
                  <Icon name={step.icon} size={17} />
                </span>
              </div>
              <h3 className="mt-3 text-[15.5px] font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <Button size="lg" icon="cart" onClick={() => order()}>
          Order Now
        </Button>
      </div>
    </Section>
  );
}
