import * as React from 'react';
import styles from './Toast.module.scss';

export interface IToastProps {
  message: string;
}

export const Toast: React.FC<IToastProps> = ({ message }) => {
  if (!message) {
    return null;
  }
  return (
    <div className={`${styles.toast} ${styles.show}`} role="status">
      <span className={styles.inner}>
        <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
        </svg>
        {message}
      </span>
    </div>
  );
};
