import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {useDndDataContext} from '../DnDDataContextProvider';

import {FileBrowserNameComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * Renders the folder name for a folder row in the file browser.
 */
export const FolderRowName: FileBrowserNameComponentType = ({item}) => {
  const {dragData, dropData} = useDndDataContext();
  return (
    <div className={moduleStyles.nameContainer}>
      <Typography
        className={classNames({
          [moduleStyles.acceptingDrop]:
            item.id === dropData?.id && dragData?.parentId !== item.id,
        })}
        variant="body4"
      >
        {item.name}
      </Typography>
    </div>
  );
};
