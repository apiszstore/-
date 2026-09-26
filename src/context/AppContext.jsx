import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import storeConfig from '../config';
import { buildHash, currentPath, normalizePath } from '../lib/router';
import { scrollToId } from '../lib/scroll';
import { HOME_SECTIONS } from '../lib/sections';

const AppContext = createContext(null);

/** Route -> target scroll. */
export function getScrollTarget(path) {
  if (path === '/' || path === '/products') return 'top';
  if (path.startsWith('/product/')) return 'top';
  const id = path.replace(/^\//, '');
  return HOME_SECTIONS.includes(id) ? id : 'top';
}

export function AppProvider({ children }) {
  const [route, setRoute] = useState(() => currentPath());
  const [orderItem, setOrderItem] = useState(null);
  const [ready, setReady] = useState(false);

  /* Dengarkan perubahan URL (termasuk tombol back / forward browser). */
  useEffect(() => {
    const onHashChange = () => setRoute(currentPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /* Scroll ke section sesuai route, tapi tunggu halaman siap. */
  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => scrollToId(getScrollTarget(route)), 70);
    return () => clearTimeout(timer);
  }, [route, ready]);

  const navigate = useCallback((to) => {
    const next = normalizePath(to);
    if (next === currentPath()) {
      scrollToId(getScrollTarget(next));
      return;
    }
    if (window.location.hash !== buildHash(next)) {
      window.location.hash = buildHash(next);
    }
    setRoute(next);
  }, []);

  /** Buka alur order. item: { title, subtitle, price, serviceId } */
  const openOrder = useCallback((item) => {
    setOrderItem({
      title: item?.title || 'Custom Request',
      subtitle: item?.subtitle || '',
      price: item?.price || '',
      serviceId: item?.serviceId || '',
    });
  }, []);

  const closeOrder = useCallback(() => setOrderItem(null), []);

  const markReady = useCallback(() => setReady(true), []);

  const value = useMemo(
    () => ({ config: storeConfig, route, navigate, openOrder, closeOrder, orderItem, markReady, ready }),
    [route, navigate, openOrder, closeOrder, orderItem, markReady, ready],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider');
  return ctx;
}
