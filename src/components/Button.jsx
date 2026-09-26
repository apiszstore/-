/**
 * Tombol reusable.
 * type: "primary" | "ghost" | "outline" | "soft"
 * size: "sm" | "md" | "lg"
 * `to` untuk link internal (router), `href` untuk link biasa.
 */
export default function Button({
  children,
  type = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconRight,
  className = '',
  full = false,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${type}`,
    `btn--${size}`,
    full ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon ? <span className="btn__icon">{icon}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="btn__icon">{iconRight}</span> : null}
    </>
  );

  if (to) {
    return (
      <a className={classes} href={`#${to}`} {...rest}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
