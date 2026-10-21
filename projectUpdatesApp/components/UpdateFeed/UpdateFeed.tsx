import { Dropdown } from '@fluentui/react';
import * as React from 'react';
import { GroupBy, IFeedGroup, IProjectUpdate, SortBy } from '../../types';
import { EmptyState } from '../EmptyState/EmptyState';
import { UpdateCard } from '../UpdateCard/UpdateCard';
import styles from './UpdateFeed.module.scss';

export interface IUpdateFeedProps {
  groups: IFeedGroup[];
  total: number;
  presetName: string;
  groupBy: GroupBy;
  sortBy: SortBy;
  flashId: number | null;
  onGroupBy: (value: GroupBy) => void;
  onSortBy: (value: SortBy) => void;
  onProject: (project: string) => void;
  onToggleResolved: (update: IProjectUpdate) => void;
  onShowAllTime: () => void;
  onClearFilters: () => void;
}

export const UpdateFeed: React.FC<IUpdateFeedProps> = ({
  groups,
  total,
  presetName,
  groupBy,
  sortBy,
  flashId,
  onGroupBy,
  onSortBy,
  onProject,
  onToggleResolved,
  onShowAllTime,
  onClearFilters
}) => {
  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.result}>
          Showing <b>{total}</b> update{total === 1 ? '' : 's'} · {presetName}
        </p>
        <div className={styles.controls}>
          <Dropdown
            selectedKey={groupBy}
            options={[
              { key: 'week', text: 'Group by week' },
              { key: 'project', text: 'Group by project' },
              { key: 'none', text: 'No grouping' }
            ]}
            onChange={(_, o) => onGroupBy((o?.key as GroupBy) || 'week')}
            styles={{ root: { minWidth: 160 } }}
          />
          <Dropdown
            selectedKey={sortBy}
            options={[
              { key: 'new', text: 'Newest first' },
              { key: 'old', text: 'Oldest first' },
              { key: 'risk', text: 'Risks first' }
            ]}
            onChange={(_, o) => onSortBy((o?.key as SortBy) || 'new')}
            styles={{ root: { minWidth: 150 } }}
          />
        </div>
      </div>
      {total === 0 ? (
        <EmptyState onShowAllTime={onShowAllTime} onClearFilters={onClearFilters} />
      ) : (
        <div className={styles.feed}>
          {groups.map((g) => (
            <section key={g.key ?? 'all'}>
              {g.key !== null && (
                <div className={styles.groupHead}>
                  {g.teamColor && (
                    <span className={styles.teamDot} style={{ background: g.teamColor }} />
                  )}
                  <h3 className={styles.groupTitle}>{g.label}</h3>
                  <span className={styles.groupSub}>{g.sub}</span>
                  <span className={styles.rule} />
                  {g.openRiskCount > 0 && (
                    <span className={styles.riskCount}>
                      {g.openRiskCount} risk{g.openRiskCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={styles.count}>{g.items.length}</span>
                </div>
              )}
              <div className={styles.items}>
                {g.items.map((u) => (
                  <UpdateCard
                    key={u.id}
                    update={u}
                    flash={flashId === u.id}
                    onProject={onProject}
                    onToggleResolved={onToggleResolved}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
};
