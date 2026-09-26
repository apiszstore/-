import { useApp } from '../context/AppContext';
import { isPlaceholder, toWhatsAppLink } from '../lib/links';
import { useExternalLink } from '../lib/useExternalLink';
import Icon from './Icons';
import Logo from './Logo';

const LINK_GROUPS = [
  {
    id: 'menu',
    title: 'Menu',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Services', to: '/services' },
      { label: 'Products', to: '/products' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    id: 'more',
    title: 'More',
    links: [
      { label: 'Showcase', to: '/showcase' },
      { label: 'Testimonial', to: '/testimonials' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

const SOCIALS = [
  { id: 'discord', label: 'Discord', icon: 'discord' },
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
];

/** Footer website. */
export default function Footer() {
  const { config, navigate } = useApp();
  const openExternal = useExternalLink();
  const { discord, whatsapp } = config.social;
  const waLink = toWhatsAppLink(whatsapp.link);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo size="md" showTagline />
            <p className="footer__desc">{config.shortDescription}</p>
            <div className="footer__socials">
              {SOCIALS.map((item) => {
                const link = item.id === 'discord' ? discord.invite : config.social[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="social-btn"
                    onClick={() => openExternal(link, `Link ${item.label} APISZ STORE`)}
                    aria-label={item.label}
                  >
                    <Icon name={item.icon} size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav className="footer__col" key={group.id} aria-label={group.title}>
              <h3 className="footer__col-title">{group.title}</h3>
              <ul className="footer__links">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      className="footer__link"
                      onClick={() => navigate(link.to)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer__col">
            <h3 className="footer__col-title">Contact</h3>
            <ul className="footer__links">
              <li>
                <button
                  type="button"
                  className="footer__link"
                  onClick={() => openExternal(discord.invite, 'Link Discord APISZ STORE')}
                >
                  Discord: {discord.label}
                </button>
              </li>
              <li className="footer__link is-muted">
                WhatsApp: {isPlaceholder(whatsapp.link) ? whatsapp.label : whatsapp.link}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            &copy; {config.copyrightYear} {config.storeName}. All rights reserved.
          </p>
          <p className="footer__credit">{config.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
