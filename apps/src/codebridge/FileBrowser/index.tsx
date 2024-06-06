import {
  useCodebridgeContext,
  getNextFileId,
  getNextFolderId,
} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {ProjectType, FolderId} from '@codebridge/types';
import {findFolder, getErrorMessage} from '@codebridge/utils';
import React, {useContext, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {
  DialogContext,
  DialogType,
} from '@cdo/apps/lab2/views/dialogs/DialogManager';

import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  moveFilePromptType,
  newFilePromptType,
  newFolderPromptType,
  renameFilePromptType,
  renameFolderPromptType,
  toggleFileVisibilityType,
} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type FilesComponentProps = {
  files: ProjectType['files'];
  folders: ProjectType['folders'];
  parentId?: FolderId;

  moveFilePrompt: moveFilePromptType;
  newFilePrompt: newFilePromptType;
  newFolderPrompt: newFolderPromptType;
  renameFilePrompt: renameFilePromptType;
  renameFolderPrompt: renameFolderPromptType;
  toggleFileVisibility: toggleFileVisibilityType;
};

const InnerFileBrowser = React.memo(
  ({
    parentId,
    folders,
    files,
    newFolderPrompt,
    newFilePrompt,
    moveFilePrompt,
    renameFilePrompt,
    renameFolderPrompt,
    toggleFileVisibility,
  }: FilesComponentProps) => {
    const {openFile, deleteFile, toggleOpenFolder, deleteFolder} =
      useCodebridgeContext();
    const dialogControl = useContext(DialogContext);
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    const handleDeleteFile = (fileId: string) => {
      const filename = files[fileId].name;
      const title = 'Delete File';
      const message = `Are you sure you want to delete the file ${filename}?`;
      dialogControl?.showGenericDialog(
        DialogType.GenericConfirmation,
        () => deleteFile(fileId),
        title,
        message
      );
    };

    const handleDeleteFolder = (folderId: string) => {
      const folderName = folders[folderId].name;
      const title = 'Delete Folder';
      const message = `Are you sure you want to delete the folder ${folderName}? This will delete all files and folders inside ${folderName}.`;
      dialogControl?.showGenericDialog(
        DialogType.GenericConfirmation,
        () => deleteFolder(folderId),
        title,
        message
      );
    };

    return (
      <>
        {Object.values(folders)
          .filter(f => f.parentId === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const caret = (
              <i
                className={
                  f.open ? 'fa-solid fa-caret-down' : 'fa-solid fa-caret-right'
                }
              />
            );
            return (
              <li key={f.id + f.open}>
                <span className={moduleStyles.label}>
                  <span className={moduleStyles.title}>
                    <span
                      className={moduleStyles['caret-container']}
                      onClick={() => toggleOpenFolder(f.id)}
                    >
                      {caret}
                    </span>
                    <span>{f.name}</span>
                  </span>
                  <PopUpButton
                    iconName="ellipsis-v"
                    className={moduleStyles['button-kebab']}
                  >
                    <span className={moduleStyles['button-bar']}>
                      <span onClick={() => renameFolderPrompt(f.id)}>
                        <i className="fa-solid fa-pencil" /> Rename folder
                      </span>
                      <span onClick={() => newFolderPrompt(f.id)}>
                        <i className="fa-solid fa-folder-plus" /> Add sub-folder
                      </span>
                      <span onClick={() => newFilePrompt(f.id)}>
                        <i className="fa-solid fa-plus" /> Add file
                      </span>
                      <span onClick={() => handleDeleteFolder(f.id)}>
                        <i className="fa-solid fa-trash" /> Delete folder
                      </span>
                    </span>
                  </PopUpButton>
                </span>
                {f.open && (
                  <ul>
                    <InnerFileBrowser
                      folders={folders}
                      newFolderPrompt={newFolderPrompt}
                      parentId={f.id}
                      files={files}
                      newFilePrompt={newFilePrompt}
                      moveFilePrompt={moveFilePrompt}
                      renameFilePrompt={renameFilePrompt}
                      renameFolderPrompt={renameFolderPrompt}
                      toggleFileVisibility={toggleFileVisibility}
                    />
                  </ul>
                )}
              </li>
            );
          })}
        {Object.values(files)
          .filter(f => f.folderId === parentId && (!f.hidden || isStartMode))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => (
            <li key={f.id}>
              <span className={moduleStyles.label}>
                <span onClick={() => openFile(f.id)}>
                  {isStartMode && (
                    <i
                      className={`fa-solid ${
                        f.hidden ? 'fa-eye-slash' : 'fa-eye'
                      }`}
                    />
                  )}
                  <i className="fa-solid fa-file" />
                  {f.name}
                </span>
                <PopUpButton
                  iconName="ellipsis-v"
                  className={moduleStyles['button-kebab']}
                >
                  <span className={moduleStyles['button-bar']}>
                    <span onClick={() => moveFilePrompt(f.id)}>
                      <i className="fa-solid fa-arrow-right" />
                      Move file
                    </span>
                    <span onClick={() => renameFilePrompt(f.id)}>
                      <i className="fa-solid fa-pencil" /> Rename file
                    </span>
                    <span onClick={() => handleDeleteFile(f.id)}>
                      <i className="fa-solid fa-trash" /> Delete file
                    </span>
                    {isStartMode && (
                      <span onClick={() => toggleFileVisibility(f.id)}>
                        <i
                          className={`fa-solid ${
                            f.hidden ? 'fa-eye' : 'fa-eye-slash'
                          }`}
                        />
                      </span>
                    )}
                  </span>
                </PopUpButton>
              </span>
            </li>
          ))}
      </>
    );
  }
);

