import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import {useSelector} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

import styles from './progress-table-v2.module.scss';

const downloadLessonProgressCSV = () => {
  const store = getStore();
  const unitData = getCurrentUnitData(store.getState());
  const unitId = store.getState().unitSelection.scriptId;

  const lessonProgressByStudent =
    store.getState().sectionProgress.studentLessonProgressByUnit[unitId];

  const students = store.getState().teacherSections.selectedStudents;

  const columnNames = ['Student_Name'];

  console.log('lfm', {unitData, lessonProgressByStudent, students});
  const table = students.map((student: {name: string}) => ({
    Student_Name: student.name,
  }));

  downloadCSV(`lesson_progress_${unitId}.csv`, columnNames, table);
  console.log('lfm', {unitData, lessonProgressByStudent});
};

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

export const DownloadProgressCsv: React.FC = () => {
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
    <CustomDropdown
      name="download-progress-csv"
      labelText={i18n.downloadProgressCsv()}
      size="s"
      useDSCOButtonAsTrigger={true}
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
    >
      <ul>
        <li key="lesson test">
          <button onClick={downloadLessonProgressCSV} type="button">
            test download lesson
          </button>
        </li>
        <li key="level">
          <a
            href={getDownloadUrl('level')}
            aria-label={i18n.downloadCSV()}
            type="secondary"
            target="_blank"
            rel="noreferrer"
            download={true}
            className={styles.dropdownMenuItem}
          >
            {i18n.downloadLevelProgressCSV()}
          </a>
        </li>
        <li key="lesson">
          <a
            href={getDownloadUrl('lesson')}
            aria-label={i18n.downloadCSV()}
            type="secondary"
            target="_blank"
            rel="noreferrer"
            download={true}
            className={styles.dropdownMenuItem}
          >
            {i18n.downloadLessonProgressCSV()}
          </a>
        </li>
      </ul>
    </CustomDropdown>
  );
};

export default DownloadProgressCsv;
