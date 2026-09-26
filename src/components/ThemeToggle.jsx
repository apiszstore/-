import { useTheme } from '../lib/useTheme';
import Icon from './Icons';

/**
 * Tombol pengalih dark/light. Mengikuti preferensi sistem sampai pengguna
 * memilih sendiri, lalu pilihan itu yang diingat.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${isLight ? 'is-light' : ''} ${className}`}
      onClick={toggleTheme}
      aria-label={isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
      aria-pressed={isLight}
      title={isLight ? 'Mode gelap' : 'Mode terang'}
      data-theme-state={theme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          <span className="theme-toggle__icon theme-toggle__icon--sun">
            <Icon name="sun" size={15} />
          </span>
          <span className="theme-toggle__icon theme-toggle__icon--moon">
            <Icon name="moon" size={15} />
          </span>
        </span>
      </span>
    </button>
  );
}
