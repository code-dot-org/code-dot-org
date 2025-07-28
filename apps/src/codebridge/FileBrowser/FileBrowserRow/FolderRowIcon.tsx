import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ProjectFolder} from '@codebridge/types';
import React from 'react';

import {FileBrowserIconComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * Renders the icon for a folder row in the file browser.
 * @param item - The ProjectFolder for this row
 * @returns A FontAwesomeV6Icon component representing the file icon.
 */
export const FolderRowIcon: FileBrowserIconComponentType = ({item}) => {
  const folderItem = item as ProjectFolder;
  return (
    <FontAwesomeV6Icon
      iconName={folderItem.open ? 'caret-down' : 'caret-right'}
      iconStyle={'solid'}
      className={moduleStyles.rowIcon}
    />
  );
};
