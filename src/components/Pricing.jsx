import { CUSTOM_PRICING_LABEL, pricingRows, pricingCustomRows } from '../data/pricing.js';
import { priceLabel } from '../lib/format.js';
import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

/**
 * Tabel harga.
 *
 * Semua baris diambil dari data layanan, jadi mengubah `price`
 * di src/data/*.js otomatis memperbarui section ini.
 * Layanan tanpa harga ditampilkan sebagai "Custom Pricing".
 */
export default function Pricing() {
  const order = useOrder();

  const customRows = pricingCustomRows;

  return (
    <Section id="pricing" tone="base">
      <SectionHeading
        eyebrow="Pricing"
        title="Simple & Affordable Pricing"
        subtitle="Harga di bawah adalah harga mulai. Harga final bisa berbeda sesuai tingkat kesulitan dan kebutuhan custom."
        align="center"
      />

      <div className="mt-10 overflow-hidden rounded-md border border-line bg-surface">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Daftar harga layanan APISZ STORE</caption>
          <thead>
            <tr className="border-b border-line bg-raised/60">
              <th scope="col" className="px-4 py-3 text-[11px] font-bold tracking-[0.14em] text-faint uppercase sm:px-6">
                Service
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.14em] text-faint uppercase sm:px-6"
              >
                Starting Price
              </th>
            </tr>
          </thead>
          <tbody>
            {pricingRows.map((row) => (
              <tr key={row.id} className="border-b border-line-soft last:border-0 transition-colors hover:bg-brand/[0.04]">
                <th scope="row" className="px-4 py-3.5 text-[14px] font-medium sm:px-6">
                  {row.name}
                  <span className="mt-0.5 block text-[11.5px] font-normal text-faint">{row.group}</span>
                </th>
                <td className="px-4 py-3.5 text-right text-[15px] font-bold whitespace-nowrap text-brand sm:px-6">
                  {priceLabel(row.price)}
                </td>
              </tr>
            ))}

            {customRows.map((row) => (
              <tr key={row.id} className="border-b border-line-soft last:border-0">
                <th scope="row" className="px-4 py-3.5 text-[14px] font-medium sm:px-6">
                  {row.name}
                  <span className="mt-0.5 block text-[11.5px] font-normal text-faint">{row.group}</span>
                </th>
                <td className="px-4 py-3.5 text-right text-[14px] whitespace-nowrap text-muted sm:px-6">
                  {CUSTOM_PRICING_LABEL}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Reveal className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <p className="text-[13px] text-faint">Punya kebutuhan khusus? Diskusikan dulu sebelum order.</p>
        <Button size="sm" icon="cart" onClick={() => order()}>
          Order Now
        </Button>
      </Reveal>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-faint">
        <Icon name="info" size={13} />
        Harga dalam Rupiah. Harga final bisa berbeda tergantung scope project.
      </p>
    </Section>
  );
}
