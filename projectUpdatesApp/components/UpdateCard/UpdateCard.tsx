import { DefaultButton } from '@fluentui/react';
import * as React from 'react';
import { SEVERITY, TEAM_PALETTE, TYPES } from '../../constants';
import { IProjectUpdate } from '../../types';
import { formatDate, relativeTime, teamColor } from '../../utils/date';
import { Avatar } from '../shared/Avatar';
import { TypeBadge } from '../shared/TypeBadge';
import styles from './UpdateCard.module.scss';

export interface IUpdateCardProps {
  update: IProjectUpdate;
  flash?: boolean;
  onProject: (project: string) => void;
  onToggleResolved: (update: IProjectUpdate) => void;
}

export const UpdateCard: React.FC<IUpdateCardProps> = ({
  update: u,
  flash,
  onProject,
  onToggleResolved
}) => {
  const open = u.type === 'risk' && !u.resolved;
  const sev = u.severity ? SEVERITY[u.severity] : undefined;
  return (
    <article
      id={`u-${u.id}`}
      className={`${styles.card} ${open ? styles.open : ''} ${u.resolved ? styles.resolved : ''} ${
        flash ? styles.flash : ''
      }`}
    >
      <span
        className={styles.stripe}
        style={{ background: u.resolved ? '#cbd5e1' : TYPES[u.type].color }}
      />
      {open && <div className={styles.wash} />}
      <div className={styles.body}>
        <div className={styles.row}>
          <TypeBadge type={u.type} />
          {sev && (
            <span className={u.resolved ? styles.sevResolved : styles[sev.cls]}>
              {sev.label} severity
            </span>
          )}
          {u.resolved && <span className={styles.resolvedTag}>Resolved</span>}
        </div>
        <div className={styles.projectRow}>
          <button type="button" className={styles.project} onClick={() => onProject(u.project)}>
            {u.project}
          </button>
          {u.team && (
            <span className={styles.team} style={{ color: teamColor(u.team, TEAM_PALETTE) }}>
              {u.team} team
            </span>
          )}
        </div>
        <p className={`${styles.summary} ${u.resolved ? styles.summaryResolved : ''}`}>{u.summary}</p>
        <div className={styles.foot}>
          <span className={styles.member}>
            <Avatar name={u.member} />
            {u.member}
          </span>
          <span className={styles.dot} />
          <span>{u.freqLabel} update</span>
          <span className={styles.dot} />
          <span title={new Date(u.modified).toLocaleString()}>
            {formatDate(u.modified)} · {relativeTime(u.modified)}
          </span>
          {u.type === 'risk' && (
            <DefaultButton
              styles={{ root: { marginLeft: 'auto' } }}
              text={u.resolved ? 'Reopen risk' : 'Mark resolved'}
              onClick={() => onToggleResolved(u)}
            />
          )}
        </div>
      </div>
    </article>
  );
};