export const FileBrowser = React.memo(() => {
  const {
    project,
    newFile,
    renameFile,
    moveFile,

    renameFolder,
    newFolder,
    setFileVisibility,
  } = useCodebridgeContext();

  const newFolderPrompt: FilesComponentProps['newFolderPrompt'] = useMemo(
    () =>
      (parentId = DEFAULT_FOLDER_ID) => {
        const folderId = getNextFolderId(Object.values(project.folders));

        const folderName = window.prompt('Please name your new folder');
        if (!folderName) {
          return;
        }

        const existingFolder = Object.values(project.folders).some(
          f => f.name === folderName && f.parentId === parentId
        );
        if (existingFolder) {
          alert('Folder already exists');
          return;
        }

        newFolder({parentId, folderName, folderId});
      },
    [newFolder, project.folders]
  );

  const newFilePrompt: FilesComponentProps['newFilePrompt'] = useMemo(
    () =>
      (folderId = DEFAULT_FOLDER_ID) => {
        const fileName = window
          .prompt('Please name your new file')
          ?.replace(/[^\w.]+/g, '');
        if (!fileName) {
          return;
        }

        const existingFile = Object.values(project.files).some(
          f => f.name === fileName && f.folderId === folderId
        );
        if (existingFile) {
          alert('File already exists');
          return;
        }

        /* eslint-disable-next-line */
        const [_, extension] = fileName.split('.');
        if (!extension) {
          window.alert('Files must have extensions');
          return;
        }

        const fileId = getNextFileId(Object.values(project.files));
        newFile({
          fileId,
          fileName,
          folderId,
        });
      },
    [newFile, project.files]
  );

  const moveFilePrompt: FilesComponentProps['moveFilePrompt'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];

      const destinationFolder =
        window.prompt('Please enter your destination folder') ?? '';

      try {
        const folderId = findFolder(destinationFolder.split('/'), {
          folders: Object.values(project.folders),
          required: true,
        });

        const existingFile = Object.values(project.files).some(
          f => f.name === file.name && f.folderId === folderId
        );
        if (existingFile) {
          alert('File already exists');
          return;
        }

        moveFile(fileId, folderId);
      } catch (e) {
        window.alert(getErrorMessage(e));
      }
    },
    [moveFile, project.files, project.folders]
  );

  const renameFilePrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      const newName = window.prompt('Rename file', file.name);
      if (newName === null || newName === file.name) {
        return;
      }

      const existingFile = Object.values(project.files).some(
        f => f.name === newName && f.folderId === file.folderId
      );
      if (existingFile) {
        alert('File already exists');
        return;
      }

      renameFile(fileId, newName);
    },
    [renameFile, project.files]
  );

  const renameFolderPrompt: FilesComponentProps['renameFolderPrompt'] = useMemo(
    () => folderId => {
      const folder = project.folders[folderId];
      const newName = window.prompt('Rename folder', folder.name);
      if (newName === null || newName === folder.name) {
        return;
      }

      const existingFolder = Object.values(project.folders).some(
        f => f.name === newName && f.parentId === folder.parentId
      );
      if (existingFolder) {
        alert('Folder already exists');
        return;
      }

      renameFolder(folder.id, newName);
    },
    [renameFolder, project.folders]
  );

  const toggleFileVisibility: FilesComponentProps['toggleFileVisibility'] =
    useMemo(
      () => fileId => {
        const file = project.files[fileId];
        const hide = !file.hidden;
        setFileVisibility(fileId, hide);
      },
      [setFileVisibility, project.files]
    );

  return (
    <PanelContainer
      id="file-browser"
      headerContent={'Files'}
      className={moduleStyles['file-browser']}
      rightHeaderContent={
        <FileBrowserHeaderPopUpButton
          newFolderPrompt={newFolderPrompt}
          newFilePrompt={newFilePrompt}
        />
      }
    >
      <ul>
        <InnerFileBrowser
          parentId={DEFAULT_FOLDER_ID}
          folders={project.folders}
          newFolderPrompt={newFolderPrompt}
          files={project.files}
          newFilePrompt={newFilePrompt}
          moveFilePrompt={moveFilePrompt}
          renameFilePrompt={renameFilePrompt}
          renameFolderPrompt={renameFolderPrompt}
          toggleFileVisibility={toggleFileVisibility}
        />
      </ul>
    </PanelContainer>
  );
});
