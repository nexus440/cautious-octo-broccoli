import { WebPartContext } from '@microsoft/sp-webpart-base';

export type UpdateTypeKey = 'status' | 'milestone' | 'achievement' | 'risk';
export type FrequencyKey = 'weekly' | 'biweekly' | 'monthly';
export type SeverityKey = 'high' | 'medium' | 'low';
export type DatePreset = '7' | '14' | '30' | '90' | 'all' | 'custom';
export type GroupBy = 'week' | 'project' | 'none';
export type SortBy = 'new' | 'old' | 'risk';

export interface IProjectUpdatesAppProps {
  context: WebPartContext;
  className?: string;
}

export interface IProjectUpdate {
  id: number;
  title: string;
  project: string;
  team: string;
  type: UpdateTypeKey;
  typeLabel: string;
  freq: FrequencyKey;
  freqLabel: string;
  severity: SeverityKey | null;
  member: string;
  summary: string;
  resolved: boolean;
  modified: number;
}

export interface ICreateUpdatePayload {
  project: string;
  team: string;
  type: UpdateTypeKey;
  freq: FrequencyKey;
  severity: SeverityKey | null;
  member: string;
  summary: string;
}

export interface IChoiceOptions {
  projects: string[];
  teams: string[];
  types: string[];
  frequencies: string[];
  severities: string[];
}

export interface IFilters {
  q: string;
  type: UpdateTypeKey | '';
  team: string;
  project: string;
  member: string;
  freq: FrequencyKey | '';
}

export interface IDateRange {
  preset: DatePreset;
  from: number;
  to: number;
}

export interface IFeedGroup {
  key: string | null;
  label: string;
  sub: string;
  teamColor?: string;
  items: IProjectUpdate[];
  openRiskCount: number;
}
