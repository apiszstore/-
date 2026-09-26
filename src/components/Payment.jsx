import { useState } from 'react';
import { paymentMethods } from '../data/payment.js';
import { siteConfig } from '../config/site.js';
import { useSafeLink } from '../hooks/useOrder.js';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import SectionHeading from './SectionHeading.jsx';

/**
 * Metode pembayaran.
 *
 * Hanya menampilkan LOGO + NAMA (DANA, GoPay, QRIS).
 * Tidak ada nomor telepon, ID, atau QR code — nominal diberikan
 * lewat proses order di Discord.
 *
 * Logo dibaca dari `src/data/payment.js`. Kalau file-nya belum ada,
 * komponen ini otomatis jatuh ke teks nama metode, jadi tidak pernah
 * menampilkan gambar rusak.
 */
export default function Payment() {
  const openLink = useSafeLink();

  return (
    <Section id="payment" tone="base">
      <SectionHeading
        eyebrow="Payment"
        title="Payment Methods"
        subtitle="Pilih salah satu metode di bawah. Detail pembayaran diberikan lewat proses order."
        align="center"
      />

      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
        {paymentMethods.map((method, index) => (
          <Reveal key={method.id} delay={index * 70}>
            <PaymentCard {...method} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-6 flex max-w-2xl flex-col items-start gap-3 rounded-md border border-line bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
          <Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand" />
          Nominal dan cara pembayaran dikirim setelah detail project disepakati.
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

function PaymentCard({ id, name, logo, fallback }) {
  return (
    <div
      data-payment={id}
      className="flex h-full flex-col items-center justify-center gap-3 rounded-md border border-line bg-surface px-4 py-6 text-center transition-colors hover:border-brand/40"
    >
      <PaymentLogo src={logo} alt={`Logo ${name}`} fallback={fallback ?? name} />
      <p className="font-display text-[15px] font-bold tracking-tight text-ink">{name}</p>
    </div>
  );
}

/**
 * Logo dengan fallback aman.
 * Kalau file-nya belum ada, tampilkan nama metode sebagai teks
 * supaya tidak pernah muncul gambar rusak.
 */
function PaymentLogo({ src, alt, fallback }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="grid h-14 w-14 place-items-center rounded-md border border-line bg-raised px-2 text-center font-display text-[11px] font-bold text-muted"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-14 w-14 rounded-md object-contain"
    />
  );
}
