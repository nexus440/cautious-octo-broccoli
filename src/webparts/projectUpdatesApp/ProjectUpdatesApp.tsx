import { MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';
import * as React from 'react';
import { FilterBar } from './components/FilterBar/FilterBar';
import { Header } from './components/Header/Header';
import { KpiSection } from './components/KpiSection/KpiSection';
import { ProjectsSidebar } from './components/ProjectsSidebar/ProjectsSidebar';
import { ReportingPeriod } from './components/ReportingPeriod/ReportingPeriod';
import { RiskSpotlight } from './components/RiskSpotlight/RiskSpotlight';
import { SubmitUpdateDialog } from './components/SubmitUpdateDialog/SubmitUpdateDialog';
import { Toast } from './components/Toast/Toast';
import { UpdateFeed } from './components/UpdateFeed/UpdateFeed';
import { useTeamUpdates } from './hooks/useTeamUpdates';
import { IProjectUpdate, IProjectUpdatesAppProps } from './types';
import styles from './ProjectUpdatesApp.module.scss';

export const ProjectUpdatesApp: React.FC<IProjectUpdatesAppProps> = ({ context, className }) => {
  const vm = useTeamUpdates(context);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const toastTimer = React.useRef<number | undefined>(undefined);

  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('pulse-search') as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (vm.flashId === null) {
      return;
    }
    const t = window.setTimeout(() => vm.setFlashId(null), 1800);
    return () => window.clearTimeout(t);
  }, [vm.flashId, vm.setFlashId]);

  const jumpTo = (id: number): void => {
    const el = document.getElementById(`u-${id}`);
    if (!el) {
      vm.clearFilters();
    }
    window.setTimeout(() => {
      const card = document.getElementById(`u-${id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        vm.setFlashId(id);
      }
    }, 50);
  };

  const onProject = (project: string): void => {
    vm.patchFilters({ project: vm.filters.project === project ? '' : project });
  };

  const onToggleResolved = async (item: IProjectUpdate): Promise<void> => {
    await vm.toggleResolved(item);
    showToast(
      item.resolved ? `Risk on ${item.project} reopened` : `Risk on ${item.project} marked resolved`
    );
  };

  return (
    <div className={`${styles.root} ${className || ''}`.trim()}>
      <Header onSubmitClick={() => setDialogOpen(true)} />
      <div className={styles.page}>
        {vm.error && (
          <div className={styles.section}>
            <MessageBar messageBarType={MessageBarType.error} onDismiss={vm.reload}>
              {vm.error}
            </MessageBar>
          </div>
        )}

        {vm.loading ? (
          <div className={styles.status}>
            <Spinner size={SpinnerSize.large} label="Loading project updates…" />
          </div>
        ) : (
          <>
            <section className={styles.titleRow}>
              <div>
                <h1 className={styles.heading}>Project updates</h1>
                <p className={styles.lede}>
                  Status, milestones, achievements and risks reported by every team.
                </p>
              </div>
              <ReportingPeriod
                range={vm.range}
                rangeLabel={vm.rangeLabel}
                onPreset={vm.setPreset}
                onCustomRange={vm.setCustomRange}
              />
            </section>

            <div className={styles.section}>
              <KpiSection
                count={vm.kpis.count}
                prevDiff={vm.kpis.prevDiff}
                teamsReporting={vm.kpis.teamsReporting}
                teamsTotal={vm.kpis.teamsTotal}
                wins={vm.kpis.wins}
                openRisks={vm.kpis.openRisks}
                highRisks={vm.kpis.highRisks}
                presetName={vm.kpis.presetName}
                allTime={vm.range.preset === 'all'}
              />
            </div>

            <div className={styles.section}>
              <RiskSpotlight
                risks={vm.openRisks}
                presetName={vm.kpis.presetName}
                showingRisksOnly={vm.filters.type === 'risk'}
                onToggleRisks={() => {
                  const next = vm.filters.type === 'risk' ? '' : 'risk';
                  vm.patchFilters({ type: next });
                  if (next) {
                    document.getElementById('pulse-feed')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onJump={jumpTo}
              />
            </div>

            <div className={styles.layout}>
              <main id="pulse-feed">
                <FilterBar
                  filters={vm.filters}
                  choices={vm.choices}
                  members={vm.members}
                  typeCounts={vm.typeCounts}
                  hasActiveFilters={vm.hasActiveFilters}
                  onChange={vm.patchFilters}
                  onClear={vm.clearFilters}
                />
                <UpdateFeed
                  groups={vm.groups}
                  total={vm.filtered.length}
                  presetName={vm.kpis.presetName}
                  groupBy={vm.groupBy}
                  sortBy={vm.sortBy}
                  flashId={vm.flashId}
                  onGroupBy={vm.setGroupBy}
                  onSortBy={vm.setSortBy}
                  onProject={onProject}
                  onToggleResolved={onToggleResolved}
                  onShowAllTime={() => vm.setPreset('all')}
                  onClearFilters={vm.clearFilters}
                />
              </main>
              <ProjectsSidebar
                projects={vm.projectRows}
                selectedProject={vm.filters.project}
                coveragePct={vm.coverage.pct}
                missing={vm.coverage.missing}
                mix={vm.mix}
                onSelectProject={onProject}
              />
            </div>
          </>
        )}
      </div>

      <SubmitUpdateDialog
        hidden={!dialogOpen}
        saving={vm.saving}
        choices={vm.choices}
        members={vm.members}
        onDismiss={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          const created = await vm.submit(payload);
          showToast(`Update submitted for ${created.project}`);
          window.setTimeout(() => jumpTo(created.id), 120);
        }}
      />
      <Toast message={toast} />
    </div>
  );
};

export default ProjectUpdatesApp;
