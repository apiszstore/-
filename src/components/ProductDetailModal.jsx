import { priceLabel } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import { ProductThumb } from './ProductCard.jsx';

export default function ProductDetailModal({ product, onClose, onOrder }) {
  if (!product) return null;

  return (
    <Modal open onClose={onClose} labelledBy="product-detail-title">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Image */}
        <div className="h-44 w-full border-b border-line sm:h-52">
          <ProductThumb product={product} />
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-brand uppercase">{product.category}</p>
            <h2 id="product-detail-title" className="mt-1.5 text-xl font-bold">
              {product.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-well/60 px-4 py-3">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.14em] text-faint uppercase">Price</p>
              <p className="mt-0.5 text-xl font-bold text-brand">{priceLabel(product.price)}</p>
            </div>
            <StatusBadge status={product.status} />
          </div>

          {product.description ? (
            <Group title="Description" icon="info">
              <p className="text-[13.5px] leading-relaxed text-muted">{product.description}</p>
            </Group>
          ) : null}

          {product.features?.length ? (
            <Group title="Features" icon="check">
              <ul className="flex flex-col gap-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13.5px] leading-snug text-muted">
                    <Icon name="check" size={14} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.5} />
                    <span className="min-w-0">{feature}</span>
                  </li>
                ))}
              </ul>
            </Group>
          ) : null}

          {product.requirements?.length ? (
            <Group title="Requirements" icon="alert">
              <ul className="flex flex-col gap-1.5">
                {product.requirements.map((item) => (
                  <li key={item} className="text-[13.5px] leading-snug text-muted">
                    · {item}
                  </li>
                ))}
              </ul>
            </Group>
          ) : null}

          {product.notes ? (
            <Group title="Notes" icon="info">
              <p className="text-[13px] leading-relaxed text-muted">{product.notes}</p>
            </Group>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-2.5 border-t border-line bg-raised/60 px-5 py-3.5 sm:px-6">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Tutup
        </Button>
        <Button icon="cart" onClick={() => onOrder(product)} className="flex-1">
          Order Now
        </Button>
      </div>
    </Modal>
  );
}

function Group({ title, icon, children }) {
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
