import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  DatePicker,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  IColumn,
  IDropdownOption,
  Label,
  NormalPeoplePicker,
  SearchBox,
  SelectionMode
} from '@fluentui/react';
import type { IBasePickerSuggestionsProps } from '@fluentui/react/lib/Pickers';
import type { IPersonaProps } from '@fluentui/react/lib/Persona';
import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './ProjectUpdatesList.module.scss';

export interface IProjectUpdatesListProps {
  context: WebPartContext;
}

type UpdateType = 'status' | 'milestone' | 'risk' | 'blocker' | 'note';

interface IProjectUpdate {
  id: string;
  title: string;
  summary: string;
  project: string;
  member: string;
  memberEmail: string;
  type: UpdateType;
  date: Date;
}

interface ISPPeoplePickerUserEntity {
  Description: string;
  DisplayText: string;
  EntityData?: {
    Email?: string;
  };
  Key: string;
}

const projectOptions: IDropdownOption[] = [
  { key: 'contoso-intranet', text: 'Contoso Intranet' },
  { key: 'northwind-crm', text: 'Northwind CRM' },
  { key: 'fabrikam-mobile', text: 'Fabrikam Mobile' },
  { key: 'adventure-works', text: 'Adventure Works Portal' }
];

const typeOptions: IDropdownOption[] = [
  { key: 'status', text: 'Status' },
  { key: 'milestone', text: 'Milestone' },
  { key: 'risk', text: 'Risk' },
  { key: 'blocker', text: 'Blocker' },
  { key: 'note', text: 'Note' }
];

const typeLabels: Record<UpdateType, string> = {
  status: 'Status',
  milestone: 'Milestone',
  risk: 'Risk',
  blocker: 'Blocker',
  note: 'Note'
};

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading'
};

const samplePeople: IPersonaProps[] = [
  { text: 'Alex Johnson', secondaryText: 'alex.johnson@contoso.com' },
  { text: 'Priya Patel', secondaryText: 'priya.patel@contoso.com' },
  { text: 'Jordan Lee', secondaryText: 'jordan.lee@contoso.com' },
  { text: 'Sam Rivera', secondaryText: 'sam.rivera@contoso.com' }
];

const filterSamplePeople = (filterText: string): IPersonaProps[] => {
  const query = filterText.toLowerCase();
  return samplePeople.filter((person) =>
    (person.text || '').toLowerCase().includes(query) ||
    (person.secondaryText || '').toLowerCase().includes(query)
  );
};

const sampleUpdates: IProjectUpdate[] = [
  {
    id: '1',
    title: 'Homepage hero deployed',
    summary: 'New hero banner is live on the intranet home page.',
    project: 'contoso-intranet',
    member: 'Alex Johnson',
    memberEmail: 'alex.johnson@contoso.com',
    type: 'milestone',
    date: new Date(2026, 8, 12)
  },
  {
    id: '2',
    title: 'CRM sync delayed',
    summary: 'Nightly account sync is failing on large tenants.',
    project: 'northwind-crm',
    member: 'Priya Patel',
    memberEmail: 'priya.patel@contoso.com',
    type: 'blocker',
    date: new Date(2026, 8, 18)
  },
  {
    id: '3',
    title: 'Sprint 14 complete',
    summary: 'Mobile onboarding flow and push notifications shipped.',
    project: 'fabrikam-mobile',
    member: 'Jordan Lee',
    memberEmail: 'jordan.lee@contoso.com',
    type: 'status',
    date: new Date(2026, 8, 22)
  },
  {
    id: '4',
    title: 'Auth token expiry risk',
    summary: 'Refresh tokens expire sooner than expected for guest users.',
    project: 'adventure-works',
    member: 'Alex Johnson',
    memberEmail: 'alex.johnson@contoso.com',
    type: 'risk',
    date: new Date(2026, 8, 25)
  },
  {
    id: '5',
    title: 'Search ranking notes',
    summary: 'Documented current ranking rules for project pages.',
    project: 'contoso-intranet',
    member: 'Sam Rivera',
    memberEmail: 'sam.rivera@contoso.com',
    type: 'note',
    date: new Date(2026, 8, 28)
  },
  {
    id: '6',
    title: 'UAT kickoff',
    summary: 'Business users started UAT for the CRM dashboard.',
    project: 'northwind-crm',
    member: 'Priya Patel',
    memberEmail: 'priya.patel@contoso.com',
    type: 'milestone',
    date: new Date(2026, 9, 1)
  }
];

