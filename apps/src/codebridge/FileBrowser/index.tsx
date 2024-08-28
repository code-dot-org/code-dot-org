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
import {
  useDialogControl,
  DialogType,
  DialogClosePromiseReturnType,
} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  downloadFileType,
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

  downloadFile: downloadFileType;
  moveFilePrompt: moveFilePromptType;
  newFilePrompt: newFilePromptType;
  newFolderPrompt: newFolderPromptType;
  renameFilePrompt: renameFilePromptType;
  renameFolderPrompt: renameFolderPromptType;
  setFileType: setFileType;
};

// given a promise returned from DialogManager.showDialog({type : DialogType.GenericPrompt}), will return the input
// that was typed in by the user.
// Note that if the user did not press the `confirm` button, then an empty string will be returned instead.
const extractInput = (promiseResults: DialogClosePromiseReturnType): string => {
  const {type, args} = promiseResults;
  if (type === 'confirm') {
    return args as string;
  }

  return '';
};

// restrict typed in input to what we consider to be valid names, which for now are [a-zA-Z0-9_.].
const validateName = (name: string = '') => !Boolean(name.match(/[^\w.]/));

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
        let message = undefined;
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

        return message;
      },
    []
  );

  const newFolderPrompt: FilesComponentProps['newFolderPrompt'] = useMemo(
    () =>
      async (parentId = DEFAULT_FOLDER_ID) => {
        const results = await dialogControl.showDialog({
          type: DialogType.GenericPrompt,
          title: codebridgeI18n.newFolderPrompt(),
          validateInput: (folderName: string) => {
            if (!folderName.length) {
              return;
            }
            if (!validateName(folderName)) {
              return codebridgeI18n.invalidNameError();
            }
            const existingFolder = Object.values(project.folders).some(
              f => f.name === folderName && f.parentId === parentId
            );
            if (existingFolder) {
              return codebridgeI18n.folderExistsError();
            }
          },
        });
        if (results.type !== 'confirm') {
          return;
        }
        const folderName = extractInput(results);

        const folderId = getNextFolderId(Object.values(project.folders));
        newFolder({parentId, folderName, folderId});
      },
    [dialogControl, newFolder, project.folders]
  );

  const downloadFile: FilesComponentProps['downloadFile'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      fileDownload(file.contents, file.name);
    },
    [project.files]
  );

  const newFilePrompt: FilesComponentProps['newFilePrompt'] = useMemo(
    () =>
      async (folderId = DEFAULT_FOLDER_ID) => {
        const results = await dialogControl?.showDialog({
          type: DialogType.GenericPrompt,
          title: codebridgeI18n.newFilePrompt(),
          validateInput: (fileName: string) => {
            if (!fileName.length) {
              return;
            }
            if (!validateName(fileName)) {
              return codebridgeI18n.invalidNameError();
            }
            const duplicate = checkForDuplicateFilename(
              fileName,
              folderId,
              project.files
            );
            if (duplicate) {
              return duplicate;
            }
            const [, extension] = fileName.split('.');
            if (!extension) {
              return codebridgeI18n.noFileExtensionError();
            }
          },
        });
        if (results.type !== 'confirm') {
          return;
        }
        const fileName = extractInput(results);

        const fileId = getNextFileId(Object.values(project.files));

        newFile({
          fileId,
          fileName,
          folderId,
        });
      },
    [dialogControl, checkForDuplicateFilename, newFile, project.files]
  );

  const moveFilePrompt: FilesComponentProps['moveFilePrompt'] = useMemo(
    () => async fileId => {
      const file = project.files[fileId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.moveFilePrompt(),

        validateInput: (destinationFolderName: string) => {
          if (!destinationFolderName.length) {
            return;
          }
          try {
            const folderId = findFolder(destinationFolderName.split('/'), {
              folders: Object.values(project.folders),
              required: true,
            });
            const duplicate = checkForDuplicateFilename(
              file.name,
              folderId,
              project.files
            );
            if (duplicate) {
              return duplicate;
            }
          } catch (e) {
            return getErrorMessage(e);
          }
        },
      });

      if (results.type !== 'confirm') {
        return;
      }

      const destinationFolderName = extractInput(results);
      try {
        const folderId = findFolder(destinationFolderName.split('/'), {
          folders: Object.values(project.folders),
          required: true,
        });
        moveFile(fileId, folderId);
      } catch (e) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: getErrorMessage(e),
        });
      }
    },
    [
      dialogControl,
      moveFile,
      checkForDuplicateFilename,
      project.files,
      project.folders,
    ]
  );

  const renameFilePrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => async fileId => {
      const file = project.files[fileId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFile(),
        placeholder: file.name,
        validateInput: (newName: string) => {
          if (!newName.length) {
            return;
          }
          if (newName === file.name) {
            return;
          }
          if (!validateName(newName)) {
            return codebridgeI18n.invalidNameError();
          }
          const duplicate = checkForDuplicateFilename(
            newName,
            file.folderId,
            project.files
          );
          if (duplicate) {
            return duplicate;
          }
          const [, extension] = newName.split('.');
          if (!extension) {
            return codebridgeI18n.noFileExtensionError();
          }
        },
      });
      if (results.type !== 'confirm') {
        return;
      }
      const newName = extractInput(results);
      renameFile(fileId, newName);
    },
    [dialogControl, project.files, checkForDuplicateFilename, renameFile]
  );

  const renameFolderPrompt: FilesComponentProps['renameFolderPrompt'] = useMemo(
    () => async folderId => {
      const folder = project.folders[folderId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFolder(),
        placeholder: folder.name,
        validateInput: (newName: string) => {
          if (!newName.length) {
            return;
          }
          if (newName === folder.name) {
            return;
          }
          if (!validateName(newName)) {
            return codebridgeI18n.invalidNameError();
          }
          const existingFolder = Object.values(project.folders).some(
            f => f.name === newName && f.parentId === folder.parentId
          );
          if (existingFolder) {
            return codebridgeI18n.folderExistsError();
          }
        },
      });
      if (results.type !== 'confirm') {
        return;
      }
      const newName = extractInput(results);
      renameFolder(folderId, newName);
    },
    [dialogControl, renameFolder, project.folders]
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
