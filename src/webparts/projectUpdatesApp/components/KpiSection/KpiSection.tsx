import * as React from 'react';
import { TYPES } from '../../constants';
import styles from './KpiSection.module.scss';

export interface IKpiSectionProps {
  count: number;
  prevDiff: number;
  teamsReporting: number;
  teamsTotal: number;
  wins: number;
  openRisks: number;
  highRisks: number;
  presetName: string;
  allTime: boolean;
}

const Icon: React.FC<{ path: string }> = ({ path }) => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export const KpiSection: React.FC<IKpiSectionProps> = ({
  count,
  prevDiff,
  teamsReporting,
  teamsTotal,
  wins,
  openRisks,
  highRisks,
  presetName,
  allTime
}) => {
  return (
    <section className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.top}>
          <p className={styles.label}>Updates submitted</p>
          <span className={styles.icon} style={{ background: '#4f46e514', color: '#4f46e5' }}>
            <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </span>
        </div>
        <p className={styles.value}>{count}</p>
        <p className={styles.sub}>
          {allTime ? (
            presetName
          ) : (
            <span className={prevDiff >= 0 ? styles.up : styles.down}>
              {prevDiff >= 0 ? '▲' : '▼'} {Math.abs(prevDiff)}
            </span>
          )}
          {!allTime && ' vs previous period'}
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <p className={styles.label}>Teams reporting</p>
          <span className={styles.icon} style={{ background: '#0891b214', color: '#0891b2' }}>
            <Icon path="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </span>
        </div>
        <p className={styles.value}>
          {teamsReporting}
          <span className={styles.muted}>/{teamsTotal || '—'}</span>
        </p>
        <p className={styles.sub}>Distinct teams in this period</p>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <p className={styles.label}>Milestones & wins</p>
          <span className={styles.icon} style={{ background: '#7c3aed14', color: '#7c3aed' }}>
            <Icon path={TYPES.milestone.icon} />
          </span>
        </div>
        <p className={styles.value}>{wins}</p>
        <p className={styles.sub}>Shipped, launched or achieved</p>
      </div>

      <div className={`${styles.card} ${openRisks ? styles.cardRisk : ''}`}>
        <div className={styles.top}>
          <p className={`${styles.label} ${openRisks ? styles.labelRisk : ''}`}>Open risks</p>
          <span
            className={styles.icon}
            style={{
              background: openRisks ? '#e11d48' : '#f1f5f9',
              color: openRisks ? '#fff' : '#64748b'
            }}
          >
            <Icon path={TYPES.risk.icon} />
          </span>
        </div>
        <p className={styles.value} style={openRisks ? { color: '#be123c' } : undefined}>
          {openRisks}
        </p>
        <p className={styles.sub} style={openRisks ? { color: '#be123c' } : undefined}>
          {highRisks ? (
            <>
              <span className={styles.pulse} />
              <b>{highRisks} high severity</b>
            </>
          ) : (
            'No high-severity risks'
          )}
        </p>
      </div>
    </section>
  );
};
