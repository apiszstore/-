import { isPlaceholder, siteConfig } from '../config/site.js';
import { useSafeLink } from '../hooks/useOrder.js';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

/**
 * Metode pembayaran.
 *
 * Nominal DANA/GoPay dan QR code SENGAJA tidak ditampilkan —
 * placeholder-nya masih kosong di src/config/site.js.
 */

const METHODS = [
  { id: 'dana', name: 'DANA', tone: 'text-[#4ade9f]', mark: 'DANA' },
  { id: 'gopay', name: 'GoPay', tone: 'text-[#6fc4ee]', mark: 'gopay' },
  { id: 'qris', name: 'QRIS', tone: 'text-ink', mark: 'QRIS' },
];

export default function Payment() {
  const openLink = useSafeLink();

  return (
    <Section id="payment" tone="base">
      <SectionHeading
        eyebrow="Payment"
        title="Payment Methods"
        subtitle="Detail pembayaran akan diberikan melalui proses order."
        align="center"
      />

      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
        {METHODS.map((method, index) => (
          <Reveal key={method.id} delay={index * 70}>
            <div className="flex h-full flex-col items-center gap-2 rounded-md border border-line bg-surface px-4 py-6 text-center">
              <span className={`font-display text-lg font-bold tracking-tight ${method.tone}`}>
                {method.mark}
              </span>
              <p className="text-[13px] text-muted">Nomor belum ditampilkan</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-6 flex max-w-2xl flex-col items-start gap-3 rounded-md border border-line bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
          <Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand" />
          Detail pembayaran akan diberikan melalui proses order.
        </p>
        <button
          type="button"
          onClick={() => openLink(siteConfig.discord, 'Discord')}
          className="-my-1 inline-flex min-h-11 shrink-0 items-center rounded-md px-1 text-[13px] font-semibold text-brand underline-offset-4 hover:underline"
        >
          Tanya via Discord
        </button>
      </Reveal>
    </Section>
  );
}
