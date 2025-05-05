import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';
import {useSelector} from 'react-redux';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './progress-table-v2.module.scss';

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
