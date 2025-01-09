import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {FileBrowserIconComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * Renders the icon for a file row in the file browser.
 * @param item - The ProjectFile for this row
 * @returns A FontAwesomeV6Icon component representing the file icon.
 */
export const FileRowIcon: FileBrowserIconComponentType = ({item}) => {
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(
    item as ProjectFile
  );
  const iconClassName = isBrand
    ? classNames('fa-brands', moduleStyles.rowIcon)
    : moduleStyles.rowIcon;
  return (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle={iconStyle}
      className={iconClassName}
    />
  );
};
