import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/fields';
import '@pnp/sp/items';
import '@pnp/sp/lists';
import '@pnp/sp/webs';
import {
  FREQ_FROM_LABEL,
  FREQ_LABELS,
  LIST_TITLE,
  SEVERITY_FROM_LABEL,
  SEVERITY_LABELS,
  TYPE_FROM_LABEL,
  TYPE_LABELS
} from '../constants';
import {
  FrequencyKey,
  IChoiceOptions,
  ICreateUpdatePayload,
  IProjectUpdate,
  SeverityKey,
  UpdateTypeKey
} from '../types';
import { getSp } from './sp';

interface ITeamUpdateItem {
  Id: number;
  Title?: string;
  Project?: string;
  Team?: string;
  UpdateType?: string;
  Frequency?: string;
  Severity?: string;
  Member?: string;
  Summary?: string;
  Resolved?: boolean;
  Modified?: string;
}

const parseType = (label?: string): { key: UpdateTypeKey; label: string } => {
  const key = (label && TYPE_FROM_LABEL[label]) || 'status';
  return { key, label: TYPE_LABELS[key] };
};

const parseFreq = (label?: string): { key: FrequencyKey; label: string } => {
  const key = (label && FREQ_FROM_LABEL[label]) || 'weekly';
  return { key, label: FREQ_LABELS[key] };
};

const parseSeverity = (label?: string, type?: UpdateTypeKey): SeverityKey | null => {
  if (type !== 'risk' || !label) {
    return null;
  }
  return SEVERITY_FROM_LABEL[label] || null;
};

const mapItem = (item: ITeamUpdateItem): IProjectUpdate => {
  const type = parseType(item.UpdateType);
  const freq = parseFreq(item.Frequency);
  return {
    id: item.Id,
    title: item.Title || '',
    project: item.Project || '',
    team: item.Team || '',
    type: type.key,
    typeLabel: type.label,
    freq: freq.key,
    freqLabel: freq.label,
    severity: parseSeverity(item.Severity, type.key),
    member: item.Member || '',
    summary: item.Summary || '',
    resolved: !!item.Resolved,
    modified: item.Modified ? new Date(item.Modified).getTime() : Date.now()
  };
};

const getChoices = async (context: WebPartContext, internalName: string): Promise<string[]> => {
  const sp = getSp(context);
  const field = await sp.web.lists
    .getByTitle(LIST_TITLE)
    .fields.getByInternalNameOrTitle(internalName)
    .select('Choices')();
  return ((field as { Choices?: string[] }).Choices || []).filter(Boolean);
};

export const getChoiceOptions = async (context: WebPartContext): Promise<IChoiceOptions> => {
  const [projects, teams, types, frequencies, severities] = await Promise.all([
    getChoices(context, 'Project'),
    getChoices(context, 'Team'),
    getChoices(context, 'UpdateType'),
    getChoices(context, 'Frequency'),
    getChoices(context, 'Severity')
  ]);
  return { projects, teams, types, frequencies, severities };
};

export const getUpdates = async (context: WebPartContext): Promise<IProjectUpdate[]> => {
  const sp = getSp(context);
  const items: ITeamUpdateItem[] = await sp.web.lists
    .getByTitle(LIST_TITLE)
    .items.select(
      'Id',
      'Title',
      'Project',
      'Team',
      'UpdateType',
      'Frequency',
      'Severity',
      'Member',
      'Summary',
      'Resolved',
      'Modified'
    )
    .orderBy('Modified', false)
    .top(2000)();
  return items.map(mapItem);
};

export const createUpdate = async (
  context: WebPartContext,
  payload: ICreateUpdatePayload
): Promise<IProjectUpdate> => {
  const sp = getSp(context);
  const typeLabel = TYPE_LABELS[payload.type];
  const body: Record<string, unknown> = {
    Title: `${payload.project} — ${typeLabel}`.slice(0, 255),
    Project: payload.project,
    Team: payload.team,
    UpdateType: typeLabel,
    Frequency: FREQ_LABELS[payload.freq],
    Member: payload.member,
    Summary: payload.summary,
    Resolved: false
  };
  if (payload.type === 'risk' && payload.severity) {
    body.Severity = SEVERITY_LABELS[payload.severity];
  }
  const result = await sp.web.lists.getByTitle(LIST_TITLE).items.add(body as ITeamUpdateItem);
  return mapItem(result.data as ITeamUpdateItem);
};

export const setResolved = async (
  context: WebPartContext,
  id: number,
  resolved: boolean
): Promise<void> => {
  const sp = getSp(context);
  await sp.web.lists.getByTitle(LIST_TITLE).items.getById(id).update({ Resolved: resolved });
};
