import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
} from '@codebridge/FileBrowser/hooks';
import {ProjectFolder} from '@codebridge/types';
import React from 'react';

import {toggleOpenFolderThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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
    config: {validMimeTypes},
    levelProperties,
  } = useCodebridgeContext();
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );
  const appName = levelProperties.appName;
  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);
  const handleFileUpload = useHandleFileUpload(files);
  const fileUploadErrorCallback = useFileUploadErrorCallback();
  const {startFileUpload, FileUploaderComponent} = useFileUploader(
    {
      appName,
      callback: handleFileUpload,
      errorCallback: fileUploadErrorCallback,
      validMimeTypes,
      isBlockedAbuse,
    },
    item.id
  );
  const dropdownOptions = useFolderRowOptions(item, startFileUpload);
  const dispatch = useAppDispatch();
  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );
  const onOpenFunction = (id: string) => {
    dispatch(toggleOpenFolderThunk(id));
    if (isAiTutorVersion) {
      sendLab2AnalyticsEvent(
        EVENTS.AI_TUTOR_VERSION_FILE_BROWSER_TAB_CLICKED_IN_FILE_BROWSER,
        {
          folderId: item.id,
          folderName: item.name,
        }
      );
    }
  };

  return (
    <>
      <FileUploaderComponent />
      <ItemRow
        item={item}
        enableMenu={enableMenu}
        dropdownOptions={dropdownOptions}
        IconComponent={FolderRowIcon}
        NameComponent={FolderRowName}
        openFunction={id => onOpenFunction(id)}
      />
    </>
  );
};
