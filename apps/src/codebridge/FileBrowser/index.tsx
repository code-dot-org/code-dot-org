import {
  useCodebridgeContext,
  getNextFileId,
  getNextFolderId,
} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {ProjectType, FolderId, ProjectFile} from '@codebridge/types';
import {
  findFolder,
  getErrorMessage,
  getFileIcon,
  shouldShowFile,
} from '@codebridge/utils';
import React, {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  moveFilePromptType,
  newFilePromptType,
  newFolderPromptType,
  renameFilePromptType,
  renameFolderPromptType,
  setFileType,
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
  setFileType: setFileType;
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
    setFileType,
  }: FilesComponentProps) => {
    const {openFile, deleteFile, toggleOpenFolder, deleteFolder} =
      useCodebridgeContext();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const hasValidationFile = Object.values(files).find(
      f => f.type === ProjectFileType.VALIDATION
    );
    const isReadOnly = useAppSelector(isReadOnlyWorkspace);

    const startModeFileDropdownOptions = (file: ProjectFile) => {
      // We only support one validation file per project, so if we already have one,
      // do not show the option to mark another file as validation.
      const options = [];
      if (!hasValidationFile) {
        options.push(
          <span
            onClick={() => setFileType(file.id, ProjectFileType.VALIDATION)}
            key={'make-validation'}
          >
            <i className={`fa-solid fa-flask`} /> Make validation file
          </span>
        );
      }
      if (
        file.type === ProjectFileType.VALIDATION ||
        file.type === ProjectFileType.SUPPORT
      ) {
        options.push(
          <span
            onClick={() => setFileType(file.id, ProjectFileType.STARTER)}
            key={'make-starter'}
          >
            <i className={`fa-solid fa-eye`} /> Make starter file
          </span>
        );
      }
      if (
        file.type === ProjectFileType.VALIDATION ||
        file.type === ProjectFileType.STARTER ||
        !file.type // A file wihtout a type is a starter file.
      ) {
        options.push(
          <span
            onClick={() => setFileType(file.id, ProjectFileType.SUPPORT)}
            key={'make-support'}
          >
            <i className={`fa-solid fa-eye-slash`} /> Make support file
          </span>
        );
      }
      return options;
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
                  {!isReadOnly && (
                    <PopUpButton
                      iconName="ellipsis-v"
                      className={moduleStyles['button-kebab']}
                    >
                      <span className={moduleStyles['button-bar']}>
                        <span onClick={() => renameFolderPrompt(f.id)}>
                          <i className="fa-solid fa-pencil" /> Rename folder
                        </span>
                        <span onClick={() => newFolderPrompt(f.id)}>
                          <i className="fa-solid fa-folder-plus" /> Add
                          sub-folder
                        </span>
                        <span onClick={() => newFilePrompt(f.id)}>
                          <i className="fa-solid fa-plus" /> Add file
                        </span>
                        <span onClick={() => deleteFolder(f.id)}>
                          <i className="fa-solid fa-trash" /> Delete folder
                        </span>
                      </span>
                    </PopUpButton>
                  )}
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
                      setFileType={setFileType}
                    />
                  </ul>
                )}
              </li>
            );
          })}
        {Object.values(files)
          .filter(f => f.folderId === parentId && shouldShowFile(f))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => (
            <li key={f.id}>
              <span className={moduleStyles.label}>
                <span onClick={() => openFile(f.id)}>
                  <i className={getFileIcon(f)} />
                  {f.name}
                </span>
                {!isReadOnly && (
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
                      <span onClick={() => deleteFile(f.id)}>
                        <i className="fa-solid fa-trash" /> Delete file
                      </span>
                      {isStartMode && startModeFileDropdownOptions(f)}
                    </span>
                  </PopUpButton>
                )}
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
    setFileType,
  } = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

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

        if (checkForDuplicateFilename(fileName, folderId, project.files)) {
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

        if (checkForDuplicateFilename(file.name, folderId, project.files)) {
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

      if (checkForDuplicateFilename(newName, file.folderId, project.files)) {
        return;
      }

      renameFile(fileId, newName);
    },
    [renameFile, project.files]
  );

  // Check if the filename is already in use in the given folder.
  // If it is, alert the user and return true, otherwise return false.
  const checkForDuplicateFilename = (
    fileName: string,
    folderId: string,
    projectFiles: Record<string, ProjectFile>
  ) => {
    let message = null;
    const existingFile = Object.values(projectFiles).find(
      f => f.name === fileName && f.folderId === folderId
    );
    if (existingFile) {
      message = `Filename ${fileName} is already in use in this folder. Please choose a different name.`;
      if (
        existingFile.type === ProjectFileType.SUPPORT ||
        existingFile.type === ProjectFileType.VALIDATION
      ) {
        message = `Filename ${fileName} is already in use in this folder in the level's support code. Please choose a different name.`;
      }
    }
    if (message) {
      alert(message);
      return true;
    } else {
      return false;
    }
  };

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

  return (
    <PanelContainer
      id="file-browser"
      headerContent={'Files'}
      className={moduleStyles['file-browser']}
      rightHeaderContent={
        !isReadOnly && (
          <FileBrowserHeaderPopUpButton
            newFolderPrompt={newFolderPrompt}
            newFilePrompt={newFilePrompt}
          />
        )
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
          setFileType={setFileType}
        />
      </ul>
    </PanelContainer>
  );
});
