import {
  Activity,
  Bug,
  Code,
  Cpu,
  CreditCard,
  Heart,
  Key,
  Lock,
  MapPin,
  Mic,
  Palette,
  Pizza,
  Rocket,
  Shield,
  Terminal,
  Twitter,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  bug: Bug,
  code: Code,
  cpu: Cpu,
  "credit-card": CreditCard,
  heart: Heart,
  key: Key,
  lock: Lock,
  "map-pin": MapPin,
  mic: Mic,
  palette: Palette,
  pizza: Pizza,
  rocket: Rocket,
  shield: Shield,
  terminal: Terminal,
  twitter: Twitter,
};

export function getIcon(name?: string): LucideIcon {
  return (name && ICONS[name]) || Code;
}
