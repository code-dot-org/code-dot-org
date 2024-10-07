import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import {FileUploader} from './FileUploader';
import {
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

export const FileBrowserHeaderPopUpButton = () => {
  const {openNewFilePrompt, openNewFolderPrompt} = usePrompts();
  const {
    project,
    config: {validMimeTypes},
  } = useCodebridgeContext();
  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(project.files);
  return (
    <PopUpButton iconName="plus" alignment="left">
      <div
        onClick={() => openNewFolderPrompt({parentId: DEFAULT_FOLDER_ID})}
        className={classNames(
          darkModeStyles.dropdownItem,
          moduleStyles.dropdownItem
        )}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        <div>{codebridgeI18n.newFolder()}</div>
      </div>
      <div
        onClick={() => openNewFilePrompt({folderId: DEFAULT_FOLDER_ID})}
        className={classNames(
          darkModeStyles.dropdownItem,
          moduleStyles.dropdownItem
        )}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        <div>{codebridgeI18n.newFile()}</div>
      </div>
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
        <div
          className={classNames(
            darkModeStyles.dropdownItem,
            moduleStyles.dropdownItem
          )}
        >
          <FontAwesomeV6Icon iconName="upload" iconStyle="solid" />
          <div>{codebridgeI18n.uploadFile()}</div>
        </div>
      </FileUploader>
    </PopUpButton>
  );
};
