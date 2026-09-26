/** Logo teks APISZ STORE. */
export default function Logo({ size = 'md', showTagline = false, className = '' }) {
  return (
    <span className={`logo logo--${size} ${className}`}>
      <span className="logo__mark" aria-hidden="true">
        A
      </span>
      <span className="logo__text">
        <span className="logo__line1">APISZ</span>
        <span className="logo__line2">STORE</span>
      </span>
      {showTagline ? <span className="logo__tagline">Digital Service &amp; SA-MP</span> : null}
    </span>
  );
}
