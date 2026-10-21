import * as React from 'react';
import { AVATAR_PALETTE } from '../../constants';
import { initials, teamColor } from '../../utils/date';
import styles from './shared.module.scss';

export interface IAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md';
  title?: string;
}

export const Avatar: React.FC<IAvatarProps> = ({ name, size = 'sm', title }) => {
  return (
    <span
      className={`${styles.avatar} ${styles[size]}`}
      style={{ background: teamColor(name || '?', AVATAR_PALETTE) }}
      title={title || name}
    >
      {initials(name || '?')}
    </span>
  );
};
