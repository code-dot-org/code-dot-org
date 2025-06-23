import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import _ from 'lodash';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {getFullName} from '@cdo/apps/templates/manageStudents/utils';
import i18n from '@cdo/locale';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

import {ITEM_TYPE} from './ItemType';
import {getLevelCellValue} from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

export const getLevelProgressCSVData = (
  students: {id: number; name: string; familyName?: string}[],
  unitData: {
    lessons: {
      title: string;
      relative_position: number;
      name: string;
      id: number;
      lockable?: boolean;

      levels: {
        id: string;
        bubbleText: string;
        sublevels?: {id: string; bubbleText: string}[];
      }[];
    }[];
    name: string;
    id: number;
  },
  levelProgressByStudent: {
    [studentId: number]: {[levelId: number]: {status: string} | null};
  }
) => {
  const columnNames = ['Student_Name'];
  const table = students.map(
    student =>
      ({
        Student_Name: getFullName(student),
      } as {
        Student_Name: string;
        [key: string]: string;
      })
  );

  const studentIds = Object.fromEntries(
    students.map(student => [getFullName(student), student.id])
  );

  unitData.lessons.forEach(lesson => {
    // Add all sublevels, but not the parent choice level.
    const levelsToInclude = lesson.levels.flatMap(level => {
      return level.sublevels
        ? level.sublevels.map(sublevel => ({
            ...sublevel,
            levelName: `${lesson.relative_position}.${level.bubbleText}${sublevel.bubbleText}`,
          }))
        : [
            {
              ...level,
              levelName: lesson.lockable
                ? `${lesson.title} ${level.bubbleText}/${lesson.levels.length}`
                : `${lesson.relative_position}.${level.bubbleText}`,
            },
          ];
    });

    levelsToInclude.forEach(level => {
      columnNames.push(level.levelName);

      table.forEach(row => {
        const progress =
          levelProgressByStudent[studentIds[row.Student_Name]][
            _.toNumber(level.id)
          ];
        row[level.levelName] = progress
          ? getLevelCellValue(progress, level, false).title
          : ITEM_TYPE.NO_PROGRESS.title;
      });
    });
  });

  return {columnNames, table};
};

const downloadLevelProgressCSV = () => {
  const store = getStore();
  const unitData = getCurrentUnitData(store.getState()) as {
    lessons: {
      title: string;
      relative_position: number;
      name: string;
      id: number;
      lockable: boolean;

      levels: {
        id: string;
        bubbleText: string;
        sublevels?: {id: string; bubbleText: string}[];
      }[];
    }[];
    name: string;
    id: number;
  };

  const levelProgressByStudent =
    store.getState().sectionProgress.studentLevelProgressByUnit[unitData.id];

  const students = store.getState().teacherSections.selectedStudents;

  const {columnNames, table} = getLevelProgressCSVData(
    students,
    unitData,
    levelProgressByStudent
  );

  downloadCSV(`level_progress_${unitData.name}.csv`, columnNames, table);

  analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DOWNLOAD_LEVEL_CSV, {
    unitName: unitData.name,
  });
};

// Export for testing only
export const getLessonProgressCSVData = (
  students: {id: number; name: string; familyName?: string}[],
  unitData: {
    lessons: {title: string; name: string; id: number}[];
    name: string;
    id: number;
  },
  lessonProgressByStudent: {
    [studentId: number]: {[lessonId: number]: {completedPercent: number}};
  }
) => {
  const columnNames = [
    'Student_Name',
    ...unitData.lessons.map(lesson => lesson.title),
  ];

  const table = students.map(student => {
    const lessonProgress = lessonProgressByStudent[student.id];

    let lessonData = {};

    unitData.lessons.forEach(lesson => {
      const progress = lessonProgress[lesson.id];
      const percent = progress ? Math.round(progress.completedPercent) : '0';

      lessonData = {...lessonData, [lesson.title]: percent + '%'};
    });

    return {
      Student_Name: getFullName(student),
      ...lessonData,
    };
  });
  return {columnNames, table};
};

const downloadLessonProgressCSV = () => {
  const store = getStore();
  const unitData = getCurrentUnitData(store.getState()) as {
    lessons: {title: string; name: string; id: number}[];
    name: string;
    id: number;
  };

  const lessonProgressByStudent =
    store.getState().sectionProgress.studentLessonProgressByUnit[unitData.id];

  const students = store.getState().teacherSections.selectedStudents;

  const {columnNames, table} = getLessonProgressCSVData(
    students,
    unitData,
    lessonProgressByStudent
  );
  downloadCSV(`lesson_progress_${unitData.name}.csv`, columnNames, table);

  analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DOWNLOAD_LESSON_CSV, {
    unitName: unitData.name,
  });
};

// A custom CSV download function that sets up a fake URL with the CSV and triggers a download
// We are using this instead of `react-csv` because we want to create the CSV when the user clicks the button
// and not when the component mounts.
const downloadCSV = (
  fileName: string,
  columnNames: string[],
  table: {[columnName: string]: string}[]
) => {
  const csvString = [
    columnNames,
    ...table.map(row => columnNames.map(columnName => row[columnName])),
  ]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvString], {type: 'text/csv'});

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface DownloadProgressCsvProps {
  isLoading: boolean;
}

export const DownloadProgressCsv: React.FC<DownloadProgressCsvProps> = ({
  isLoading,
}) => {
  const handleDownloadOption = (option: string) => {
    if (option === 'lesson') {
      downloadLessonProgressCSV();
    } else if (option === 'level') {
      downloadLevelProgressCSV();
    }
  };

  return (
    <CustomDropdown
      name="download-progress-csv"
      labelText={i18n.downloadProgressCsv()}
      size="s"
      disabled={isLoading}
      useDSCOButtonAsTrigger
      triggerButtonProps={{
        isIconOnly: true,
        icon: {
          iconName: 'download',
          iconStyle: 'solid',
        },
        color: 'gray',
        type: 'secondary',
        size: 's',
        ariaLabel: i18n.downloadProgressCsv(),
        className: styles.downloadCsvDropdown,
        isPending: isLoading,
      }}
      menuPlacement="right"
    >
      <ul>
        <li>
          <button
            className={styles.dropdownOption}
            onClick={() => handleDownloadOption('lesson')}
            type="button"
          >
            <span>{i18n.downloadLessonProgressCSV()}</span>
          </button>
        </li>
        <li>
          <button
            className={styles.dropdownOption}
            onClick={() => handleDownloadOption('level')}
            type="button"
          >
            <span>{i18n.downloadLevelProgressCSV()}</span>
          </button>
        </li>
      </ul>
    </CustomDropdown>
  );
};

export default DownloadProgressCsv;
