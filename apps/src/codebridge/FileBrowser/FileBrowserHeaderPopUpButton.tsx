import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

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
}: FileBrowserHeaderPopUpButtonProps) => (
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
  </PopUpButton>
);
