import { useScrollPosition } from '../hooks/useScrollPosition.js';

/**
 * Wrapper section: padding vertikal + id untuk deep link.
 * `tone` mengatur warna latar belakang supaya section bisa
 * berselang-seling dan tidak terlihat monoton.
 *
 * `focused` menyalakan garis aksen orange di sisi atas section
 * yang sedang jadi "fokus" saat user scroll — penanda posisi.
 */
export default function Section({
  id,
  tone = 'base',
  className = '',
  containerClassName = '',
  children,
  ...rest
}) {
  const tones = {
    base: 'bg-canvas',
    raised: 'bg-raised',
    surface: 'bg-surface',
  };

  const { activeId } = useScrollPosition(id ? [id] : []);
  const focused = Boolean(id) && activeId === id;

  return (
    <section
      id={id}
      data-focused={focused || undefined}
      className={`relative py-16 sm:py-20 lg:py-24 ${tones[tone] ?? tones.base} ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-brand/0 via-brand to-brand/0 transition-opacity duration-500 ${
          focused ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </section>
  );
}
