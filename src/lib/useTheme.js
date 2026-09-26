import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'apisz-theme';
const THEMES = ['dark', 'light'];

function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme() {
  if (typeof document === 'undefined') return 'dark';
  // Di-set oleh script anti-FOUC di index.html, jadi biasanya sudah benar.
  const applied = document.documentElement.dataset.theme;
  if (THEMES.includes(applied)) return applied;
  return readStored() || systemTheme();
}

function applyTheme(theme, preference) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f2f0eb' : '#0a0a0b');
}

/**
 * Dark/light mode.
 *
 * Preferensi hanya disimpan setelah pengguna menekan toggle. Selama belum ada
 * preferensi tersimpan, situs mengikuti prefers-color-scheme dan ikut berubah
 * realtime ketika tema OS diganti. Script inline di index.html sudah menerapkan
 * tema sebelum React mount supaya tidak ada kedipan.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(resolveTheme);

  // Explicit = ada preferensi tersimpan, atau pengguna sudah menekan toggle.
  const explicit = useRef(null);
  if (explicit.current === null) explicit.current = readStored() !== null;

  useEffect(() => {
    applyTheme(theme, explicit.current ? theme : 'system');
    if (!explicit.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* mode privat: tema tetap jalan, hanya tidak diingat */
    }
  }, [theme]);

  /* Ikuti perubahan preferensi sistem selama pengguna belum memilih manual. */
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!media) return undefined;
    const onChange = (event) => {
      if (explicit.current) return;
      setThemeState(event.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    explicit.current = true;
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    explicit.current = true;
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  /* Nyalakan transisi hanya seketika tema diganti, lalu lepas lagi. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-theme-switching');
    const timer = window.setTimeout(() => root.classList.remove('is-theme-switching'), 320);
    return () => {
      window.clearTimeout(timer);
      root.classList.remove('is-theme-switching');
    };
  }, [theme]);

  return { theme, setTheme, toggleTheme, isLight: theme === 'light' };
}
