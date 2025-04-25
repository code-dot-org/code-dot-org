import {LinkButton} from '@code-dot-org/component-library/button';
import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './progress-table-v2.module.scss';

interface DownloadProgressCsvProps {}

export const DownloadProgressCsv: React.FC<DownloadProgressCsvProps> = () => {
  return (
    <TooltipOverlay>
      {/* <CSVLink
        role="button"
        filename="progress.csv"
        data={() => getCsvData()}
        headers={CSV_HEADERS}
        ref={csvLinkRef}
        asyncOnClick={true}
      /> */}
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
        <LinkButton
          href="/teacher_dashboard/sections/1/download_progress_csv/test"
          useAsLink={true}
          download={true}
          isIconOnly={true}
          icon={{iconName: 'download', iconStyle: 'solid'}}
          size="s"
          color="gray"
          aria-label={i18n.downloadCSV()}
          type="secondary"
        />
        {/* <Button
          isIconOnly={true}
          icon={{iconName: 'download', iconStyle: 'solid'}}
          onClick={() => {
            if (csvLinkRef.current && csvLinkRef.current.link) {
              csvLinkRef.current.link.click();
            }
          }} // Download is handled by CSVLink
          size="s"
          color="gray"
          aria-label={i18n.downloadCSV()}
          type="secondary"
          isPending={isLoading}
        /> */}
      </WithTooltip>
    </TooltipOverlay>
  );
};

export default DownloadProgressCsv;
