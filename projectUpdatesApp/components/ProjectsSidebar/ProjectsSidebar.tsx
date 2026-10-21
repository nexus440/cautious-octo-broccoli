import * as React from 'react';
import { TYPES } from '../../constants';
import { IProjectUpdate, UpdateTypeKey } from '../../types';
import { relativeTime } from '../../utils/date';
import styles from './ProjectsSidebar.module.scss';

export interface IProjectRow {
  name: string;
  latest?: IProjectUpdate;
  count: number;
  openRisks: number;
}

export interface IMixItem {
  key: UpdateTypeKey;
  label: string;
  color: string;
  count: number;
}

export interface IProjectsSidebarProps {
  projects: IProjectRow[];
  selectedProject: string;
  coveragePct: number;
  missing: string[];
  mix: IMixItem[];
  onSelectProject: (project: string) => void;
}

export const ProjectsSidebar: React.FC<IProjectsSidebarProps> = ({
  projects,
  selectedProject,
  coveragePct,
  missing,
  mix,
  onSelectProject
}) => {
  const mixTotal = mix.reduce((s, m) => s + m.count, 0) || 1;
  return (
    <aside>
      <div className={styles.card}>
        <div className={styles.head}>
          <h3 className={styles.title}>Projects</h3>
          <span className={styles.hint}>latest in period</span>
        </div>
        <ul className={styles.list}>
          {projects.map((p) => {
            const active = selectedProject === p.name;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  className={`${styles.item} ${active ? styles.active : ''}`}
                  onClick={() => onSelectProject(p.name)}
                >
                  <span
                    className={styles.dot}
                    style={{
                      background: p.openRisks ? TYPES.risk.color : p.latest ? '#10b981' : '#cbd5e1'
                    }}
                  />
                  <span className={styles.text}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.meta}>
                      {p.latest ? `Updated · ${relativeTime(p.latest.modified)}` : 'No update this period'}
                    </span>
                  </span>
                  {p.openRisks > 0 && <span className={styles.risk}>{p.openRisks}</span>}
                  <span className={styles.count}>{p.count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.section}>
          <div className={styles.covHead}>
            <h3 className={styles.title}>Reporting coverage</h3>
            <span className={styles.pct}>{coveragePct}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${coveragePct}%` }} />
          </div>
          <p className={styles.covText}>
            {missing.length
              ? `Awaiting updates from: ${missing.join(', ')}.`
              : 'Every project has reported in this period.'}
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.title} style={{ marginBottom: 10 }}>
            Update mix
          </h3>
          <div className={styles.mixBar}>
            {mix.map((m) =>
              m.count ? (
                <span
                  key={m.key}
                  className={styles.mixSeg}
                  style={{ width: `${(m.count / mixTotal) * 100}%`, background: m.color }}
                  title={`${m.label}: ${m.count}`}
                />
              ) : null
            )}
          </div>
          <div className={styles.legend}>
            {mix.map((m) => (
              <div key={m.key} className={styles.legItem}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: m.color,
                    flexShrink: 0
                  }}
                />
                <span className={styles.legLabel}>{m.label}</span>
                <span className={styles.legCount}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
