import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import experiments from '@cdo/apps/util/experiments';
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
    source,
    config: {validMimeTypes},
  } = useCodebridgeContext();
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );

  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(source.files);

  const {startFileUpload, FileUploaderComponent} = useFileUploader(
    {
      callback: handleFileUpload,
      errorCallback: uploadErrorCallback,
      validMimeTypes,
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
          clickHandler={() => openNewFilePrompt({folderId: DEFAULT_FOLDER_ID})}
          id="uitest-new-file"
        />

        <PopUpButtonOption
          iconName="upload"
          labelText={codebridgeI18n.uploadFile()}
          clickHandler={() => startFileUpload()}
        />
        {experiments.isEnabled(experiments.PYTHONLAB_BACKPACK) && (
          <PopUpButtonOption
            iconName="backpack"
            labelText={codebridgeI18n.importFromBackpack()}
            clickHandler={() =>
              openImportFromBackpackPrompt({
                backpackApi: backpackApi,
                projectFiles: source.files,
                validationFile: validationFile,
              })
            }
          />
        )}
      </PopUpButton>
    </>
  );
};
