import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {FileUploader} from './FileUploader';
import {
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';
import {newFilePromptType} from './types';

type FileBrowserHeaderPopUpButtonProps = {
  newFilePrompt: newFilePromptType;
};

export const FileBrowserHeaderPopUpButton = ({
  newFilePrompt,
}: FileBrowserHeaderPopUpButtonProps) => {
  const {openNewFolderPrompt} = usePrompts();
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
        clickHandler={() => openNewFolderPrompt({parentId: DEFAULT_FOLDER_ID})}
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
