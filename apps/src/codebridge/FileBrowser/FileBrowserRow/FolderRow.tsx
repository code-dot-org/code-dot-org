import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
} from '@codebridge/FileBrowser/hooks';
import {ProjectFolder} from '@codebridge/types';
import React from 'react';

import {FolderRowIcon} from './FolderRowIcon';
import {FolderRowName} from './FolderRowName';
import {useFolderRowOptions} from './hooks';
import {ItemRow} from './ItemRow';

export type FolderRowProps = {
  item: ProjectFolder;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
};

/**
 * A single folder row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 * @param item - The ProjectFolder to be displayed.
 * @param enableMenu - Whether to show the context menu for the folder.
 */
export const FolderRow: React.FunctionComponent<FolderRowProps> = ({
  item,
  enableMenu,
}) => {
  const {
    source: {files},
    config: {validMimeTypes},
  } = useCodebridgeContext();

  const handleFileUpload = useHandleFileUpload(files);
  const fileUploadErrorCallback = useFileUploadErrorCallback();
  const {startFileUpload, FileUploaderComponent} = useFileUploader({
    callback: handleFileUpload,
    errorCallback: fileUploadErrorCallback,
    validMimeTypes,
  });
  const {toggleOpenFolder} = useCodebridgeContext();
  const dropdownOptions = useFolderRowOptions(item, startFileUpload);

  return (
    <>
      <FileUploaderComponent />
      <ItemRow
        item={item}
        enableMenu={enableMenu}
        dropdownOptions={dropdownOptions}
        IconComponent={FolderRowIcon}
        NameComponent={FolderRowName}
        openFunction={toggleOpenFolder}
      />
    </>
  );
};
