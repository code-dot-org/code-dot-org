import {LinkButton} from '@code-dot-org/component-library/button';
import {
  TooltipOverlay,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
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
        <LinkButton
          href={`/teacher_dashboard/sections/${sectionId}/download_progress_csv?unit_id=${unitId}&type=level`}
          download={true}
          isIconOnly={true}
          icon={{iconName: 'download', iconStyle: 'solid'}}
          size="s"
          color="gray"
          aria-label={i18n.downloadCSV()}
          type="secondary"
          target="_blank"
        />
      </WithTooltip>
    </TooltipOverlay>
  );
};

export default DownloadProgressCsv;
