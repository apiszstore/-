import { priceLabel } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import StatusBadge from './StatusBadge.jsx';

/** Detail layanan: dipakai dari kartu Digital Service, SA-MP, dan Other. */
export default function ServiceDetailModal({ service, onClose, onOrder }) {
  if (!service) return null;

  return (
    <Modal open onClose={onClose} labelledBy="service-detail-title">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="border-b border-line px-5 py-5 pr-14 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-brand/25 bg-brand/10 text-brand">
              <Icon name={service.icon} size={19} />
            </span>
            <div className="min-w-0">
              <h2 id="service-detail-title" className="text-lg font-bold">
                {service.name}
              </h2>
              <p className="mt-0.5 text-[12px] font-semibold tracking-wide text-brand uppercase">Starting Price</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-2xl font-bold text-brand">{priceLabel(service.price)}</p>
            <StatusBadge status={service.status} />
          </div>

          {service.description ? <p className="text-[14px] leading-relaxed text-muted">{service.description}</p> : null}

          {service.features?.length ? (
            <DetailGroup title="Features" icon="check">
              <ul className="flex flex-col gap-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13.5px] leading-snug text-muted">
                    <Icon name="check" size={14} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.5} />
                    <span className="min-w-0">{feature}</span>
                  </li>
                ))}
              </ul>
            </DetailGroup>
          ) : null}

          {service.requirements?.length ? (
            <DetailGroup title="Requirements" icon="info">
              <ul className="flex flex-col gap-1.5">
                {service.requirements.map((item) => (
                  <li key={item} className="text-[13.5px] leading-snug text-muted">
                    · {item}
                  </li>
                ))}
              </ul>
            </DetailGroup>
          ) : null}

          {service.notes ? (
            <DetailGroup title="Notes" icon="alert">
              <p className="text-[13px] leading-relaxed text-muted">{service.notes}</p>
            </DetailGroup>
          ) : null}
        </div>
      </div>

      {/* Action bar sticky di bawah, selalu kelihatan di layar pendek */}
      <div className="flex shrink-0 gap-2.5 border-t border-line bg-raised/60 px-5 py-3.5 sm:px-6">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Tutup
        </Button>
        <Button icon="cart" onClick={onOrder} className="flex-1">
          Order Now
        </Button>
      </div>
    </Modal>
  );
}

function DetailGroup({ title, icon, children }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
        <Icon name={icon} size={12} className="text-brand" />
        {title}
      </h3>
      {children}
    </section>
  );
}
