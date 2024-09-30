import {
  useCodebridgeContext,
  getNextFileId,
  getNextFolderId,
  findFiles,
  findSubFolders,
} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {
  ProjectType,
  FolderId,
  ProjectFile,
  ProjectFolder,
} from '@codebridge/types';
import {
  findFolder,
  getErrorMessage,
  getFileIconNameAndStyle,
  shouldShowFile,
} from '@codebridge/utils';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import classNames from 'classnames';
import fileDownload from 'js-file-download';
import React, {useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
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
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import {
  DndDataContextProvider,
  useDndDataContext,
} from './DnDDataContextProvider';
import {Draggable} from './Draggable';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {
  DragType,
  DragDataType,
  DropDataType,
  downloadFileType,
  moveFilePromptType,
  moveFolderPromptType,
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
  moveFolderPrompt: moveFolderPromptType;
  newFilePrompt: newFilePromptType;
  newFolderPrompt: newFolderPromptType;
  renameFilePrompt: renameFilePromptType;
  renameFolderPrompt: renameFolderPromptType;
  setFileType: setFileType;
  appName?: string;
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
    moveFolderPrompt,
    renameFilePrompt,
    renameFolderPrompt,
    setFileType,
    appName,
  }: FilesComponentProps) => {
    const {
      openFile,
      deleteFile,
      toggleOpenFolder,
      deleteFolder,
      config: {editableFileTypes},
    } = useCodebridgeContext();
    const {dragData, dropData} = useDndDataContext();
    const dialogControl = useDialogControl();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    const handleConfirmDeleteFile = (fileId: string) => {
      deleteFile(fileId);
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FILE, appName);
    };

    const handleDeleteFile = (fileId: string) => {
      const filename = files[fileId].name;
      const title = codebridgeI18n.areYouSure();
      const message = codebridgeI18n.deleteFileConfirm({filename});
      dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        handleConfirm: () => handleConfirmDeleteFile(fileId),
        title,
        message,
        confirmText: codebridgeI18n.delete(),
        destructive: true,
      });
    };

    const handleConfirmDeleteFolder = (folderId: string) => {
      deleteFolder(folderId);
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FOLDER, appName);
    };

    const handleDeleteFolder = (folderId: string) => {
      const folderName = folders[folderId].name;
      const projectFolders = Object.values(folders);
      const projectFiles = Object.values(files);
      const folderCount = findSubFolders(folderId, projectFolders).length;
      const fileCount = findFiles(
        folderId,
        projectFiles,
        projectFolders
      ).length;

      const title = codebridgeI18n.areYouSure();
      const confirmation = codebridgeI18n.deleteFolderConfirm({folderName});
      let additionalWarning = '';
      if (fileCount && folderCount) {
        additionalWarning = codebridgeI18n.deleteFolderConfirmBoth({
          fileCount: `${fileCount}`,
          folderCount: `${folderCount}`,
          folderName,
        });
      } else if (fileCount) {
        additionalWarning = codebridgeI18n.deleteFolderConfirmFiles({
          fileCount: `${fileCount}`,
          folderName,
        });
      } else if (folderCount) {
        additionalWarning = codebridgeI18n.deleteFolderConfirmSubfolders({
          folderCount: `${folderCount}`,
          folderName,
        });
      }
      const message = confirmation + ' ' + additionalWarning;
      dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        handleConfirm: () => handleConfirmDeleteFolder(folderId),
        title,
        message,
        confirmText: codebridgeI18n.delete(),
        destructive: true,
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
          .map(f => (
            <Droppable
              data={{id: f.id}}
              key={f.id + f.open}
              Component="li"
              className={classNames(moduleStyles.droppableArea, {
                [moduleStyles.acceptingDrop]:
                  f.id === dropData?.id && dragData?.parentId !== f.id,
              })}
            >
              <Draggable
                data={{id: f.id, type: DragType.FOLDER, parentId: f.parentId}}
              >
                <div className={moduleStyles.row}>
                  <span
                    className={moduleStyles.title}
                    onClick={() => toggleOpenFolder(f.id)}
                  >
                    <FontAwesomeV6Icon
                      iconName={f.open ? 'caret-down' : 'caret-right'}
                      iconStyle={'solid'}
                      className={moduleStyles.rowIcon}
                    />
                    <span
                      className={classNames(moduleStyles.nameContainer, {
                        [moduleStyles.acceptingDrop]:
                          f.id === dropData?.id && dragData?.parentId !== f.id,
                      })}
                    >
                      {f.name}
                    </span>
                  </span>
                  {!isReadOnly && !dragData?.id && (
                    <PopUpButton
                      iconName="ellipsis-v"
                      className={moduleStyles['button-kebab']}
                    >
                      <span className={moduleStyles['button-bar']}>
                        <span onClick={() => moveFolderPrompt(f.id)}>
                          <i className="fa-solid fa-arrow-right" />{' '}
                          {codebridgeI18n.moveFolder()}
                        </span>
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
                </div>
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
                      moveFolderPrompt={moveFolderPrompt}
                      renameFilePrompt={renameFilePrompt}
                      renameFolderPrompt={renameFolderPrompt}
                      setFileType={setFileType}
                      appName={appName}
                    />
                  </ul>
                )}
              </Draggable>
            </Droppable>
          ))}
        {Object.values(files)
          .filter(f => f.folderId === parentId && shouldShowFile(f))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(f);
            const iconClassName = isBrand
              ? classNames('fa-brands', moduleStyles.rowIcon)
              : moduleStyles.rowIcon;
            return (
              <Draggable
                data={{id: f.id, type: DragType.FILE, parentId: f.folderId}}
                key={f.id}
                Component="li"
              >
                <div className={moduleStyles.row}>
                  <div
                    className={moduleStyles.label}
                    onClick={() => openFile(f.id)}
                  >
                    <FontAwesomeV6Icon
                      iconName={iconName}
                      iconStyle={iconStyle}
                      className={iconClassName}
                    />
                    <span className={moduleStyles.nameContainer}>{f.name}</span>
                  </div>
                  {!isReadOnly && !dragData?.id && (
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
                        {editableFileTypes.some(
                          type => type === f.language
                        ) && (
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
                </div>
              </Draggable>
            );
          })}
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
    moveFolder,

    renameFolder,
    newFolder,
    setFileType,
  } = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const dialogControl = useDialogControl();
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const [dragData, setDragData] = useState<DragDataType | undefined>(undefined);
  const [dropData, setDropData] = useState<DropDataType | undefined>(undefined);

  const dndMonitor = useMemo(
    () => ({
      onDragStart: (e: DragStartEvent) =>
        setDragData(e.active.data.current as DragDataType),
      onDragOver: (e: DragOverEvent) =>
        setDropData(e.over?.data.current as DropDataType),
      onDragEnd: (e: DragEndEvent) => {
        setDragData(undefined);
        setDropData(undefined);
      },
    }),
    [setDragData, setDropData]
  );

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

  // Check if the foldername is already in use in the given folder.
  // If it is, alert the user and return true, otherwise return false.
  const checkForDuplicateFoldername = useMemo(
    () =>
      (
        folderName: string,
        folderId: string,
        projectFolders: Record<string, ProjectFolder>
      ) => {
        let message = undefined;
        const existingFolder = Object.values(projectFolders).find(
          f => f.name === folderName && f.parentId === folderId
        );
        if (existingFolder) {
          message = codebridgeI18n.duplicateFolderError({folderName});
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

        const eventName =
          parentId === DEFAULT_FOLDER_ID
            ? EVENTS.CODEBRIDGE_NEW_FOLDER
            : EVENTS.CODEBRIDGE_NEW_SUBFOLDER;
        sendCodebridgeAnalyticsEvent(eventName, appName);
      },
    [appName, dialogControl, newFolder, project.folders]
  );

  const downloadFile: FilesComponentProps['downloadFile'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      fileDownload(file.contents, file.name);
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, appName);
    },
    [appName, project.files]
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

        sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_NEW_FILE, appName);
      },
    [dialogControl, project.files, newFile, appName, checkForDuplicateFilename]
  );

  const moveFilePrompt: FilesComponentProps['moveFilePrompt'] = useMemo(
    () => async fileId => {
      const file = project.files[fileId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.moveFilePrompt(),
        placeholder: codebridgeI18n.rootFolder(),
        requiresPrompt: false,

        validateInput: (destinationFolderName: string) => {
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

      const destinationFolderName = extractInput(results) || '';
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
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FILE, appName);
    },
    [
      project.files,
      project.folders,
      dialogControl,
      appName,
      checkForDuplicateFilename,
      moveFile,
    ]
  );

  const moveFolderPrompt: FilesComponentProps['moveFolderPrompt'] = useMemo(
    () => async folderId => {
      const folder = project.folders[folderId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.moveFolderPrompt(),
        placeholder: codebridgeI18n.rootFolder(),
        requiresPrompt: false,

        validateInput: (destinationFolderName: string) => {
          try {
            const folderId = findFolder(destinationFolderName.split('/'), {
              folders: Object.values(project.folders),
              required: true,
            });
            const duplicate = checkForDuplicateFoldername(
              folder.name,
              folderId,
              project.folders
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

      const destinationFolderName = extractInput(results) || '';
      try {
        const parentId = findFolder(destinationFolderName.split('/'), {
          folders: Object.values(project.folders),
          required: true,
        });
        moveFolder(folderId, parentId);
      } catch (e) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: getErrorMessage(e),
        });
      }
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FOLDER, appName);
    },
    [
      project.folders,
      dialogControl,
      appName,
      checkForDuplicateFoldername,
      moveFolder,
    ]
  );

  const renameFilePrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => async fileId => {
      const file = project.files[fileId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFile(),
        value: file.name,
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
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FILE, appName);
    },
    [
      dialogControl,
      project.files,
      checkForDuplicateFilename,
      renameFile,
      appName,
    ]
  );

  const renameFolderPrompt: FilesComponentProps['renameFolderPrompt'] = useMemo(
    () => async folderId => {
      const folder = project.folders[folderId];
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericPrompt,
        title: codebridgeI18n.renameFolder(),
        value: folder.name,
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
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FOLDER, appName);
    },
    [project.folders, dialogControl, renameFolder, appName]
  );

  const handleDragEnd = useMemo(
    () => (e: DragOverEvent) => {
      if (e?.over) {
        if (e.active.data.current?.type === DragType.FOLDER) {
          moveFolder(e.active.data.current.id as string, e.over.id as string);
        } else if (e.active.data.current?.type === DragType.FILE) {
          moveFile(e.active.data.current.id as string, e.over.id as string);
        }
      }
    },
    [moveFile, moveFolder]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
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
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <DndDataContextProvider
          value={{dragData, dropData}}
          dndMonitor={dndMonitor}
        >
          <Droppable
            data={{id: DEFAULT_FOLDER_ID}}
            className={classNames(
              moduleStyles.droppableArea,
              moduleStyles.expandedDroppableArea,
              {
                [moduleStyles.acceptingDrop]:
                  DEFAULT_FOLDER_ID === dropData?.id,
              }
            )}
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
                moveFolderPrompt={moveFolderPrompt}
                renameFilePrompt={renameFilePrompt}
                renameFolderPrompt={renameFolderPrompt}
                setFileType={setFileType}
                appName={appName}
              />
            </ul>
          </Droppable>
        </DndDataContextProvider>
      </DndContext>
    </PanelContainer>
  );
});
