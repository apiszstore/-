import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { isPlaceholder } from '../lib/links';
import { useExternalLink } from '../lib/useExternalLink';
import Icon from './Icons';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Products', to: '/products' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Showcase', to: '/showcase' },
  { label: 'Testimonial', to: '/testimonials' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { config, route, navigate } = useApp();
  const openExternal = useExternalLink();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Tutup menu mobile setiap kali route berubah. */
  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* Escape menutup menu mobile. */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const isActive = (to) => (to === '/' ? route === '/' : route === to);

  const handleOrder = () => {
    setMenuOpen(false);
    openExternal(config.order.primaryLink, 'Link order Discord APISZ STORE');
  };

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a
          className="navbar__brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            navigate('/');
          }}
        >
          <Logo size="sm" />
        </a>

        <nav className="navbar__links" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={`#${item.to}`}
              className={`navbar__link ${isActive(item.to) ? 'is-active' : ''}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.to);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle className="navbar__theme" />
          <button
            type="button"
            className="btn btn--primary btn--sm navbar__order"
            onClick={handleOrder}
          >
            {config.order.primaryLabel}
            <Icon name="arrowRight" size={16} />
          </button>
          <button
            type="button"
            className={`navbar__burger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="navbar-mobile-menu"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div
        id="navbar-mobile-menu"
        className={`navbar__mobile ${menuOpen ? 'is-open' : ''}`}
      >
        <nav aria-label="Navigasi mobile">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={`#${item.to}`}
              className={`navbar__mobile-link ${isActive(item.to) ? 'is-active' : ''}`}
              style={{ transitionDelay: `${index * 40}ms` }}
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen(false);
                navigate(item.to);
              }}
            >
              {item.label}
              <Icon name="arrowRight" size={16} />
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn--primary btn--md navbar__mobile-order"
          onClick={handleOrder}
        >
          {config.order.primaryLabel}
          <Icon name="arrowRight" size={16} />
        </button>
        <p className="navbar__mobile-note">
          {isPlaceholder(config.social.discord.invite)
            ? 'Discord: belum dikonfigurasi'
            : `Discord: ${config.social.discord.label}`}
        </p>
      </div>
    </header>
  );
}
