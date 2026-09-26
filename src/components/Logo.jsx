import { siteConfig } from '../config/site.js';

/**
 * Logo: "APISZ" putih + "STORE" orange.
 * Orange hanya di kata STORE supaya aksennya tidak berlebihan.
 */
export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-[15px]',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <span className={`inline-flex items-baseline font-display font-bold tracking-tight ${sizes[size] ?? sizes.md} ${className}`}>
      <span className="text-ink">{siteConfig.shortName}</span>
      <span className="text-brand">{siteConfig.name.replace(siteConfig.shortName, '')}</span>
    </span>
  );
}
