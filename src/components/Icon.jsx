import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe,
  Info,
  Layers,
  Map,
  Menu,
  Radio,
  Search,
  Server,
  ShoppingCart,
  Terminal,
  TriangleAlert,
  Wand2,
  X,
} from 'lucide-react';

/**
 * Satu tempat untuk semua ikon yang dipakai website.
 * Nama -> komponen lucide-react, supaya komponen lain cukup
 * menulis <Icon name="server" /> dan tidak perlu import langsung.
 */
const ICONS = {
  arrowRight: ArrowRight,
  bot: Bot,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  external: ExternalLink,
  globe: Globe,
  info: Info,
  layers: Layers,
  map: Map,
  menu: Menu,
  radio: Radio,
  search: Search,
  server: Server,
  cart: ShoppingCart,
  terminal: Terminal,
  alert: TriangleAlert,
  wand: Wand2,
  close: X,
};

export default function Icon({ name, size = 20, strokeWidth = 1.75, className = '', ...rest }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    />
  );
}
