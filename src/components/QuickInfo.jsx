import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

/**
 * Info singkat di bawah hero.
 * Sengaja tanpa angka (jumlah customer/order/rating) karena
 * datanya belum ada — lihat testimonials.js.
 */

const ITEMS = [
  {
    icon: 'cart',
    title: 'Affordable',
    text: 'Harga ramah untuk pelajar.',
  },
  {
    icon: 'wand',
    title: 'Custom',
    text: 'Layanan dapat disesuaikan dengan kebutuhan.',
  },
  {
    icon: 'info',
    title: 'Support',
    text: 'Customer dapat berdiskusi sebelum melakukan order.',
  },
];

export default function QuickInfo() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="container-page py-10 sm:py-12">
        <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {ITEMS.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 80} className="flex gap-3.5">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-brand/25 bg-brand/10 text-brand">
                <Icon name={item.icon} size={17} />
              </span>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink">{item.title}</h2>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
