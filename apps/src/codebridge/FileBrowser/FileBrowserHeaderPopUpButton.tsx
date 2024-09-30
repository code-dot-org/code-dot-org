import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';

import {FileUploader} from './FileUploader';
import {useFileUploadErrorCallback, useHandleFileUpload} from './hooks';
import {newFolderPromptType, newFilePromptType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

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
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const hasValidationFile = useMemo(() => {
    return (
      isStartMode &&
      Object.values(project.files).find(
        f => f.type === ProjectFileType.VALIDATION
      )
    );
  }, [project.files, isStartMode]);

  return (
    <PopUpButton iconName="plus" alignment="left">
      <div
        onClick={() => newFolderPrompt()}
        className={classNames(
          darkModeStyles.dropdownItem,
          moduleStyles.dropdownItem
        )}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        <div>{codebridgeI18n.newFolder()}</div>
      </div>
      <div
        onClick={() => newFilePrompt()}
        className={classNames(
          darkModeStyles.dropdownItem,
          moduleStyles.dropdownItem
        )}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        <div>{codebridgeI18n.newFile()}</div>
      </div>
      {isStartMode && !hasValidationFile && (
        <div
          onClick={() =>
            newFilePrompt(DEFAULT_FOLDER_ID, ProjectFileType.VALIDATION)
          }
          className={classNames(
            darkModeStyles.dropdownItem,
            moduleStyles.dropdownItem
          )}
        >
          <FontAwesomeV6Icon iconName="flask" iconStyle="solid" />
          <div>{codebridgeI18n.newValidationFile()}</div>
        </div>
      )}
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
