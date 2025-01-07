import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import classNames from 'classnames';
import React from 'react';

import {useDndDataContext} from '../DnDDataContextProvider';

import {FileBrowserNameComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

/**
 * Renders the folder name for a folder row in the file browser, with an optional tooltip for long names.
 * @param item - The ProjectFolder for this row
 * @returns An OverflowTooltip component displaying the folder name with potential truncation.
 */
export const FolderRowName: FileBrowserNameComponentType = ({item}) => {
  const {dragData, dropData} = useDndDataContext();
  return (
    <OverflowTooltip
      tooltipProps={{
        text: item.name,
        tooltipId: `folder-tooltip-${item.id}`,
        size: 's',
        direction: 'onBottom',
        className: darkModeStyles.tooltipBottom,
      }}
      tooltipOverlayClassName={moduleStyles.nameContainer}
      className={moduleStyles.nameContainer}
    >
      <span
        className={classNames({
          [moduleStyles.acceptingDrop]:
            item.id === dropData?.id && dragData?.parentId !== item.id,
        })}
      >
        {item.name}
      </span>
    </OverflowTooltip>
  );
};
