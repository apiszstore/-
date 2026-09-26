import { useEffect, useRef, useState } from 'react';

/**
 * Fokus konten saat masuk viewport.
 *
 * Dipakai di setiap kartu / blok supaya isi halaman "datang ke fokus"
 * satu per satu seiring scroll, bukan langsung muncul semua. *
 * SENGaja TIDAK memakai blur atau backdrop-filter: efek seperti itu
 * bikin halaman terasa berat dan otomatis. Yang dipakai cuma opacity
 * + translateY + scale tipis.
 *
 * Catatan: nilai translateY dikirim lewat inline style, bukan class
 * Tailwind, karena class constructed dari string dinamis tidak ikut
 * terbaca scanner Tailwind.
 *
 * Pakai IntersectionObserver (bukan scroll listener) supaya murah, dan
 * animasi hanya jalan sekali per elemen.
 * Kalau user minta reduced motion, langsung tampil tanpa animasi.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  distance = 20,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    /* Kalau animasi tidak desirable (reduced motion) atau browser tidak
       mendukung IntersectionObserver, tampilkan langsung. Jangan pernah
       meninggalkan konten tersembunyi karena observer gagal. */
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? 'in' : 'out'}
      style={{
        ...(shown ? undefined : { transform: `translateY(${distance}px) scale(0.985)` }),
        ...(delay ? { transitionDelay: `${delay}ms` } : null),
        ...style,
      }}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
