import {Button} from '@code-dot-org/component-library/button';
import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React from 'react';
import {CSVLink} from 'react-csv';

import i18n from '@cdo/locale';

import styles from './progress-table-v2.module.scss';

interface DownloadProgressCsvProps {}

const CSV_HEADERS = [
  {label: 'studentName', key: 'studentName'},
  {label: 'level 1', key: 'level1'},
];

const testData = [
  {studentName: 'Student 1', level1: 'Completed'},
  {studentName: 'Student 2', level1: 'Not Completed'},
];

export const DownloadProgressCsv: React.FC<DownloadProgressCsvProps> = () => {
  return (
    <TooltipOverlay>
      <CSVLink
        role="button"
        filename="progress.csv"
        data={testData}
        headers={CSV_HEADERS}
      >
        <WithTooltip
          tooltipOverlayClassName={styles.downloadCsv}
          tooltipProps={{
            tooltipId: 'csv-download-tooltip',
            role: 'tooltip',
            text: i18n.downloadProgressCsv(),
            direction: 'onTop',
            size: 'm',
          }}
        >
          <Button
            isIconOnly={true}
            icon={{iconName: 'download', iconStyle: 'solid'}}
            onClick={() => {}} // Download is handled by CSVLink
            size="s"
            color="gray"
            aria-label={i18n.downloadCSV()}
            type="secondary"
          />
        </WithTooltip>
      </CSVLink>
    </TooltipOverlay>
  );
};

export default DownloadProgressCsv;
