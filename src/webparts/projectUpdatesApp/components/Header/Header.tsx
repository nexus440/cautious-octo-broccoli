import { PrimaryButton } from '@fluentui/react';
import * as React from 'react';
import styles from './Header.module.scss';

export interface IHeaderProps {
  onSubmitClick: () => void;
}

export const Header: React.FC<IHeaderProps> = ({ onSubmitClick }) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
          </span>
          <span>
            <span className={styles.title}>Pulse</span>
            <span className={styles.sub}>Project updates hub</span>
          </span>
        </div>
        <div className={styles.actions}>
          <PrimaryButton text="Submit update" onClick={onSubmitClick} />
        </div>
      </div>
    </header>
  );
};
