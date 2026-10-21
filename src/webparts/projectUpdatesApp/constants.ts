import { DatePreset, FrequencyKey, SeverityKey, UpdateTypeKey } from './types';

export const LIST_TITLE = 'TeamUpdates';
export const SUMMARY_MAX = 320;
export const DAY_MS = 86400000;

export const TYPE_LABELS: Record<UpdateTypeKey, string> = {
  status: 'Status',
  milestone: 'Milestone',
  achievement: 'Achievement',
  risk: 'Risk / Blocker'
};

export const TYPE_FROM_LABEL: Record<string, UpdateTypeKey> = {
  Status: 'status',
  Milestone: 'milestone',
  Achievement: 'achievement',
  'Risk / Blocker': 'risk',
  Risk: 'risk'
};

export const FREQ_LABELS: Record<FrequencyKey, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly'
};

export const FREQ_FROM_LABEL: Record<string, FrequencyKey> = {
  Weekly: 'weekly',
  'Bi-weekly': 'biweekly',
  Biweekly: 'biweekly',
  Monthly: 'monthly'
};

export const SEVERITY_LABELS: Record<SeverityKey, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const SEVERITY_FROM_LABEL: Record<string, SeverityKey> = {
  High: 'high',
  Medium: 'medium',
  Low: 'low'
};

export const TYPES: Record<
  UpdateTypeKey,
  { label: string; color: string; bg: string; icon: string }
> = {
  status: {
    label: TYPE_LABELS.status,
    color: '#0284c7',
    bg: '#e0f2fe',
    icon: 'M3.75 12h16.5M3.75 6.75h16.5M3.75 17.25h16.5'
  },
  milestone: {
    label: TYPE_LABELS.milestone,
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: 'M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5'
  },
  achievement: {
    label: TYPE_LABELS.achievement,
    color: '#059669',
    bg: '#d1fae5',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0'
  },
  risk: {
    label: TYPE_LABELS.risk,
    color: '#e11d48',
    bg: '#ffe4e6',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
  }
};

export const SEVERITY: Record<
  SeverityKey,
  { label: string; rank: number; cls: string; bar: string }
> = {
  high: { label: 'High', rank: 3, cls: 'sevHigh', bar: '#e11d48' },
  medium: { label: 'Medium', rank: 2, cls: 'sevMedium', bar: '#f59e0b' },
  low: { label: 'Low', rank: 1, cls: 'sevLow', bar: '#64748b' }
};

export const TEAM_PALETTE = [
  '#4f46e5',
  '#7c3aed',
  '#059669',
  '#db2777',
  '#d97706',
  '#e11d48',
  '#0891b2',
  '#2563eb'
];

export const AVATAR_PALETTE = TEAM_PALETTE;

export const DATE_PRESETS: Array<{ key: DatePreset; label: string; full: string }> = [
  { key: '7', label: '7D', full: 'Last 7 days' },
  { key: '14', label: '14D', full: 'Last 14 days' },
  { key: '30', label: '30D', full: 'Last 30 days' },
  { key: '90', label: '90D', full: 'Last 90 days' },
  { key: 'all', label: 'All', full: 'All time' },
  { key: 'custom', label: 'Custom', full: 'Custom range' }
];

export const EMPTY_FILTERS = {
  q: '',
  type: '' as const,
  team: '',
  project: '',
  member: '',
  freq: '' as const
};
