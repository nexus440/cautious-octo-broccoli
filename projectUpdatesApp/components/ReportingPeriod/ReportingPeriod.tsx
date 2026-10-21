import { DatePicker } from '@fluentui/react';
import * as React from 'react';
import { DATE_PRESETS } from '../../constants';
import { DatePreset, IDateRange } from '../../types';
import styles from './ReportingPeriod.module.scss';

export interface IReportingPeriodProps {
  range: IDateRange;
  rangeLabel: string;
  onPreset: (preset: DatePreset) => void;
  onCustomRange: (from: Date, to: Date) => void;
}

export const ReportingPeriod: React.FC<IReportingPeriodProps> = ({
  range,
  rangeLabel,
  onPreset,
  onCustomRange
}) => {
  const fromDate = new Date(range.from);
  const toDate = new Date(range.to);

  return (
    <div className={styles.wrap}>
      <div className={styles.caption}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        Reporting period
        <span className={styles.rangeLabel}>{rangeLabel}</span>
      </div>
      <div className={styles.row}>
        <div className={styles.presets}>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`${styles.preset} ${range.preset === p.key ? styles.presetActive : ''}`}
              onClick={() => onPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={styles.dates}>
          <DatePicker
            value={fromDate}
            onSelectDate={(d) => d && onCustomRange(d, toDate)}
            placeholder="From"
            ariaLabel="From"
          />
          <span className={styles.arrow}>→</span>
          <DatePicker
            value={toDate}
            onSelectDate={(d) => d && onCustomRange(fromDate, d)}
            placeholder="To"
            ariaLabel="To"
          />
        </div>
      </div>
    </div>
  );
};
