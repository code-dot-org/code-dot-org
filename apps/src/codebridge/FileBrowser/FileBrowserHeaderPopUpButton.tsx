import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';

export const FileBrowserHeaderPopUpButton = () => {
  const {openNewFilePrompt, openNewFolderPrompt} = usePrompts();
  const {
    source,
    config: {validMimeTypes},
  } = useCodebridgeContext();
  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(source.files);

  const {startFileUpload, FileUploaderComponent} = useFileUploader({
    callback: handleFileUpload,
    errorCallback: uploadErrorCallback,
    validMimeTypes,
  });

  const backpackApi = useBackpackAPIContext();
  const startImportFromBackpack = () => {
    console.log('import from backpack');
    backpackApi.getFileList(
      () => {
        console.log('onError');
      },
      (filenames: unknown) => {
        console.log('filenames', filenames);
      }
    );
    backpackApi.fetchFile(
      'main.py',
      () => {
        console.log('onError');
      },
      (fileContent: unknown) => {
        console.log('fileContent', fileContent);
      }
    );
  };
  return (
    <>
      <FileUploaderComponent />
      <PopUpButton iconName="plus" alignment="left" id="uitest-files-plus">
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

        <PopUpButtonOption
          iconName="backpack"
          labelText="Import from backpack"
          clickHandler={() => startImportFromBackpack()}
        />
      </PopUpButton>
    </>
  );
};
