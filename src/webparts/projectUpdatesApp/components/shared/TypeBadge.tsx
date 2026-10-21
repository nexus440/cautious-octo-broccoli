import * as React from 'react';
import { TYPES } from '../../constants';
import { UpdateTypeKey } from '../../types';
import styles from './shared.module.scss';

export interface ITypeBadgeProps {
  type: UpdateTypeKey;
}

export const TypeBadge: React.FC<ITypeBadgeProps> = ({ type }) => {
  const t = TYPES[type];
  return (
    <span className={styles.badge} style={{ background: t.bg, color: t.color }}>
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
      </svg>
      {t.label}
    </span>
  );
};
