import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import React from 'react';

import {newFolderPromptType, newFilePromptType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type FileBrowserHeaderPopUpButtonProps = {
  newFolderPrompt: newFolderPromptType;
  newFilePrompt: newFilePromptType;
};

export const FileBrowserHeaderPopUpButton = ({
  newFolderPrompt,
  newFilePrompt,
}: FileBrowserHeaderPopUpButtonProps) => (
  <PopUpButton iconName="plus" alignment="right">
    <span className={moduleStyles['button-bar']}>
      <button type="button" onClick={() => newFolderPrompt()}>
        <i className="fa-solid fa-folder" />
        New Folder
      </button>
      <button type="button" onClick={() => newFilePrompt()}>
        <i className="fa-solid fa-file" />
        New File
      </button>
    </span>
  </PopUpButton>
);
