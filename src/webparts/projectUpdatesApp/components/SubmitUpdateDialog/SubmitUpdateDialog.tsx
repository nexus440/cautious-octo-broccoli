import {
  ComboBox,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Dropdown,
  IComboBox,
  IComboBoxOption,
  PrimaryButton,
  TextField
} from '@fluentui/react';
import * as React from 'react';
import { FREQ_LABELS, SEVERITY, SUMMARY_MAX, TYPES } from '../../constants';
import {
  FrequencyKey,
  IChoiceOptions,
  ICreateUpdatePayload,
  SeverityKey,
  UpdateTypeKey
} from '../../types';
import styles from './SubmitUpdateDialog.module.scss';

export interface ISubmitUpdateDialogProps {
  hidden: boolean;
  saving: boolean;
  choices: IChoiceOptions;
  members: string[];
  onDismiss: () => void;
  onSubmit: (payload: ICreateUpdatePayload) => Promise<unknown>;
}

export const SubmitUpdateDialog: React.FC<ISubmitUpdateDialogProps> = ({
  hidden,
  saving,
  choices,
  members,
  onDismiss,
  onSubmit
}) => {
  const [project, setProject] = React.useState('');
  const [team, setTeam] = React.useState('');
  const [member, setMember] = React.useState('');
  const [type, setType] = React.useState<UpdateTypeKey>('status');
  const [freq, setFreq] = React.useState<FrequencyKey>('weekly');
  const [severity, setSeverity] = React.useState<SeverityKey>('medium');
  const [summary, setSummary] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!hidden) {
      setProject(choices.projects[0] || '');
      setTeam(choices.teams[0] || '');
      setMember('');
      setType('status');
      setFreq('weekly');
      setSeverity('medium');
      setSummary('');
      setError('');
    }
  }, [hidden, choices.projects, choices.teams]);

  const memberOptions: IComboBoxOption[] = members.map((m) => ({ key: m, text: m }));

  const resetAndClose = (): void => {
    onDismiss();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!project || !team || !member.trim() || !summary.trim()) {
      setError('Project, team, member and summary are required.');
      return;
    }
    try {
      await onSubmit({
        project,
        team,
        type,
        freq,
        severity: type === 'risk' ? severity : null,
        member: member.trim(),
        summary: summary.trim()
      });
      resetAndClose();
    } catch {
      setError('Could not submit the update. Check list permissions and try again.');
    }
  };

  return (
    <Dialog
      hidden={hidden}
      onDismiss={resetAndClose}
      minWidth={640}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: 'Submit project update',
        subText: 'Shared with every team on the updates feed.'
      }}
    >
      <div className={styles.grid}>
        <div className={styles.row3}>
          <Dropdown
            label="Project"
            required
            selectedKey={project}
            options={choices.projects.map((p) => ({ key: p, text: p }))}
            onChange={(_, o) => setProject(String(o?.key || ''))}
          />
          <Dropdown
            label="Team"
            required
            selectedKey={team}
            options={choices.teams.map((t) => ({ key: t, text: t }))}
            onChange={(_, o) => setTeam(String(o?.key || ''))}
          />
          <ComboBox
            label="Reporting member"
            required
            allowFreeform
            autoComplete="on"
            options={memberOptions}
            text={member}
            onChange={(_: React.FormEvent<IComboBox>, option?: IComboBoxOption, _i?: number, value?: string) => {
              setMember(option ? String(option.text) : value || '');
            }}
            placeholder="e.g. Ava Lindqvist"
          />
        </div>

        <div>
          <p className={styles.label}>Update type</p>
          <div className={styles.cards}>
            {(Object.keys(TYPES) as UpdateTypeKey[]).map((k) => {
              const t = TYPES[k];
              const on = type === k;
              return (
                <button
                  key={k}
                  type="button"
                  className={styles.cardBtn}
                  style={
                    on
                      ? {
                          borderColor: t.color,
                          background: t.bg,
                          color: t.color,
                          boxShadow: `inset 0 0 0 1px ${t.color}`
                        }
                      : undefined
                  }
                  onClick={() => setType(k)}
                >
                  <svg fill="none" stroke={t.color} strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {type === 'risk' && (
          <div className={styles.sevWrap}>
            <p className={styles.sevLabel}>Risk severity</p>
            <div className={styles.cards3}>
              {(Object.keys(SEVERITY) as SeverityKey[]).map((k) => {
                const s = SEVERITY[k];
                const on = severity === k;
                return (
                  <button
                    key={k}
                    type="button"
                    className={styles.seg}
                    style={on ? { borderColor: s.bar, background: s.bar, color: '#fff' } : undefined}
                    onClick={() => setSeverity(k)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className={styles.label}>Frequency</p>
          <div className={styles.cards3}>
            {(Object.keys(FREQ_LABELS) as FrequencyKey[]).map((k) => {
              const on = freq === k;
              return (
                <button
                  key={k}
                  type="button"
                  className={styles.seg}
                  style={
                    on
                      ? {
                          borderColor: '#4f46e5',
                          background: '#4f46e512',
                          color: '#4f46e5',
                          boxShadow: 'inset 0 0 0 1px #4f46e5'
                        }
                      : undefined
                  }
                  onClick={() => setFreq(k)}
                >
                  {FREQ_LABELS[k]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className={styles.labelRow}>
            <span className={styles.label} style={{ margin: 0 }}>
              Summary of update
            </span>
            <span className={styles.char}>
              {summary.length} / {SUMMARY_MAX}
            </span>
          </div>
          <TextField
            required
            multiline
            rows={4}
            resizable={false}
            value={summary}
            maxLength={SUMMARY_MAX}
            placeholder="What changed this period? Outcomes, numbers, decisions needed, next steps…"
            onChange={(_, v) => setSummary(v || '')}
          />
        </div>
        {error && <p style={{ color: '#e11d48', fontSize: 12, margin: 0 }}>{error}</p>}
      </div>
      <DialogFooter>
        <DefaultButton text="Cancel" onClick={resetAndClose} disabled={saving} />
        <PrimaryButton text="Submit update" onClick={handleSubmit} disabled={saving} />
      </DialogFooter>
    </Dialog>
  );
};
