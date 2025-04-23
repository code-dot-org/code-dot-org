import {Button} from '@code-dot-org/component-library/button';
import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './progress-table-v2.module.scss';

interface DownloadProgressCsvProps {}

export const DownloadProgressCsv: React.FC<DownloadProgressCsvProps> = () => {
  const handleDownload = () => {
    // Does nothing as per requirements
  };

  return (
    <TooltipOverlay>
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
          onClick={handleDownload}
          size="s"
          color="gray"
          aria-label={i18n.downloadCSV()}
          type="secondary"
        />
      </WithTooltip>
    </TooltipOverlay>
  );
};

export default DownloadProgressCsv;
