import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';

export const FileBrowserHeaderPopUpButton = () => {
  const {openNewFilePrompt, openNewFolderPrompt} = usePrompts();
  const {
    config: {validMimeTypes, supportedFileTypes, editableFileTypes},
    levelProperties,
  } = useCodebridgeContext();
  const {appName} = levelProperties;
  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);
  const openNewFilePromptArgs = {
    folderId: DEFAULT_FOLDER_ID,
    validFileTypes: editableFileTypes,
  };
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );

  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(files);

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

  return (
    <>
      <FileUploaderComponent />
      <PopUpButton
        iconName="plus"
        alignment="left"
        id="uitest-files-plus"
        ariaLabel={codebridgeI18n.manageFiles()}
      >
        <PopUpButtonOption
          iconName="plus"
          labelText={codebridgeI18n.newFolder()}
          clickHandler={() =>
            openNewFolderPrompt({parentId: DEFAULT_FOLDER_ID})
          }
        />
        <PopUpButtonOption
          iconName="plus"
          labelText={codebridgeI18n.newFile()}
          clickHandler={() => openNewFilePrompt(openNewFilePromptArgs)}
          id="uitest-new-file"
        />
        <PopUpButtonOption
          iconName="upload"
          labelText={codebridgeI18n.uploadFile()}
          clickHandler={() => startFileUpload()}
        />
      </PopUpButton>
    </>
  );
};
