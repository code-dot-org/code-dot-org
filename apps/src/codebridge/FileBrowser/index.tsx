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
import fileDownload from 'js-file-download';
import React, {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  downloadFileType,
  moveFilePromptType,
  moveFileType,
  newFilePromptType,
  newFileType,
  newFolderPromptType,
  newFolderType,
  renameFilePromptType,
  renameFileType,
  renameFolderPromptType,
  renameFolderType,
  setFileType,
} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type FilesComponentProps = {
  files: ProjectType['files'];
  folders: ProjectType['folders'];
  parentId?: FolderId;

  downloadFile: downloadFileType;
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
    downloadFile,
    newFolderPrompt,
    newFilePrompt,
    moveFilePrompt,
    renameFilePrompt,
    renameFolderPrompt,
    setFileType,
  }: FilesComponentProps) => {
    const {
      openFile,
      deleteFile,
      toggleOpenFolder,
      deleteFolder,
      config: {editableFileTypes},
    } = useCodebridgeContext();
    const dialogControl = useDialogControl();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    const handleDeleteFile = (fileId: string) => {
      const filename = files[fileId].name;
      const title = `Are you sure?`;
      const message = `Are you sure you want to delete the file ${filename}?`;
      dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        handleConfirm: () => deleteFile(fileId),
        title,
        message,
        confirmText: 'Delete',
      });
    };

    const handleDeleteFolder = (folderId: string) => {
      const folderName = folders[folderId].name;
      const title = `Are you sure?`;
      const message = `Are you sure you want to delete the folder ${folderName}? This will delete all files and folders inside ${folderName}.`;
      dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        handleConfirm: () => deleteFolder(folderId),
        title,
        message,
        confirmText: 'Delete',
      });
    };

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
            <i className={`fa-solid fa-flask`} />{' '}
            {codebridgeI18n.makeValidation()}
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
            <i className={`fa-solid fa-eye`} /> {codebridgeI18n.makeStarter()}
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
            <i className={`fa-solid fa-eye-slash`} />{' '}
            {codebridgeI18n.makeSupport()}
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
                          <i className="fa-solid fa-pencil" />{' '}
                          {codebridgeI18n.renameFolder()}
                        </span>
                        <span onClick={() => newFolderPrompt(f.id)}>
                          <i className="fa-solid fa-folder-plus" />{' '}
                          {codebridgeI18n.addSubFolder()}
                        </span>
                        <span onClick={() => newFilePrompt(f.id)}>
                          <i className="fa-solid fa-plus" />{' '}
                          {codebridgeI18n.addFile()}
                        </span>
                        <span onClick={() => handleDeleteFolder(f.id)}>
                          <i className="fa-solid fa-trash" />{' '}
                          {codebridgeI18n.deleteFolder()}
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
                      downloadFile={downloadFile}
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
                        <i className="fa-solid fa-arrow-right" />{' '}
                        {codebridgeI18n.moveFile()}
                      </span>
                      <span onClick={() => renameFilePrompt(f.id)}>
                        <i className="fa-solid fa-pencil" />{' '}
                        {codebridgeI18n.renameFile()}
                      </span>
                      {editableFileTypes.some(type => type === f.language) && (
                        <span onClick={() => downloadFile(f.id)}>
                          <i className="fa-solid fa-download" />{' '}
                          {codebridgeI18n.downloadFile()}
                        </span>
                      )}
                      <span onClick={() => handleDeleteFile(f.id)}>
                        <i className="fa-solid fa-trash" />{' '}
                        {codebridgeI18n.deleteFile()}
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
  const dialogControl = useDialogControl();

  // Check if the filename is already in use in the given folder.
  // If it is, alert the user and return true, otherwise return false.
  const checkForDuplicateFilename = useMemo(
    () =>
      (
        fileName: string,
        folderId: string,
        projectFiles: Record<string, ProjectFile>
      ) => {
        let message = null;
        const existingFile = Object.values(projectFiles).find(
          f => f.name === fileName && f.folderId === folderId
        );
        if (existingFile) {
          message = codebridgeI18n.duplicateFileError({fileName});
          if (
            existingFile.type === ProjectFileType.SUPPORT ||
            existingFile.type === ProjectFileType.VALIDATION
          ) {
            message = codebridgeI18n.duplicateSupportFileError({fileName});
          }
        }
        if (message) {
          dialogControl?.showDialog({
            type: DialogType.GenericAlert,
            title: message,
          });
          return true;
        } else {
          return false;
        }
      },
    [dialogControl]
  );

  const innerNewFolder: newFolderType = useMemo(
    () => (parentId, folderName) => {
      const folderId = getNextFolderId(Object.values(project.folders));

      if (!folderName) {
        return;
      }

      const existingFolder = Object.values(project.folders).some(
        f => f.name === folderName && f.parentId === parentId
      );
      if (existingFolder) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.folderExistsError(),
        });
        return;
      }

      newFolder({parentId, folderName, folderId});
    },
    [newFolder, project.folders, dialogControl]
  );

  const newFolderPrompt: FilesComponentProps['newFolderPrompt'] = useMemo(
    () =>
      (parentId = DEFAULT_FOLDER_ID) => {
        dialogControl?.showDialog({
          type: DialogType.GenericPrompt,
          title: codebridgeI18n.newFolderPrompt(),
          handleConfirm: folderName => {
            innerNewFolder(parentId, folderName);
          },
        });
      },
    [dialogControl, innerNewFolder]
  );

  const downloadFile: FilesComponentProps['downloadFile'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      fileDownload(file.contents, file.name);
    },
    [project.files]
  );

  const innerNewFile: newFileType = useMemo(
    () => (folderId, fileName) => {
      if (!fileName) {
        return;
      }

      if (checkForDuplicateFilename(fileName, folderId, project.files)) {
        return;
      }

      /* eslint-disable-next-line */
      const [_, extension] = fileName.split('.');
      if (!extension) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.noFileExtensionError(),
        });
        return;
      }

      const fileId = getNextFileId(Object.values(project.files));
      newFile({
        fileId,
        fileName,
        folderId,
      });
    },
    [newFile, project.files, checkForDuplicateFilename, dialogControl]
  );

  const newFilePrompt: FilesComponentProps['newFilePrompt'] = useMemo(
    () =>
      (folderId = DEFAULT_FOLDER_ID) => {
        dialogControl?.showDialog({
          type: DialogType.GenericPrompt,
          title: codebridgeI18n.newFilePrompt(),
          handleConfirm: fileName => {
            innerNewFile(folderId, fileName?.replace(/[^\w.]+/g, ''));
          },
        });
      },
    [dialogControl, innerNewFile]
  );

  const innerMoveFile: moveFileType = useMemo(
    () => (fileId, destinationFolderName) => {
      const file = project.files[fileId];

      try {
        const folderId = findFolder(destinationFolderName.split('/'), {
          folders: Object.values(project.folders),
          required: true,
        });

        if (checkForDuplicateFilename(file.name, folderId, project.files)) {
          return;
        }

        moveFile(fileId, folderId);
      } catch (e) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: getErrorMessage(e),
        });
      }
    },
    [
      moveFile,
      project.files,
      project.folders,
      checkForDuplicateFilename,
      dialogControl,
    ]
  );

  const moveFilePrompt: FilesComponentProps['moveFilePrompt'] = useMemo(
    () => fileId => {
      dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.moveFilePrompt(),
        handleConfirm: destinationFolderName => {
          innerMoveFile(fileId, destinationFolderName);
        },
      });
    },
    [dialogControl, innerMoveFile]
  );

  const innerRenameFile: renameFileType = useMemo(
    () => (fileId, newName) => {
      const file = project.files[fileId];

      if (newName === null || newName === file.name) {
        return;
      }

      if (checkForDuplicateFilename(newName, file.folderId, project.files)) {
        return;
      }

      renameFile(fileId, newName);
    },
    [renameFile, checkForDuplicateFilename, project.files]
  );

  const renameFilePrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFile(),
        placeholder: file.name,
        handleConfirm: newName => {
          innerRenameFile(fileId, newName);
        },
      });
    },
    [dialogControl, innerRenameFile, project.files]
  );

  const innerRenameFolder: renameFolderType = useMemo(
    () => (folderId, newName) => {
      const folder = project.folders[folderId];

      if (newName === null || newName === folder.name) {
        return;
      }

      const existingFolder = Object.values(project.folders).some(
        f => f.name === newName && f.parentId === folder.parentId
      );
      if (existingFolder) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.folderExistsError(),
        });

        return;
      }

      renameFolder(folder.id, newName);
    },
    [renameFolder, project.folders, dialogControl]
  );

  const renameFolderPrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => folderId => {
      const folder = project.folders[folderId];
      dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFolder(),
        placeholder: folder.name,
        handleConfirm: newName => {
          innerRenameFolder(folderId, newName);
        },
      });
    },
    [dialogControl, innerRenameFolder, project.folders]
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
          downloadFile={downloadFile}
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
