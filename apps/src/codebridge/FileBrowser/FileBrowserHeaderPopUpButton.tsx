import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {PYTHONLAB_VALID_FILE_TYPES} from '@cdo/apps/pythonlab/constants';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const openNewFilePromptArgs = {
    folderId: DEFAULT_FOLDER_ID,
    ...(appName === 'pythonlab' && {
      validFileTypes: PYTHONLAB_VALID_FILE_TYPES,
    }),
  };
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );

  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(files);

  const {startFileUpload, FileUploaderComponent} = useFileUploader(
    {
      callback: handleFileUpload,
      errorCallback: uploadErrorCallback,
      validMimeTypes,
      ...(appName === 'pythonlab' && {
        validFileTypes: PYTHONLAB_VALID_FILE_TYPES,
      }),
    },
    DEFAULT_FOLDER_ID
  );

  const backpackApi = useBackpackAPIContext();
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
        <PopUpButtonOption
          iconName="backpack"
          labelText={codebridgeI18n.importFromBackpackTitle()}
          clickHandler={() =>
            openImportFromBackpackPrompt({
              backpackApi: backpackApi,
              projectFiles: files,
              validationFile: validationFile,
            })
          }
        />
      </PopUpButton>
    </>
  );
};
