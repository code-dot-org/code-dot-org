import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import {useSelector} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import {getFullName} from '@cdo/apps/templates/manageStudents/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

import styles from './progress-table-v2.module.scss';

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
  return {unitName: unitData.name, columnNames, table};
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

  const {unitName, columnNames, table} = getLessonProgressCSVData(
    students,
    unitData,
    lessonProgressByStudent
  );
  downloadCSV(`lesson_progress_${unitName}.csv`, columnNames, table);
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

interface DownloadProgressCsvProps {}

export const DownloadProgressCsv: React.FC<DownloadProgressCsvProps> = () => {
  const unitId = useSelector(
    (state: {unitSelection: {scriptId: number}}) => state.unitSelection.scriptId
  );

  const sectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );

  const getDownloadUrl = React.useCallback(
    (type: string) =>
      `/teacher_dashboard/sections/${sectionId}/download_progress_csv?unit_id=${unitId}&type=${type}`,
    [sectionId, unitId]
  );

  return (
    <ActionDropdown
      name="download-progress-csv"
      labelText={i18n.downloadProgressCsv()}
      size="s"
      options={[
        {
          label: i18n.downloadLessonProgressCSV(),
          icon: {iconName: 'download', iconStyle: 'solid'},
          value: 'lesson',
          onClick: () => {
            downloadLessonProgressCSV();
          },
        },
        {
          label: i18n.downloadLevelProgressCSV(),
          icon: {iconName: 'download', iconStyle: 'solid'},
          value: 'level',
          onClick: () => {
            window.open(getDownloadUrl('level'), '_blank');
          },
        },
      ]}
      menuPlacement="right"
      triggerButtonProps={{
        isIconOnly: true,
        icon: {
          iconName: 'download',
          iconStyle: 'solid',
        },
        color: 'gray',
        type: 'secondary',
        size: 's',
        ariaLabel: i18n.sectionOptionsDropdown(),
        className: styles.downloadCsvDropdown,
      }}
    />
  );
};

export default DownloadProgressCsv;
