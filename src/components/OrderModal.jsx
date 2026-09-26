import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { isPlaceholder, toWhatsAppLink } from '../lib/links';
import { useExternalLink } from '../lib/useExternalLink';
import { copyText } from '../lib/clipboard';
import Icon from './Icons';
import Modal from './Modal';

/** Daftar channel/platform untuk dipilih user. */
const PLATFORMS = [
  {
    id: 'discord',
    label: 'Discord',
    hint: 'Direkomendasikan',
    icon: 'discord',
    configKey: 'discord',
  },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Segera hadir', icon: 'whatsapp', configKey: 'whatsapp' },
  { id: 'tiktok', label: 'TikTok', hint: 'Komentar / DM', icon: 'tiktok', configKey: 'tiktok' },
  { id: 'instagram', label: 'Instagram', hint: 'DM', icon: 'instagram', configKey: 'instagram' },
  { id: 'youtube', label: 'YouTube', hint: 'Komentar', icon: 'youtube', configKey: 'youtube' },
];

/** Alur order: pilih layanan -> pilih platform -> diarahkan ke Discord. */
export default function OrderModal() {
  const { config, orderItem, closeOrder, openOrder } = useApp();
  const openExternal = useExternalLink();
  const { notify } = useToast();

  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState('discord');
  const [note, setNote] = useState('');

  /* Reset modal setiap kali dibuka dengan item baru. */
  useEffect(() => {
    if (orderItem) {
      setStep(0);
      setPlatform('discord');
      setNote('');
    }
  }, [orderItem]);

  const message = useMemo(() => {
    if (!orderItem) return '';
    const lines = [
      `Halo ${config.social.discord.label}, saya ingin order:`,
      '',
      `Layanan: ${orderItem.title}`,
    ];
    if (orderItem.subtitle) lines.push(`Detail: ${orderItem.subtitle}`);
    if (orderItem.price) lines.push(`Estimasi harga: ${orderItem.price}`);
    if (note.trim()) lines.push('', `Catatan: ${note.trim()}`);
    lines.push('', 'Dikirim dari website APISZ STORE.');
    return lines.join('\n');
  }, [orderItem, note, config.social.discord.label]);

  if (!orderItem) return null;

  const getLink = (platformId) => {
    const item = PLATFORMS.find((p) => p.id === platformId);
    if (!item) return '';
    const raw = config.social[item.configKey];
    const value = typeof raw === 'string' ? raw : raw?.link || raw?.invite || '';
    return item.id === 'whatsapp' ? toWhatsAppLink(value) : value;
  };

  const link = getLink(platform);
  const isReady = !isPlaceholder(link);

  const handleCopy = async () => {
    const ok = await copyText(message);
    notify(ok ? 'Detail order disalin ke clipboard.' : 'Gagal menyalin. Select teks manual ya.', {
      type: ok ? 'success' : 'error',
      title: ok ? 'Tersalin' : 'Gagal',
    });
  };

  return (
    <Modal
      open
      onClose={closeOrder}
      title="ORDER FLOW"
      subtitle={config.order.message}
      size="md"
    >
      <div className="order">
        <ol className="order__steps">
          {['Layanan', 'Kontak', 'Konfirmasi'].map((label, index) => (
            <li
              key={label}
              className={`order__step ${index === step ? 'is-active' : ''} ${
                index < step ? 'is-done' : ''
              }`}
            >
              <span className="order__step-num">{index < step ? '✓' : index + 1}</span>
              <span className="order__step-label">{label}</span>
            </li>
          ))}
        </ol>

        {/* STEP 1 - LAYANAN */}
        {step === 0 ? (
          <div className="order__panel">
            <div className="order__selected">
              <span className="order__selected-label">Layanan dipilih</span>
              <strong>{orderItem.title}</strong>
              {orderItem.subtitle ? <p>{orderItem.subtitle}</p> : null}
              {orderItem.price ? (
                <span className="order__selected-price">{orderItem.price}</span>
              ) : null}
            </div>

            <label className="field">
              <span className="field__label">Detail request (opsional)</span>
              <textarea
                className="field__input"
                rows={4}
                value={note}
                placeholder="Contoh: butuh 5 channel produk, 3 role, sekalian bot ban."
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <div className="order__nav">
              <button type="button" className="btn btn--ghost btn--md" onClick={closeOrder}>
                Batal
              </button>
              <button type="button" className="btn btn--primary btn--md" onClick={() => setStep(1)}>
                Lanjut
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {/* STEP 2 - KONTAK */}
        {step === 1 ? (
          <div className="order__panel">
            <p className="order__hint">Pilih tempat untuk melanjutkan order.</p>
            <div className="order__platforms">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`order__platform ${platform === item.id ? 'is-active' : ''}`}
                  onClick={() => setPlatform(item.id)}
                >
                  <span className="order__platform-icon">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="order__platform-text">
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="order__nav">
              <button type="button" className="btn btn--ghost btn--md" onClick={() => setStep(0)}>
                <Icon name="arrowRight" size={16} className="flip" /> Kembali
              </button>
              <button type="button" className="btn btn--primary btn--md" onClick={() => setStep(2)}>
                Lanjut
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {/* STEP 3 - KONFIRMASI */}
        {step === 2 ? (
          <div className="order__panel">
            <p className="order__hint">
              Salin detail order di bawah, lalu kirim ke admin. Configurasi payment gateway belum
              tersedia, jadi pembayaran dikonfirmasi manual setelah detail pesanan disetujui.
            </p>

            <pre className="order__preview">{message}</pre>

            <div className="order__actions">
              <button type="button" className="btn btn--soft btn--md" onClick={handleCopy}>
                <Icon name="copy" size={16} /> Salin Detail
              </button>
              <button
                type="button"
                className="btn btn--primary btn--md"
                onClick={() => openExternal(config.social.discord.invite, 'Link Discord APISZ STORE')}
              >
                <Icon name="discord" size={17} /> ORDER VIA DISCORD
              </button>
              <button
                type="button"
                className="btn btn--outline btn--md"
                onClick={() => openExternal(getLink(platform), `Link ${platform} APISZ STORE`)}
              >
                <Icon name="chat" size={17} /> CONTACT ADMIN
              </button>
            </div>

            {!isReady ? (
              <p className="order__warn">
                <Icon name="info" size={15} />
                <span>
                  Link {platform.toUpperCase()} belum diatur di <code>src/config.js</code>, jadi
                  belum bisa dibuka.
                </span>
              </p>
            ) : null}

            <div className="order__nav">
              <button type="button" className="btn btn--ghost btn--md" onClick={() => setStep(1)}>
                <Icon name="arrowRight" size={16} className="flip" /> Kembali
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--md"
                onClick={() => openOrder({ title: 'Custom Request' })}
              >
                Ubah layanan
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
