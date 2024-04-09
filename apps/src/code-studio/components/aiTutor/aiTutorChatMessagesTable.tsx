import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {fetchAITutorInteractions} from '@cdo/apps/aiTutor/interactionsApi';
import AITutorChatMessagesTableRow from './aiTutorChatMessageTableRow';
import style from './chat-messages-table.module.scss';
import {
  StudentChatRow,
  AITutorInteractionStatus,
  AITutorInteractionStatusValue,
} from '@cdo/apps/aiTutor/types';
import CheckboxDropdown, {
  CheckboxOption,
} from '@cdo/apps/componentLibrary/dropdown/checkboxDropdown';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';

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

/**
 * Renders a table showing the section's students' chat messages with AI Tutor.
 */
interface AITutorChatMessagesTableProps {
  sectionId: number;
}

const AITutorChatMessagesTable: React.FunctionComponent<
  AITutorChatMessagesTableProps
> = ({sectionId}) => {
  const [chatMessages, setChatMessages] = useState<StudentChatRow[]>([]);
  const [studentFilterOptions, setStudentFilterOptions] = useState<
    CheckboxOption[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>(
    TimeFilter.AllTime
  );

  useEffect(() => {
    (async () => {
      try {
        const chatMessages = await fetchAITutorInteractions({sectionId});
        setChatMessages(chatMessages);
      } catch (error) {
        console.log('error', error);
      }
    })();
  }, [sectionId]);

  useEffect(() => {
    const uniqueStudentFilterOptions = chatMessages.reduce<CheckboxOption[]>(
      (acc, message) => {
        const userId = `${message.userId}`;
        if (!acc.some(student => student.value === userId)) {
          acc.push({label: message.studentName, value: userId});
        }
        return acc;
      },
      []
    );
    setStudentFilterOptions(uniqueStudentFilterOptions);
  }, [chatMessages]);

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

  const filteredChatMessages = chatMessages.filter(message => {
    const statusMatch =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(message.status);

    const userMatch =
      selectedUserIds.length === 0 ||
      selectedUserIds.includes(`${message.userId}`);

    const messageDate = moment(message.createdAt);
    let timeMatch = false;
    switch (selectedTimeFilter) {
      case TimeFilter.LastHour:
        timeMatch = messageDate.isAfter(moment().subtract(1, 'hours'));
        break;
      case TimeFilter.Last24Hours:
        timeMatch = messageDate.isAfter(moment().subtract(24, 'hours'));
        break;
      case TimeFilter.Last7Days:
        timeMatch = messageDate.isAfter(moment().subtract(7, 'days'));
        break;
      // For now, the last 30 days and all-time filters are equivalent because of a
      // cron job that deletes chat messages older than 30 days.
      case TimeFilter.Last30Days:
        timeMatch = messageDate.isAfter(moment().subtract(30, 'days'));
        break;
      default:
        timeMatch = true;
    }

    return statusMatch && userMatch && timeMatch;
  });

  const statusOptions = Object.values(AITutorInteractionStatus).map(status => ({
    label: STATUS_LABELS[status] || 'Unknown',
    value: status,
  }));

  return (
    <div>
      <div>
        <CheckboxDropdown
          allOptions={statusOptions}
          checkedOptions={selectedStatuses}
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
      <table>
        <thead>
          <tr>
            <td>
              <div className={style.header}>Id</div>
            </td>
            <td>
              <div className={style.header}>Student</div>
            </td>
            <td>
              <div className={style.header}>Timestamp</div>
            </td>
            <td>
              <div className={style.header}>AI Tutor Responses</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {!filteredChatMessages.length ? (
            <tr>
              <td colSpan={4}>No chat messages found.</td>
            </tr>
          ) : (
            filteredChatMessages.map(chatMessage => (
              <AITutorChatMessagesTableRow
                key={chatMessage.id}
                chatMessage={chatMessage}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AITutorChatMessagesTable;
