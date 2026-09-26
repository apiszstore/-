import Icon from './Icon.jsx';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-[background-color,border-color,color,transform,box-shadow] duration-200 ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-55';

const VARIANTS = {
  /* Tombol utama: orange solid, teks gelap (kontras 7:1). */
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover shadow-[0_6px_18px_-8px_rgb(255_138_0/0.7)]',
  /* Tombol sekunder: transparan dengan border orange. */
  outline: 'border border-brand/45 text-brand hover:border-brand hover:bg-brand/10',
  /* Aksi netral di atas surface gelap. */
  ghost: 'border border-line bg-surface/70 text-ink hover:border-brand/45 hover:text-brand',
  /* Paling ringan, untuk inline action. */
  quiet: 'text-muted hover:text-brand',
};

/* Tinggianya minimal 40px supaya nyaman ditekuk di HP. */
const SIZES = {
  sm: 'min-h-10 px-3.5 py-2 text-[13px]',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3.5 text-[15px]',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag className={`${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={16} /> : null}
    </Tag>
  );
}
