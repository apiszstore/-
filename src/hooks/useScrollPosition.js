import { useEffect, useState } from 'react';

/**
 * Lacak posisi scroll user.
 *
 * Mengembalikan:
 *  - `progress`  0..1,berapa persen halaman yang sudah dilewati
 *  - `activeId`  id section yang sedang jadi "fokus" (yang paling dekat
 *                dengan garis di bawah navbar)
 *
 * Pakai IntersectionObserver untuk menentukan section aktif supaya tidak
 * perlu menghitung posisi semua section tiap event scroll. `progress`
 * tetap pakai scroll listener karena memang soal offset dokumen.
 */
export function useScrollPosition(ids = []) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(ids[0] ?? null);

  const key = ids.join(',');

  useEffect(() => {
    const list = key ? key.split(',') : [];
    if (!list.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        /* Ambil entry yang paling terlihat di area paling atas viewport. */
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
        if (best) setActiveId(best.target.id);
      },
      {
        /* AreaRAF: garis imajiner tepat di bawah navbar. */
        rootMargin: '-88px 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.6],
      },
    );

    list.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [key]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { progress, activeId };
}
