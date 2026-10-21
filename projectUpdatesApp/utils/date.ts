import { DAY_MS } from '../constants';

export const startOfDay = (t: number): number => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const endOfDay = (t: number): number => {
  const d = new Date(t);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

export const weekStart = (t: number): number => {
  const d = new Date(startOfDay(t));
  const wd = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - wd);
  return d.getTime();
};

export const formatDate = (t: number, withYear?: boolean): string => {
  return new Date(t).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' as const } : {})
  });
};

export const relativeTime = (t: number): string => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) {
    return 'just now';
  }
  if (m < 60) {
    return `${m}m ago`;
  }
  const h = Math.floor(m / 60);
  if (h < 24) {
    return `${h}h ago`;
  }
  const d = Math.floor(h / 24);
  if (d < 7) {
    return `${d}d ago`;
  }
  return `${Math.floor(d / 7)}w ago`;
};

export const teamColor = (name: string, palette: string[]): string => {
  const hash = Array.from(name).reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

export const initials = (name: string): string => {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const previousPeriod = (from: number, to: number): { from: number; to: number } => {
  const len = to - from + 1;
  return { from: from - len, to: from - 1 };
};

export { DAY_MS };
