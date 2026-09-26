/**
 * Wrapper section: padding vertikal + id untuk deep link.
 * `tone` mengatur warna latarbelakang supaya section bisa
 * berselang-seling dan tidak terlihat monoton.
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

  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${tones[tone] ?? tones.base} ${className}`} {...rest}>
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </section>
  );
}
