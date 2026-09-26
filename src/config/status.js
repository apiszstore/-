/**
 * Status badge.
 *
 * Aturan: jangan menandai `available` sebelum layanan benar-benar dikonfirmasi.
 */

export const STATUS = {
  available: {
    id: 'available',
    label: 'Available',
    dot: 'bg-available',
    text: 'text-available',
    chip: 'bg-available/12 text-available border-available/30',
  },
  soon: {
    id: 'soon',
    label: 'Coming Soon',
    dot: 'bg-soon',
    text: 'text-soon',
    chip: 'bg-soon/12 text-soon border-soon/30',
  },
  custom: {
    id: 'custom',
    label: 'Custom Pricing',
    dot: 'bg-custom',
    text: 'text-custom',
    chip: 'bg-custom/12 text-custom border-custom/30',
  },
  unavailable: {
    id: 'unavailable',
    label: 'Unavailable',
    dot: 'bg-unavailable',
    text: 'text-unavailable',
    chip: 'bg-unavailable/12 text-unavailable border-unavailable/30',
  },
};

export function getStatus(id) {
  return STATUS[id] ?? STATUS.unavailable;
}
