import { Dropdown, IDropdownOption, SearchBox } from '@fluentui/react';
import * as React from 'react';
import { FREQ_LABELS, TYPES } from '../../constants';
import { FrequencyKey, IChoiceOptions, IFilters, UpdateTypeKey } from '../../types';
import styles from './FilterBar.module.scss';

export interface IFilterBarProps {
  filters: IFilters;
  choices: IChoiceOptions;
  members: string[];
  typeCounts: Record<UpdateTypeKey | 'all', number>;
  hasActiveFilters: boolean;
  onChange: (patch: Partial<IFilters>) => void;
  onClear: () => void;
}

const toOptions = (items: string[], allLabel: string): IDropdownOption[] => [
  { key: '', text: allLabel },
  ...items.map((v) => ({ key: v, text: v }))
];

export const FilterBar: React.FC<IFilterBarProps> = ({
  filters,
  choices,
  members,
  typeCounts,
  hasActiveFilters,
  onChange,
  onClear
}) => {
  const tabs: Array<{ key: UpdateTypeKey | ''; label: string; n: number; color: string }> = [
    { key: '', label: 'All updates', n: typeCounts.all, color: '#4f46e5' },
    ...(Object.keys(TYPES) as UpdateTypeKey[]).map((k) => ({
      key: k,
      label: TYPES[k].label,
      n: typeCounts[k],
      color: TYPES[k].color
    }))
  ];

  const chips: Array<{ k: keyof IFilters; v: string }> = [
    filters.type ? { k: 'type', v: TYPES[filters.type].label } : null,
    filters.team ? { k: 'team', v: `${filters.team} team` } : null,
    filters.project ? { k: 'project', v: filters.project } : null,
    filters.member ? { k: 'member', v: filters.member } : null,
    filters.freq ? { k: 'freq', v: FREQ_LABELS[filters.freq] } : null,
    filters.q ? { k: 'q', v: `“${filters.q}”` } : null
  ].filter(Boolean) as Array<{ k: keyof IFilters; v: string }>;

  return (
    <div className={styles.bar}>
      <div className={styles.stack}>
        <SearchBox
          id="pulse-search"
          placeholder="Search summaries, projects or people…"
          value={filters.q}
          onChange={(_, v) => onChange({ q: v || '' })}
          onClear={() => onChange({ q: '' })}
        />
        <div className={styles.tabs}>
          {tabs.map((t) => {
            const on = filters.type === t.key;
            return (
              <button
                key={t.key || 'all'}
                type="button"
                className={`${styles.tab} ${on ? styles.tabOn : ''}`}
                style={on ? { background: t.color, borderColor: t.color } : undefined}
                onClick={() => onChange({ type: t.key })}
              >
                {t.key ? (
                  <span className={styles.dot} style={{ background: on ? '#fff' : t.color }} />
                ) : null}
                {t.label}
                <span className={`${styles.count} ${on ? styles.countOn : ''}`}>{t.n}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.grid}>
          <Dropdown
            selectedKey={filters.team}
            options={toOptions(choices.teams, 'All teams')}
            onChange={(_, o) => onChange({ team: String(o?.key || '') })}
          />
          <Dropdown
            selectedKey={filters.project}
            options={toOptions(choices.projects, 'All projects')}
            onChange={(_, o) => onChange({ project: String(o?.key || '') })}
          />
          <Dropdown
            selectedKey={filters.member}
            options={toOptions(members, 'All members')}
            onChange={(_, o) => onChange({ member: String(o?.key || '') })}
          />
          <Dropdown
            selectedKey={filters.freq}
            options={[
              { key: '', text: 'All frequencies' },
              ...choices.frequencies.map((f) => ({ key: freqKey(f), text: f }))
            ]}
            onChange={(_, o) => onChange({ freq: String(o?.key || '') as FrequencyKey | '' })}
          />
        </div>
        {hasActiveFilters && (
          <div className={styles.chipsRow}>
            <span className={styles.chipsLabel}>Active:</span>
            <div className={styles.chips}>
              {chips.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  className={styles.chip}
                  onClick={() => onChange({ [c.k]: '' } as Partial<IFilters>)}
                >
                  {c.v}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <button type="button" className={styles.clear} onClick={onClear}>
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const freqKey = (label: string): FrequencyKey | string => {
  const map: Record<string, FrequencyKey> = {
    Weekly: 'weekly',
    'Bi-weekly': 'biweekly',
    Biweekly: 'biweekly',
    Monthly: 'monthly'
  };
  return map[label] || label;
};
