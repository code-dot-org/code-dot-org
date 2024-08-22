import moment from 'moment';
import React, {useEffect, useState} from 'react';
import * as Table from 'reactabular-table';

import {fetchAITutorInteractions} from '@cdo/apps/aiTutor/interactionsApi';
import {
  StudentChatRow,
  AITutorInteractionStatus,
  AITutorInteractionStatusValue,
} from '@cdo/apps/aiTutor/types';
import CheckboxDropdown, {
  CheckboxDropdownOption,
} from '@cdo/apps/componentLibrary/dropdown/checkboxDropdown';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import styleConstants from '@cdo/apps/styleConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {tableLayoutStyles as style} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';

// TODO: Condense use of inline and imported styles
import interactionsStyle from './interactions-table.module.scss';

// TODO: Some of these overrides are necessary to reconcile CSS property values that are numbers
// in the tableConstants file but must be strings according to the reactabular-table type definitions.
// We should consider updating the tableConstants file to use strings where necessary.
export const styleOverrides = {
  table: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: `${styleConstants['content-width']}`,
    backgroundColor: color.table_light_row,
  },
  headerCell: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
};

type StatusLabels = {
  [key in AITutorInteractionStatusValue]: string;
};

const STATUS_LABELS: StatusLabels = {
  error: 'Error',
  pii_violation: 'PII Violation',
  profanity_violation: 'Profanity Violation',
  ok: 'Successful',
  unknown: 'Unknown Status',
};

enum TimeFilter {
  LastHour = 'lastHour',
  Last24Hours = 'last24Hours',
  Last7Days = 'last7Days',
  Last30Days = 'last30Days',
  AllTime = 'allTime',
}

const TIME_FILTER_OPTIONS = [
  {value: TimeFilter.LastHour, text: 'Last Hour'},
  {value: TimeFilter.Last24Hours, text: 'Last 24 Hours'},
  {value: TimeFilter.Last7Days, text: 'Last 7 Days'},
  {value: TimeFilter.Last30Days, text: 'Last 30 Days'},
  {value: TimeFilter.AllTime, text: 'All Time'},
];

const interactionFormatter = (prompt: string, aiResponse: string) => {
  const placeholderPrompt = 'No prompt associated with this interaction.';
  const placeholderResponse = 'No response associated with this interaction.';

  return (
    <>
      <span style={{fontWeight: 'bold'}}>{prompt || placeholderPrompt}</span>
      <br />
      <br />
      <SafeMarkdown markdown={aiResponse || placeholderResponse} />
    </>
  );
};

/**
 * Renders a table showing the section's students' chat messages with AI Tutor.
 */
interface InteractionsTableProps {
  sectionId: number;
}

