import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {fetchAITutorInteractions} from '@cdo/apps/aiTutor/interactionsApi';
import InteractionsTableRow from './InteractionsTableRow';
import style from './interactions-table.module.scss';
import {
  StudentChatRow,
  AITutorInteractionStatus,
  AITutorInteractionStatusValue,
} from '@cdo/apps/aiTutor/types';
import CheckboxDropdown, {
  CheckboxOption,
} from '@cdo/apps/componentLibrary/dropdown/checkboxDropdown';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import UnitSelectorV2 from '@cdo/apps/templates/UnitSelectorV2';
import {useSelector} from 'react-redux';
import Button from '@cdo/apps/templates/Button';

type StatusLabels = {
  [key in AITutorInteractionStatusValue]: string;
};

interface UnitData {
  [index: string]: {
    lessons: Lesson[];
  };
}

interface Lesson {
  id: number;
  name: string;
  levels: Level[]; // Array of level objects
}

interface Level {
  id: number;
  levelNumber: number;
}

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
interface InteractionsTableProps {
  sectionId: number;
}

const InteractionsTable: React.FC<InteractionsTableProps> = ({sectionId}) => {
  const [chatMessages, setChatMessages] = useState<StudentChatRow[]>([]);
  const [studentFilterOptions, setStudentFilterOptions] = useState<
    CheckboxOption[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>(
    TimeFilter.AllTime
  );

  const scriptId = useSelector(
    (state: {unitSelection: {scriptId: number}}) => state.unitSelection.scriptId
  );

  console.log(`scriptId`, scriptId);

  const unitList = useSelector(
    (state: {sectionProgress: {unitDataByUnit: UnitData}}) =>
      state.sectionProgress.unitDataByUnit
  );

  console.log(unitList);

  // const lessonOptions = Object.entries(unitList)
  //   .filter(([id, value]) => id === scriptId.toString())
  //   .map(([id, value]) => value.lessons)
  //   .reduce((acc, lessons) => {
  //     return acc.concat(
  //       lessons.map((lesson: any) => ({
  //         text: lesson.name,
  //         value: lesson.id.toString(),
  //       }))
  //     );
  //   }, []);

  console.log(`unitList[scriptId]`, unitList[scriptId]);

  // const lessonOptions = unitList[scriptId].lessons.map((lesson: any) => ({
  //   text: lesson.name,
  //   value: lesson.id.toString(),
  // }));

  let lessonOptions: {text: string; value: string}[] = [];
  if (unitList[scriptId] && unitList[scriptId].lessons) {
    lessonOptions = unitList[scriptId].lessons.map((lesson: Lesson) => ({
      text: lesson.name,
      value: lesson.id.toString(),
    }));
  }

  console.log('lessonOptions', lessonOptions);

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    lessonOptions[0].value
  );

  // let selectedLessonId = '';
  // let selectedLesson;
  // if (lessonOptions.length > 0) {
  //   selectedLessonId = lessonOptions[0].value;
  //   selectedLesson = unitList[scriptId].lessons.find(
  //     lesson => lesson.id.toString() === selectedLessonId
  //   );
  // }

  console.log('selectedLessonId', selectedLessonId);

  //console.log(lessonOptions[selectedLessonId]);

  const selectedLesson = unitList[scriptId].lessons.find(
    lesson => lesson.id.toString() === selectedLessonId
  );
  console.log('selected lesson', selectedLesson);

  // const levelOptions = selectedLesson.levels.map((level: Level) => ({
  //   label: level.levelNumber.toString(),
  //   value: level.id.toString(),
  // }));

  let levelOptions: {label: string; value: string}[] = [];
  if (selectedLesson && selectedLesson.levels) {
    levelOptions = selectedLesson.levels.map((level: Level) => ({
      label: level.levelNumber.toString(),
      value: level.id.toString(),
    }));
  }

  console.log('levelOptions', levelOptions);

  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);

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
    const scriptMatch = scriptId === message.scriptId;

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

    return scriptMatch && statusMatch && userMatch && timeMatch;
  });

  const statusOptions = Object.values(AITutorInteractionStatus).map(status => ({
    label: STATUS_LABELS[status] || 'Unknown',
    value: status,
  }));

  // Define the number of items per page
  const itemsPerPage = 10;

  // Initialize state for the current page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredChatMessages.length / itemsPerPage);

  // Get the items for the current page
  const currentItems = filteredChatMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h3>Select Unit</h3>
      <div className={style.filterDropdowns}>
        <UnitSelectorV2 />
        <SimpleDropdown
          items={lessonOptions}
          selectedValue={selectedLessonId}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedLessonId(event.target.value)
          }
          name="lesson-filter"
          color="black"
          size="s"
          labelText="Choose Lesson"
          isLabelVisible={false}
        />
        <CheckboxDropdown
          allOptions={levelOptions}
          checkedOptions={selectedLevelIds}
          color="black"
          labelText="Filter by Level"
          name="filter-levels"
          onChange={handleStatusFilterChange}
          onClearAll={() => setSelectedLevelIds([])}
          onSelectAll={() =>
            setSelectedLevelIds(Object.values(AITutorInteractionStatus))
          }
          size="s"
        />
      </div>

      <div className={style.filterDropdowns}>
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
            currentItems.map(chatMessage => (
              <InteractionsTableRow
                key={chatMessage.id}
                chatMessage={chatMessage}
              />
            ))
          )}
        </tbody>
      </table>
      <div>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default InteractionsTable;