const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const projectLabel = (key: string): string =>
  projectOptions.find((option) => option.key === key)?.text || key;

const searchPeople = async (
  filterText: string,
  context: WebPartContext
): Promise<IPersonaProps[]> => {
  if (!filterText) {
    return [];
  }

  const endpoint =
    `${context.pageContext.web.absoluteUrl}` +
    '/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser';

  try {
    const response = await context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queryParams: {
            AllowEmailAddresses: true,
            AllowMultipleEntities: false,
            AllUrlZones: false,
            MaximumEntitySuggestions: 20,
            PrincipalSource: 15,
            PrincipalType: 1,
            QueryString: filterText
          }
        })
      }
    );

    if (!response.ok) {
      return [];
    }

    const json: { value: string } = await response.json();
    const users: ISPPeoplePickerUserEntity[] = JSON.parse(json.value);

    return users.map((user) => ({
      text: user.DisplayText,
      secondaryText: user.EntityData?.Email || user.Description,
      data: { userId: user.Key }
    }));
  } catch {
    return [];
  }
};

const columns: IColumn[] = [
  {
    key: 'title',
    name: 'Update',
    fieldName: 'title',
    minWidth: 180,
    maxWidth: 280,
    isResizable: true
  },
  {
    key: 'project',
    name: 'Project',
    fieldName: 'project',
    minWidth: 140,
    maxWidth: 200,
    isResizable: true,
    onRender: (item: IProjectUpdate) => projectLabel(item.project)
  },
  {
    key: 'member',
    name: 'Member',
    fieldName: 'member',
    minWidth: 120,
    maxWidth: 180,
    isResizable: true
  },
  {
    key: 'type',
    name: 'Type',
    fieldName: 'type',
    minWidth: 90,
    maxWidth: 120,
    isResizable: true,
    onRender: (item: IProjectUpdate) => typeLabels[item.type]
  },
  {
    key: 'date',
    name: 'Date',
    fieldName: 'date',
    minWidth: 100,
    maxWidth: 130,
    isResizable: true,
    onRender: (item: IProjectUpdate) => formatDate(item.date)
  },
  {
    key: 'summary',
    name: 'Summary',
    fieldName: 'summary',
    minWidth: 220,
    isResizable: true
  }
];

