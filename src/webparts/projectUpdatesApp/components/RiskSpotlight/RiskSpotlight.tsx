import { DefaultButton } from '@fluentui/react';
import * as React from 'react';
import { SEVERITY, TYPES } from '../../constants';
import { IProjectUpdate } from '../../types';
import { relativeTime } from '../../utils/date';
import { Avatar } from '../shared/Avatar';
import styles from './RiskSpotlight.module.scss';

export interface IRiskSpotlightProps {
  risks: IProjectUpdate[];
  presetName: string;
  showingRisksOnly: boolean;
  onToggleRisks: () => void;
  onJump: (id: number) => void;
}

export const RiskSpotlight: React.FC<IRiskSpotlightProps> = ({
  risks,
  presetName,
  showingRisksOnly,
  onToggleRisks,
  onJump
}) => {
  const shown = risks.slice(0, 4);
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.icon}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={TYPES.risk.icon} />
          </svg>
        </span>
        <div>
          <h2 className={styles.title}>Risks & blockers needing attention</h2>
          <p className={styles.sub}>
            {risks.length
              ? `${risks.length} open in ${presetName.toLowerCase()} · sorted by severity`
              : `Nothing open in ${presetName.toLowerCase()}`}
          </p>
        </div>
        <DefaultButton
          styles={{ root: { marginLeft: 'auto' } }}
          text={showingRisksOnly ? 'Show all types' : 'Show only risks'}
          onClick={onToggleRisks}
        />
      </div>
      <div className={styles.list}>
        {shown.length ? (
          <>
            {shown.map((u) => {
              const sev = u.severity ? SEVERITY[u.severity] : SEVERITY.medium;
              return (
                <button key={u.id} type="button" className={styles.card} onClick={() => onJump(u.id)}>
                  <span className={styles.bar} style={{ background: sev.bar }} />
                  <div className={styles.cardTop}>
                    <span className={styles[sev.cls]}>{sev.label}</span>
                    <span className={styles.time}>{relativeTime(u.modified)}</span>
                  </div>
                  <p className={styles.project}>{u.project}</p>
                  <p className={styles.summary}>{u.summary}</p>
                  <div className={styles.meta}>
                    <Avatar name={u.member} size="xs" />
                    {u.member}
                    <span className={styles.view}>View →</span>
                  </div>
                </button>
              );
            })}
            {risks.length > 4 && (
              <p className={styles.more}>
                +{risks.length - 4} more open risk{risks.length - 4 > 1 ? 's' : ''} — use “Show only
                risks” to see them all.
              </p>
            )}
          </>
        ) : (
          <div className={styles.clear}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            All clear — no open risks or blockers reported in this period.
          </div>
        )}
      </div>
    </section>
  );
};
