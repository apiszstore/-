import { useApp } from '../context/AppContext';
import { isPlaceholder } from '../lib/links';
import Icon from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Ikon/logo metode pembayaran dibuat dengan CSS + teks, tanpa file gambar. */
const METHOD_ICONS = {
  dana: 'DANA',
  gopay: 'GoPay',
  qris: 'QRIS',
};

/** Section PAYMENT METHOD. */
export default function Payment() {
  const { config } = useApp();
  const { methods, note } = config.payment;

  return (
    <section className="section payment" id="payment">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="PAYMENT"
            title="PAYMENT METHOD"
            subtitle="Metode pembayaran yang tersedia untuk semua jasa di APISZ STORE."
          />
        </Reveal>

        <Reveal>
          <div className="grid grid--3">
            {methods.map((method) => {
              const ready = !isPlaceholder(method.accountNumber);
              return (
                <article className="card pay-card" key={method.id}>
                  <span className={`pay-card__logo pay-card__logo--${method.id}`}>
                    {METHOD_ICONS[method.id] || method.name}
                  </span>
                  <div className="pay-card__body">
                    <h3 className="pay-card__name">{method.name}</h3>
                    {ready ? (
                      <div className="pay-card__detail">
                        <span>{method.accountName}</span>
                        <strong>{method.accountNumber}</strong>
                      </div>
                    ) : (
                      <p className="pay-card__placeholder">Nomor akan ditampilkan di sini</p>
                    )}
                  </div>
                  <span className={`pay-card__status ${ready ? 'is-ready' : ''}`}>
                    {ready ? 'READY' : 'COMING SOON'}
                  </span>
                </article>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <p className="section-note section-note--center">
            <Icon name="info" size={16} />
            <span>{note}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
