import { WebPartContext } from '@microsoft/sp-webpart-base';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DATE_PRESETS, EMPTY_FILTERS, SEVERITY, TEAM_PALETTE, TYPES } from '../constants';
import {
  createUpdate,
  getChoiceOptions,
  getUpdates,
  setResolved
} from '../services/teamUpdatesService';
import {
  DatePreset,
  GroupBy,
  IChoiceOptions,
  ICreateUpdatePayload,
  IDateRange,
  IFeedGroup,
  IFilters,
  IProjectUpdate,
  SortBy,
  UpdateTypeKey
} from '../types';
import { DAY_MS, endOfDay, formatDate, previousPeriod, startOfDay, teamColor, weekStart } from '../utils/date';

const emptyChoices: IChoiceOptions = {
  projects: [],
  teams: [],
  types: [],
  frequencies: [],
  severities: []
};

const isOpenRisk = (u: IProjectUpdate): boolean => u.type === 'risk' && !u.resolved;

const inRange = (u: IProjectUpdate, range: IDateRange): boolean =>
  u.modified >= range.from && u.modified <= range.to;

const matches = (u: IProjectUpdate, filters: IFilters, skipType?: boolean): boolean => {
  if (!skipType && filters.type && u.type !== filters.type) {
    return false;
  }
  if (filters.team && u.team !== filters.team) {
    return false;
  }
  if (filters.project && u.project !== filters.project) {
    return false;
  }
  if (filters.member && u.member !== filters.member) {
    return false;
  }
  if (filters.freq && u.freq !== filters.freq) {
    return false;
  }
  if (filters.q) {
    const hay = `${u.project} ${u.summary} ${u.member} ${u.typeLabel} ${u.team}`.toLowerCase();
    if (!hay.includes(filters.q.toLowerCase())) {
      return false;
    }
  }
  return true;
};

const applyPreset = (preset: DatePreset, updates: IProjectUpdate[]): IDateRange => {
  if (preset === 'all') {
    const times = updates.map((u) => u.modified);
    const from = times.length ? startOfDay(Math.min(...times)) : startOfDay(Date.now());
    return { preset, from, to: endOfDay(Date.now()) };
  }
  if (preset === 'custom') {
    return { preset, from: startOfDay(Date.now() - 29 * DAY_MS), to: endOfDay(Date.now()) };
  }
  return {
    preset,
    to: endOfDay(Date.now()),
    from: startOfDay(Date.now() - (Number(preset) - 1) * DAY_MS)
  };
};

const sortList = (list: IProjectUpdate[], sort: SortBy): IProjectUpdate[] => {
  const copy = [...list];
  if (sort === 'old') {
    copy.sort((a, b) => a.modified - b.modified);
  } else if (sort === 'risk') {
    copy.sort(
      (a, b) =>
        Number(isOpenRisk(b)) - Number(isOpenRisk(a)) ||
        (b.severity ? SEVERITY[b.severity].rank : 0) - (a.severity ? SEVERITY[a.severity].rank : 0) ||
        b.modified - a.modified
    );
  } else {
    copy.sort((a, b) => b.modified - a.modified);
  }
  return copy;
};