const ProjectUpdatesList: React.FC<IProjectUpdatesListProps> = ({ context }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<IPersonaProps[]>([]);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const onResolveSuggestions = useCallback(
    async (filterText: string): Promise<IPersonaProps[]> => {
      const directoryResults = await searchPeople(filterText, context);
      const localResults = filterSamplePeople(filterText);
      const seen = new Set(
        directoryResults.map((person) =>
          (person.secondaryText || person.text || '').toLowerCase()
        )
      );

      return [
        ...directoryResults,
        ...localResults.filter((person) =>
          !seen.has((person.secondaryText || person.text || '').toLowerCase())
        )
      ];
    },
    [context]
  );

  const resetFilters = useCallback((): void => {
    setSearchText('');
    setSelectedProjects([]);
    setSelectedMembers([]);
    setSelectedType(undefined);
    setFromDate(undefined);
    setToDate(undefined);
  }, []);

  const filteredUpdates = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const memberKeys = selectedMembers.map((person) =>
      (person.text || person.secondaryText || '').toLowerCase()
    );

    return sampleUpdates.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.member.toLowerCase().includes(query) ||
        projectLabel(item.project).toLowerCase().includes(query);

      const matchesProject =
        selectedProjects.length === 0 || selectedProjects.indexOf(item.project) >= 0;

      const matchesMember =
        memberKeys.length === 0 ||
        memberKeys.some((member) =>
          item.member.toLowerCase().includes(member) ||
          item.memberEmail.toLowerCase().includes(member)
        );

      const matchesType = !selectedType || item.type === selectedType;
      const matchesFrom = !fromDate || item.date >= startOfDay(fromDate);
      const matchesTo = !toDate || item.date <= endOfDay(toDate);

      return matchesSearch && matchesProject && matchesMember && matchesType && matchesFrom && matchesTo;
    });
  }, [fromDate, searchText, selectedMembers, selectedProjects, selectedType, toDate]);

  return (
    <section className={`${styles.projectUpdates} ${styles.roundedFields}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Project Updates</h2>
        <p className={styles.description}>
          Search and filter recent project updates by project, member, type, and date.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <SearchBox
            placeholder="Search updates"
            value={searchText}
            onChange={(_, value) => setSearchText(value || '')}
            onClear={() => setSearchText('')}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterField}>
            <Dropdown
              label="Project"
              placeholder="All projects"
              multiSelect
              options={projectOptions}
              selectedKeys={selectedProjects}
              onChange={(_, option) => {
                if (!option) {
                  return;
                }

                setSelectedProjects((prev) =>
                  option.selected
                    ? [...prev, option.key as string]
                    : prev.filter((key) => key !== option.key)
                );
              }}
            />
          </div>

          <div className={styles.filterField}>
            <Label>Member</Label>
            <NormalPeoplePicker
              className={styles.peoplePicker}
              onResolveSuggestions={onResolveSuggestions}
              getTextFromItem={(persona) => persona.text || ''}
              pickerSuggestionsProps={pickerSuggestionsProps}
              selectedItems={selectedMembers}
              onChange={(items) => setSelectedMembers(items || [])}
              inputProps={{
                placeholder: 'Search for a member'
              }}
            />
          </div>

          <div className={styles.filterField}>
            <Dropdown
              label="Type"
              placeholder="All types"
              options={typeOptions}
              selectedKey={selectedType}
              onChange={(_, option) => setSelectedType(option?.key as string | undefined)}
            />
          </div>

          <div className={styles.filterField}>
            <DatePicker
              label="From"
              value={fromDate}
              onSelectDate={(date) => setFromDate(date || undefined)}
              placeholder="Start date"
              maxDate={toDate}
            />
          </div>

          <div className={styles.filterField}>
            <DatePicker
              label="To"
              value={toDate}
              onSelectDate={(date) => setToDate(date || undefined)}
              placeholder="End date"
              minDate={fromDate}
            />
          </div>

          <DefaultButton
            className={styles.resetButton}
            text="Reset"
            iconProps={{ iconName: 'ClearFilter' }}
            onClick={resetFilters}
          />
        </div>
      </div>

      <div className={styles.list}>
        {filteredUpdates.length > 0 ? (
          <DetailsList
            items={filteredUpdates}
            columns={columns}
            setKey="projectUpdates"
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            compact={false}
          />
        ) : (
          <div className={styles.emptyState}>No project updates match the current filters.</div>
        )}
      </div>
    </section>
  );
};

export default ProjectUpdatesList;

.projectUpdates {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: "[theme:bodyText, default: #323130]";
  color: var(--bodyText);
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.description {
  margin: 0;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid "[theme:neutralLight, default: #edebe9]";
  border-radius: 12px;
  background: "[theme:neutralLighterAlt, default: #faf9f8]";
}

.searchRow {
  width: 100%;
}

.filters {
  display: grid;
  grid-template-columns: minmax(160px, 1.2fr) minmax(180px, 1.4fr) minmax(140px, 1fr) minmax(140px, 1fr) minmax(140px, 1fr) auto;
  gap: 0.75rem;
  align-items: end;
}

.filterField {
  min-width: 0;
}

.peoplePicker {
  margin-top: 0.25rem;
}

.resetButton {
  margin-bottom: 2px;
}

.list {
  :global {
    .ms-DetailsList {
      overflow: hidden;
      border: 1px solid "[theme:neutralLight, default: #edebe9]";
      border-radius: 12px;
    }
  }
}

.emptyState {
  padding: 1.5rem 1rem;
  text-align: center;
  color: "[theme:neutralSecondary, default: #605e5c]";
}

.roundedFields {
  :global {
    .ms-SearchBox,
    .ms-TextField-fieldGroup,
    .ms-BasePicker-text,
    .ms-Dropdown-container,
    .ms-DatePicker .ms-TextField-fieldGroup {
      border-radius: 10px;
      overflow: hidden;
    }

    .ms-SearchBox::after,
    .ms-TextField-fieldGroup::after,
    .ms-Dropdown::after {
      border-radius: 10px;
    }
  }
}

@media (max-width: 1100px) {
  .filters {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
