import {
  useCodebridgeContext,
  getNextFileId,
  getNextFolderId,
} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {ProjectType, FolderId, ProjectFile} from '@codebridge/types';
import {findFolder, getErrorMessage, shouldShowFile} from '@codebridge/utils';
import React, {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  moveFilePromptType,
  newFilePromptType,
  newFolderPromptType,
  renameFilePromptType,
  renameFolderPromptType,
  setFileIsValidationType,
  setFileVisibilityType,
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
  setFileVisibility: setFileVisibilityType;
  setFileIsValidation: setFileIsValidationType;
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
    setFileVisibility,
    setFileIsValidation,
  }: FilesComponentProps) => {
    const {openFile, deleteFile, toggleOpenFolder, deleteFolder} =
      useCodebridgeContext();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const hasValidationFile = Object.values(files).some(f => f.validation);

    const handleSetFileVisibility = (fileId: string, hidden: boolean) => {
      setFileVisibility(fileId, hidden);
      // When we set the visibility, we also want to set the file as not validation.
      setFileIsValidation(fileId, false);
    };

    const startModeFileDropdownOptions = (file: ProjectFile) => {
      // We only support one validation file per project, so if we already have one,
      // do not show the option to mark another file as validation.
      const options = [];
      if (!file.validation && !hasValidationFile) {
        options.push(
          <span
            onClick={() => setFileIsValidation(file.id, true)}
            key={'make-validation'}
          >
            <i className={`fa-solid fa-flask`} /> Make validation file
          </span>
        );
      }
      // Validation overrides the hidden/visible state, so if a file is validation
      // we show both show and hide options.
      if (file.hidden || file.validation) {
        options.push(
          <span
            onClick={() => handleSetFileVisibility(file.id, false)}
            key={'make-visible'}
          >
            <i className={`fa-solid fa-eye`} /> Make file visible
          </span>
        );
      }
      if (!file.hidden || file.validation) {
        options.push(
          <span
            onClick={() => handleSetFileVisibility(file.id, true)}
            key={'make-hidden'}
          >
            <i className={`fa-solid fa-eye-slash`} /> Hide file
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
                      <span onClick={() => deleteFolder(f.id)}>
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
                      setFileVisibility={setFileVisibility}
                      setFileIsValidation={setFileIsValidation}
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
                  {isStartMode && (
                    <i
                      className={`fa-solid ${
                        f.validation
                          ? 'fa-flask'
                          : f.hidden
                          ? 'fa-eye-slash'
                          : 'fa-eye'
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
                    <span onClick={() => deleteFile(f.id)}>
                      <i className="fa-solid fa-trash" /> Delete file
                    </span>
                    {isStartMode && startModeFileDropdownOptions(f)}
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
    setFileIsValidation,
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

        const duplicateNameError = getDuplicateFilenameError(
          fileName,
          folderId,
          project.files
        );
        if (duplicateNameError) {
          alert(duplicateNameError);
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

        const duplicateNameError = getDuplicateFilenameError(
          file.name,
          folderId,
          project.files
        );
        if (duplicateNameError) {
          alert(duplicateNameError);
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

      const duplicateNameError = getDuplicateFilenameError(
        file.name,
        file.folderId,
        project.files
      );
      if (duplicateNameError) {
        alert(duplicateNameError);
        return;
      }

      renameFile(fileId, newName);
    },
    [renameFile, project.files]
  );

  const getDuplicateFilenameError = (
    fileName: string,
    folderId: string,
    projectFiles: Record<string, ProjectFile>
  ) => {
    let message = null;
    const existingFiles = Object.values(projectFiles).filter(
      f => f.name === fileName && f.folderId === folderId
    );
    if (existingFiles.length > 0) {
      const existingFile = existingFiles[0];
      message = `Filename ${fileName} is already in use in this folder. Please choose a different name.`;
      if (existingFile.hidden || existingFile.validation) {
        message = `Filename ${fileName} is already in use in this folder in the level's support code. Please choose a different name.`;
      }
    }
    return message;
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
          setFileVisibility={setFileVisibility}
          setFileIsValidation={setFileIsValidation}
        />
      </ul>
    </PanelContainer>
  );
});