export const useTeamUpdates = (context: WebPartContext) => {
  const [updates, setUpdates] = useState<IProjectUpdate[]>([]);
  const [choices, setChoices] = useState<IChoiceOptions>(emptyChoices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<IFilters>({ ...EMPTY_FILTERS });
  const [range, setRange] = useState<IDateRange>(() => applyPreset('30', []));
  const [groupBy, setGroupBy] = useState<GroupBy>('week');
  const [sortBy, setSortBy] = useState<SortBy>('new');
  const [flashId, setFlashId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, optionSets] = await Promise.all([
        getUpdates(context),
        getChoiceOptions(context)
      ]);
      setUpdates(items);
      setChoices(optionSets);
      setRange((prev) => {
        if (prev.preset === 'custom') {
          return prev;
        }
        return applyPreset(prev.preset === 'all' ? 'all' : prev.preset, items);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load TeamUpdates');
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    void load();
  }, [load]);

  const setPreset = useCallback(
    (preset: DatePreset) => {
      if (preset === 'custom') {
        setRange((prev) => ({ ...prev, preset: 'custom' }));
        return;
      }
      setRange(applyPreset(preset, updates));
    },
    [updates]
  );

  const setCustomRange = useCallback((fromDate: Date, toDate: Date) => {
    let from = startOfDay(fromDate.getTime());
    let to = endOfDay(toDate.getTime());
    if (from > to) {
      const swapFrom = startOfDay(to);
      const swapTo = endOfDay(from);
      from = swapFrom;
      to = swapTo;
    }
    setRange({ preset: 'custom', from, to });
  }, []);

  const inPeriod = useMemo(() => updates.filter((u) => inRange(u, range)), [updates, range]);

  const filtered = useMemo(
    () => sortList(inPeriod.filter((u) => matches(u, filters)), sortBy),
    [inPeriod, filters, sortBy]
  );

  const typeCounts = useMemo(() => {
    const base = inPeriod.filter((u) => matches(u, filters, true));
    const counts: Record<UpdateTypeKey | 'all', number> = {
      all: base.length,
      status: 0,
      milestone: 0,
      achievement: 0,
      risk: 0
    };
    base.forEach((u) => {
      counts[u.type] += 1;
    });
    return counts;
  }, [inPeriod, filters]);

  const openRisks = useMemo(() => {
    return [...inPeriod.filter(isOpenRisk)].sort(
      (a, b) =>
        (b.severity ? SEVERITY[b.severity].rank : 0) - (a.severity ? SEVERITY[a.severity].rank : 0) ||
        b.modified - a.modified
    );
  }, [inPeriod]);

  const groups = useMemo((): IFeedGroup[] => {
    if (groupBy === 'none') {
      return [
        {
          key: null,
          label: '',
          sub: '',
          items: filtered,
          openRiskCount: filtered.filter(isOpenRisk).length
        }
      ];
    }
    const map = new Map<string | number, IProjectUpdate[]>();
    filtered.forEach((u) => {
      const key = groupBy === 'week' ? weekStart(u.modified) : u.project;
      const list = map.get(key) || [];
      list.push(u);
      map.set(key, list);
    });
    const entries = Array.from(map.entries());
    if (groupBy === 'project') {
      entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    }
    const thisWk = weekStart(Date.now());
    return entries.map(([key, items]) => {
      if (groupBy === 'week') {
        const k = Number(key);
        const label =
          k === thisWk ? 'This week' : k === thisWk - 7 * DAY_MS ? 'Last week' : `Week of ${formatDate(k)}`;
        return {
          key: String(k),
          label,
          sub: `${formatDate(k)} – ${formatDate(k + 6 * DAY_MS)}`,
          items,
          openRiskCount: items.filter(isOpenRisk).length
        };
      }
      const project = String(key);
      const team = items[0]?.team || '';
      return {
        key: project,
        label: project,
        sub: team ? `${team} team` : '',
        teamColor: team ? teamColor(team, TEAM_PALETTE) : undefined,
        items,
        openRiskCount: items.filter(isOpenRisk).length
      };
    });
  }, [filtered, groupBy]);

  const kpis = useMemo(() => {
    const prevRange = previousPeriod(range.from, range.to);
    const prev = updates.filter((u) => u.modified >= prevRange.from && u.modified <= prevRange.to);
    const teams = new Set(inPeriod.map((u) => u.team).filter(Boolean));
    const wins = inPeriod.filter((u) => u.type === 'milestone' || u.type === 'achievement').length;
    const high = openRisks.filter((u) => u.severity === 'high').length;
    const presetName = DATE_PRESETS.find((p) => p.key === range.preset)?.full || 'Custom range';
    return {
      count: inPeriod.length,
      prevDiff: inPeriod.length - prev.length,
      teamsReporting: teams.size,
      teamsTotal: choices.teams.length,
      wins,
      openRisks: openRisks.length,
      highRisks: high,
      presetName
    };
  }, [inPeriod, updates, range, openRisks, choices.teams.length]);

  const projectRows = useMemo(() => {
    return choices.projects.map((name) => {
      const pu = inPeriod.filter((u) => u.project === name).sort((a, b) => b.modified - a.modified);
      return {
        name,
        latest: pu[0],
        count: pu.length,
        openRisks: pu.filter(isOpenRisk).length
      };
    });
  }, [choices.projects, inPeriod]);

  const coverage = useMemo(() => {
    const missing = choices.projects.filter((p) => !inPeriod.some((u) => u.project === p));
    const total = choices.projects.length || 1;
    const pct = Math.round(((choices.projects.length - missing.length) / total) * 100);
    return { missing, pct: choices.projects.length ? pct : 0 };
  }, [choices.projects, inPeriod]);

  const mix = useMemo(() => {
    return (Object.keys(TYPES) as UpdateTypeKey[]).map((key) => ({
      key,
      label: TYPES[key].label,
      color: TYPES[key].color,
      count: inPeriod.filter((u) => u.type === key).length
    }));
  }, [inPeriod]);

  const members = useMemo(() => {
    return Array.from(new Set(updates.map((u) => u.member).filter(Boolean))).sort();
  }, [updates]);

  const yearSpan =
    new Date(range.from).getFullYear() !== new Date(range.to).getFullYear();

  const rangeLabel = `${formatDate(range.from, yearSpan)} – ${formatDate(range.to, yearSpan)}`;

  const hasActiveFilters = !!(
    filters.q ||
    filters.type ||
    filters.team ||
    filters.project ||
    filters.member ||
    filters.freq
  );

  const patchFilters = useCallback((patch: Partial<IFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
  }, []);

  const submit = useCallback(
    async (payload: ICreateUpdatePayload) => {
      setSaving(true);
      setError(null);
      try {
        const created = await createUpdate(context, payload);
        setUpdates((prev) => [created, ...prev]);
        setFilters({ ...EMPTY_FILTERS });
        setSortBy('new');
        if (created.modified < range.from || created.modified > range.to) {
          setRange(applyPreset('90', [created, ...updates]));
        }
        setFlashId(created.id);
        return created;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to submit update');
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [context, range.from, range.to, updates]
  );

  const toggleResolved = useCallback(
    async (item: IProjectUpdate) => {
      const next = !item.resolved;
      try {
        await setResolved(context, item.id, next);
        setUpdates((prev) => prev.map((u) => (u.id === item.id ? { ...u, resolved: next } : u)));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update risk');
        throw e;
      }
    },
    [context]
  );

  return {
    updates,
    choices,
    loading,
    error,
    saving,
    filters,
    range,
    groupBy,
    sortBy,
    flashId,
    inPeriod,
    filtered,
    typeCounts,
    openRisks,
    groups,
    kpis,
    projectRows,
    coverage,
    mix,
    members,
    rangeLabel,
    hasActiveFilters,
    setPreset,
    setCustomRange,
    setGroupBy,
    setSortBy,
    patchFilters,
    clearFilters,
    submit,
    toggleResolved,
    reload: load,
    setFlashId,
    isOpenRisk
  };
};
