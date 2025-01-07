import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import React from 'react';

import {FileBrowserNameComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

/**
 * Renders the file name for a file row in the file browser, with an optional tooltip for long names.
 * @param item - The ProjectFile for this row
 * @returns An OverflowTooltip component displaying the file name with potential truncation.
 */
export const FileRowName: FileBrowserNameComponentType = ({item}) => {
  return (
    <OverflowTooltip
      tooltipProps={{
        text: item.name,
        tooltipId: `file-tooltip-${item.id}`,
        size: 's',
        direction: 'onBottom',
        className: darkModeStyles.tooltipBottom,
      }}
      tooltipOverlayClassName={moduleStyles.nameContainer}
      className={moduleStyles.nameContainer}
    >
      <span>{item.name}</span>
    </OverflowTooltip>
  );
};