const InteractionsTable: React.FC<InteractionsTableProps> = ({sectionId}) => {
  const [chatMessages, setChatMessages] = useState<StudentChatRow[]>([]);
  const [studentFilterOptions, setStudentFilterOptions] = useState<
    CheckboxDropdownOption[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>(
    TimeFilter.AllTime
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const messages = await fetchAITutorInteractions({sectionId});
        setChatMessages(messages);
        setStudentFilterOptions(generateStudentFilterOptions(messages));
      } catch (error) {
        setChatMessages([]);
      }
      setIsLoading(false);
    })();
  }, [sectionId]);

  const generateStudentFilterOptions = (messages: StudentChatRow[]) => {
    return messages.reduce<CheckboxDropdownOption[]>((acc, message) => {
      const userId = `${message.userId}`;
      if (!acc.some(student => student.value === userId)) {
        acc.push({label: message.studentName, value: userId});
      }
      return acc;
    }, []);
  };

  const statusOptions = Object.values(AITutorInteractionStatus).map(status => ({
    label: STATUS_LABELS[status] || 'Unknown',
    value: status,
  }));

  const columns = [
    {
      property: 'student',
      header: {
        label: 'Student',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(studentName: string) => <span>{studentName}</span>],
        props: {style: style.cell},
      },
    },
    {
      property: 'timestamp',
      header: {
        label: 'Timestamp',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [
          (timestamp: moment.MomentInput) => (
            <span>{moment(timestamp).format('MMM DD, h:mm A')}</span>
          ),
        ],
        props: {style: style.cell},
      },
    },
    {
      property: 'interaction',
      header: {
        label: 'Interaction',
        // Override the default max-width style to allow for longer messages
        props: {
          style: {
            ...style.headerCell,
            ...styleOverrides.headerCell,
            maxWidth: 'unset',
          },
        },
      },
      cell: {
        formatters: [
          (rowData: {prompt: string; aiResponse: string}) =>
            interactionFormatter(rowData.prompt, rowData.aiResponse),
        ],
        props: {style: {...style.cell, maxWidth: 'unset'}},
      },
    },
    {
      property: 'status',
      header: {
        label: 'Status',
        props: {style: {...style.headerCell, ...styleOverrides.headerCell}},
      },
      cell: {
        formatters: [(status: string) => <span>{STATUS_LABELS[status]}</span>],
        props: {style: style.cell},
      },
    },
  ];

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {value, checked} = event.target;
    if (checked) {
      setSelectedStatuses([...selectedStatuses, value]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(status => status !== value));
    }
  };

  const handleStudentFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {value, checked} = event.target;
    if (checked) {
      setSelectedUserIds([...selectedUserIds, value]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(student => student !== value));
    }
  };

  const isTimeMatch = (createdAt: string) => {
    const messageDate = moment(createdAt);
    switch (selectedTimeFilter) {
      case TimeFilter.LastHour:
        return messageDate.isAfter(moment().subtract(1, 'hours'));
      case TimeFilter.Last24Hours:
        return messageDate.isAfter(moment().subtract(24, 'hours'));
      case TimeFilter.Last7Days:
        return messageDate.isAfter(moment().subtract(7, 'days'));
      case TimeFilter.Last30Days:
        // For now, the last 30 days and all-time filters are equivalent because of a
        // cron job that deletes chat messages older than 30 days.
        return messageDate.isAfter(moment().subtract(30, 'days'));
      default:
        return true;
    }
  };

  const filteredChatMessages = chatMessages
    .filter(message => {
      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(message.status);
      const userMatch =
        selectedUserIds.length === 0 ||
        selectedUserIds.includes(`${message.userId}`);
      const timeMatch = isTimeMatch(message.createdAt);
      return statusMatch && userMatch && timeMatch;
    })
    .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));

  if (isLoading) {
    return (
      <div className={interactionsStyle.interactionsElement}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={interactionsStyle.interactionsElement}>
      <div className={interactionsStyle.filterDropdowns}>
        <CheckboxDropdown
          allOptions={statusOptions}
          checkedOptions={selectedStatuses}
          className={interactionsStyle.interactionsElement}
          color="black"
          labelText="Filter by Status"
          name="filter-statuses"
          onChange={handleStatusFilterChange}
          onClearAll={() => setSelectedStatuses([])}
          onSelectAll={() =>
            setSelectedStatuses(Object.values(AITutorInteractionStatus))
          }
          size="s"
        />
        <CheckboxDropdown
          allOptions={studentFilterOptions}
          checkedOptions={selectedUserIds}
          className={interactionsStyle.interactionsElement}
          color="black"
          labelText="Filter by Student"
          name="filter-students"
          onChange={handleStudentFilterChange}
          onClearAll={() => setSelectedUserIds([])}
          onSelectAll={() =>
            setSelectedUserIds(studentFilterOptions.map(option => option.value))
          }
          size="s"
        />
        <SimpleDropdown
          className={interactionsStyle.interactionsElement}
          items={TIME_FILTER_OPTIONS}
          selectedValue={selectedTimeFilter}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedTimeFilter(event.target.value)
          }
          name="time-filter"
          color="black"
          size="s"
          labelText="Filter by Time"
          isLabelVisible={false}
        />
      </div>
      <div className={interactionsStyle.interactionsElement}>
        {filteredChatMessages && filteredChatMessages.length === 0 ? (
          <>There are no chat messages to display.</>
        ) : (
          <Table.Provider
            columns={columns}
            style={{...style.table, ...styleOverrides.table}}
          >
            <Table.Header />
            <Table.Body
              rows={filteredChatMessages.map(msg => ({
                id: msg.id,
                student: msg.studentName,
                timestamp: msg.createdAt,
                interaction: {prompt: msg.prompt, aiResponse: msg.aiResponse},
                status: msg.status,
              }))}
              rowKey="id"
            />
          </Table.Provider>
        )}
      </div>
    </div>
  );
};

export default InteractionsTable;
