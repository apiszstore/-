/**
 * Kepala section: eyebrow, judul, subtitle.
 * Dipakai semua section supaya hierarki typografi konsisten.
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', className = '' }) {
  const centered = align === 'center';

  return (
    <header className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow ? (
        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand uppercase">
          {centered ? <span className="h-px w-6 bg-brand/50" aria-hidden="true" /> : null}
          {eyebrow}
          {centered ? <span className="h-px w-6 bg-brand/50" aria-hidden="true" /> : null}
        </p>
      ) : null}

      <h2 className="text-2xl font-bold text-balance sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15]">
        {title}
      </h2>

      {subtitle ? <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p> : null}
    </header>
  );
}
