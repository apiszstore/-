import { useEffect, useState } from 'react';

/**
 * Ikuti preferensi sistem `prefers-reduced-motion`.
 *
 * Mengembalikan `true` kalau perangkat meminta gerakan seminimal mungkin.
 * Dipakai carousel untuk berhenti bergerak dan merender layout diam, bukan
 * cuma untuk mematikan transisi.
 *
 * Kenapa hook, bukan `window.matchMedia` langsung di tiap tempat: nilai ini
 * bisa berubah saat user mengubah setelan sistem tanpa reload, dan setiap
 * pemanggil harus membersihkan listener-nya sendiri kalau tidak.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
