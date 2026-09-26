import { useEffect, useState } from 'react';
import { navItems, siteConfig } from '../config/site.js';
import { scrollToSection } from '../lib/scroll.js';
import { useOrder } from '../hooks/useOrder.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState(navItems[0].id);
  const order = useOrder();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);

      /* Scroll-spy: section terakhir yang puncaknya sudah lewat garis navbar.
         Offset harus lebih besar dari `scroll-padding-top` (6rem) di index.css,
         kalau tidak section yang baru arrived belum ikut terhitung. */
      const offset = 120;
      let current = navItems[0].id;
      for (const item of navItems) {
        const node = document.getElementById(item.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top - offset <= 0) current = item.id;
      }
      /* Section terakhir hanya aktif kalau benar-benar sampai bawah. */
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = navItems[navItems.length - 1].id;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* Kunci scroll halaman selama menu mobile terbuka. */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  /* Escape menutup menu. */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const go = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? 'border-line bg-raised/85 backdrop-blur-xl'
          : 'border-transparent bg-raised/55 backdrop-blur-md'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <button
          type="button"
          onClick={() => go('home')}
          className="flex min-h-10 shrink-0 items-center rounded-md px-1 py-1"
          aria-label="Kembali ke atas"
        >
          <Logo size="sm" />
        </button>

        {/* Desktop */}
        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`min-h-10 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${
                      active ? 'bg-brand/12 text-brand' : 'text-muted hover:bg-white/5 hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon="cart"
            onClick={() => order()}
            className="hidden sm:inline-flex"
          >
            {siteConfig.order.label}
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface/70 text-ink transition-colors hover:border-brand/50 hover:text-brand lg:hidden"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-line bg-raised transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          menuOpen ? 'max-h-[calc(100dvh-4rem)] border-t opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain py-4">
          <nav aria-label="Navigasi mobile">
            <ul className="flex flex-col">
              {navItems.map((item) => {
                const active = activeId === item.id;
                return (
                  <li key={item.id} className="border-b border-line-soft last:border-0">
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex min-h-11 w-full items-center justify-between py-3.5 text-left text-[15px] font-medium transition-colors ${
                        active ? 'text-brand' : 'text-ink hover:text-brand'
                      }`}
                    >
                      {item.label}
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={active ? '-rotate-90 text-brand' : '-rotate-90 text-faint'}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Button
            size="md"
            icon="cart"
            onClick={() => {
              setMenuOpen(false);
              order();
            }}
            className="mt-4 w-full sm:hidden"
          >
            {siteConfig.order.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
