import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {FileUploader} from './FileUploader';
import {useFileUploadErrorCallback, useHandleFileUpload} from './hooks';
import {PopUpButtonOption} from './PopUpButtonOption';
import {newFolderPromptType, newFilePromptType} from './types';

type FileBrowserHeaderPopUpButtonProps = {
  newFolderPrompt: newFolderPromptType;
  newFilePrompt: newFilePromptType;
};

export const FileBrowserHeaderPopUpButton = ({
  newFolderPrompt,
  newFilePrompt,
}: FileBrowserHeaderPopUpButtonProps) => {
  const {
    project,
    config: {validMimeTypes},
  } = useCodebridgeContext();
  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(project.files);
  return (
    <PopUpButton iconName="plus" alignment="left">
      <PopUpButtonOption
        iconName="plus"
        labelText={codebridgeI18n.newFolder()}
        clickHandler={() => newFolderPrompt()}
      />
      <PopUpButtonOption
        iconName="plus"
        labelText={codebridgeI18n.newFile()}
        clickHandler={() => newFilePrompt()}
      />
      <FileUploader
        validMimeTypes={validMimeTypes}
        callback={(fileName, contents) =>
          handleFileUpload({
            folderId: DEFAULT_FOLDER_ID,
            fileName,
            contents,
          })
        }
        errorCallback={uploadErrorCallback}
      >
        <PopUpButtonOption
          iconName="upload"
          labelText={codebridgeI18n.uploadFile()}
        />
      </FileUploader>
    </PopUpButton>
  );
};
