import {ProjectFile} from '@codebridge/types';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {setActiveFileThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {FileRowIcon} from './FileRowIcon';
import {FileRowName} from './FileRowName';
import {useFileRowOptions} from './hooks';
import {ItemRow} from './ItemRow';

import moduleStyles from '@codebridge/FileBrowser/styles/filebrowser.module.scss';

export type FileRowProps = {
  item: ProjectFile;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  hasValidationFile: boolean; // If the project has a validation file already.
  isDragging?: boolean; // If the file is actively being dragged.
};

/**
 * A single file row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 * @param item - The ProjectFile to be displayed.
 * @param enableMenu - Whether to show the context menu for the file.
 * @param hasValidationFile - Indicates if the file has a corresponding validation file.
 */
export const FileRow: React.FunctionComponent<FileRowProps> = ({
  item,
  enableMenu,
  hasValidationFile,
  isDragging,
}) => {
  const dispatch = useAppDispatch();
  const dropdownOptions = useFileRowOptions(item, hasValidationFile);
  const isActive = item.active || false;
  const className = useMemo(() => {
    const classes = [];
    if (isActive) {
      classes.push(moduleStyles.activeFile);
    }
    if (isDragging) {
      classes.push(moduleStyles.dragging);
    }
    return classNames(...classes);
  }, [isActive, isDragging]);

  return (
    <ItemRow
      item={item}
      enableMenu={enableMenu}
      dropdownOptions={dropdownOptions}
      IconComponent={FileRowIcon}
      NameComponent={FileRowName}
      openFunction={id => dispatch(setActiveFileThunk(id))}
      className={className}
    />
  );
};
