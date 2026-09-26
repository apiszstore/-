import { footerNavItems, footerServices, siteConfig, socialLabel } from '../config/site.js';
import { useSafeLink } from '../hooks/useOrder.js';
import { scrollToSection } from '../lib/scroll.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const SOCIALS = [
  { key: 'discord', label: 'Discord' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

export default function Footer() {
  const openLink = useSafeLink();

  return (
    <footer className="border-t border-line bg-raised">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size="md" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{siteConfig.tagline}</p>
            <Button variant="primary" size="sm" icon="cart" onClick={() => openLink(siteConfig.discord, 'Discord')}>
              {siteConfig.order.label}
            </Button>
          </div>

          <FooterColumn title="Navigation">
            {footerNavItems.map((item) => (
              <FooterLink key={item.id} onClick={() => scrollToSection(item.id)}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Services">
            {footerServices.map((item) => (
              <FooterLink key={item.label} onClick={() => scrollToSection(item.id)}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Social">
            {SOCIALS.map((social) => (
              <li key={social.key}>
                <button
                  type="button"
                  onClick={() => openLink(siteConfig.social[social.key], social.label)}
                  className="group flex min-h-10 w-full items-center justify-between gap-2 py-2 text-left text-sm text-muted transition-colors hover:text-brand"
                >
                  {social.label}
                  <span className="text-[11px] text-faint group-hover:text-brand/70">
                    {socialLabel(siteConfig.social[social.key])}
                  </span>
                </button>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-faint">{siteConfig.copyright}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-faint">
            <Icon name="info" size={14} />
            Harga &amp; status bisa berubah, konfirmasi lewat Discord.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold tracking-[0.16em] text-ink uppercase">{title}</h3>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-10 w-full items-center py-2 text-left text-sm text-muted transition-colors hover:text-brand"
      >
        {children}
      </button>
    </li>
  );
}
