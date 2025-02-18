import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {ProjectFile} from '@codebridge/types';
import React from 'react';

import {FileRowIcon} from './FileRowIcon';
import {FileRowName} from './FileRowName';
import {useFileRowOptions} from './hooks';
import {ItemRow} from './ItemRow';

export type FileRowProps = {
  item: ProjectFile;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  hasValidationFile: boolean; // If the project has a validation file already.
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
}) => {
  const {openFile} = useCodebridgeContext();
  const dropdownOptions = useFileRowOptions(item, hasValidationFile);

  return (
    <ItemRow
      item={item}
      enableMenu={enableMenu}
      dropdownOptions={dropdownOptions}
      IconComponent={FileRowIcon}
      NameComponent={FileRowName}
      openFunction={openFile}
    />
  );
};
