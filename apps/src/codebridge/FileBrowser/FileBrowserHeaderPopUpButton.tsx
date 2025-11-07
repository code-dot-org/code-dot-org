import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  PYTHONLAB_EDITABLE_FILE_TYPES,
  PYTHONLAB_SUPPORTED_FILE_TYPES,
} from '@cdo/apps/pythonlab/constants';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  WEBLAB2_EDITABLE_FILE_TYPES,
  WEBLAB2_SUPPORTED_FILE_TYPES,
} from '@cdo/apps/weblab2/constants';

import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';

export const FileBrowserHeaderPopUpButton = () => {
  const {openNewFilePrompt, openNewFolderPrompt, openImportFromBackpackPrompt} =
    usePrompts();
  const {
    config: {validMimeTypes},
    levelProperties,
  } = useCodebridgeContext();
  const {appName, validationFile} = levelProperties;
  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);
  const editableFileTypes =
    appName === 'weblab2'
      ? WEBLAB2_EDITABLE_FILE_TYPES
      : PYTHONLAB_EDITABLE_FILE_TYPES;
  const openNewFilePromptArgs = {
    folderId: DEFAULT_FOLDER_ID,
    validFileTypes: editableFileTypes,
  };
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );

  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(files);

  const supportedFileTypes =
    appName === 'weblab2'
      ? WEBLAB2_SUPPORTED_FILE_TYPES
      : PYTHONLAB_SUPPORTED_FILE_TYPES;
  const {startFileUpload, FileUploaderComponent} = useFileUploader(
    {
      appName,
      callback: handleFileUpload,
      errorCallback: uploadErrorCallback,
      validMimeTypes,
      validFileTypes: supportedFileTypes,
      isBlockedAbuse,
    },
    DEFAULT_FOLDER_ID
  );

  const backpackApi = useBackpackAPIContext();
  return (
    <>
      <FileUploaderComponent />
      <ActionDropdown
        name="uitest-files-plus"
        labelText={codebridgeI18n.manageFiles()}
        triggerButtonProps={{
          isIconOnly: true,
          icon: {iconName: 'plus', iconStyle: 'solid'},
          color: 'gray',
          type: 'tertiary',
        }}
        size="xs"
        menuVerticalPlacement="bottom"
        renderMenuInPortal
        options={[
          {
            value: 'newFolder',
            label: codebridgeI18n.newFolder(),
            icon: {iconName: 'plus'},
            onClick: () => {
              openNewFolderPrompt({parentId: DEFAULT_FOLDER_ID});
            },
          },
          {
            value: 'newFile',
            label: codebridgeI18n.newFile(),
            icon: {iconName: 'plus', iconStyle: 'solid'},
            onClick: () => openNewFilePrompt(openNewFilePromptArgs),
            optionId: 'uitest-new-file',
          },
          {
            value: 'uploadFile',
            label: codebridgeI18n.uploadFile(),
            icon: {iconName: 'upload', iconStyle: 'solid'},
            onClick: () => startFileUpload(),
          },
          {
            value: 'importFromBackpack',
            label: codebridgeI18n.importFromBackpackTitle(),
            icon: {iconName: 'backpack', iconStyle: 'solid'},
            onClick: () =>
              openImportFromBackpackPrompt({
                backpackApi: backpackApi,
                projectFiles: files,
                validationFile: validationFile,
              }),
          },
        ]}
      />
    </>
  );
};
