import {
  useCodebridgeContext,
  findFiles,
  findSubFolders,
} from '@codebridge/codebridgeContext';
import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectType, FolderId, ProjectFile, FileId} from '@codebridge/types';
import {
  validateFileName as globalValidateFileName,
  validateFolderName,
  findFolder,
  getErrorMessage,
  getFileIconNameAndStyle,
  sendCodebridgeAnalyticsEvent,
  shouldShowFile,
  isValidFileName,
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
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {
  isReadOnlyWorkspace,
  setOverrideValidations,
} from '@cdo/apps/lab2/lab2Redux';
import {PASSED_ALL_TESTS_VALIDATION} from '@cdo/apps/lab2/progress/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {
  useDialogControl,
  DialogType,
  extractUserInput as extractInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DndDataContextProvider,
  useDndDataContext,
} from './DnDDataContextProvider';
import {Draggable} from './Draggable';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {FileUploader} from './FileUploader';
import {
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';
import {
  DragType,
  DragDataType,
  DropDataType,
  moveFolderPromptType,
  renameFilePromptType,
  renameFolderPromptType,
  setFileType,
} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

const handleFileDownload = (file: ProjectFile, appName: string | undefined) => {
  fileDownload(file.contents, file.name);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, appName);
};

type FilesComponentProps = {
  files: ProjectType['files'];
  folders: ProjectType['folders'];
  parentId?: FolderId;
  moveFolderPrompt: moveFolderPromptType;
  renameFilePrompt: renameFilePromptType;
  renameFolderPrompt: renameFolderPromptType;
  setFileType: setFileType;
  appName?: string;
};

const InnerFileBrowser = React.memo(
  ({
    parentId,
    folders,
    files,
    moveFolderPrompt,
    renameFilePrompt,
    renameFolderPrompt,
    setFileType,
    appName,
  }: FilesComponentProps) => {
    const {openMoveFilePrompt, openNewFilePrompt, openNewFolderPrompt} =
      usePrompts();
    const {
      openFile,
      deleteFile,
      toggleOpenFolder,
      deleteFolder,
      config: {editableFileTypes, validMimeTypes},
    } = useCodebridgeContext();
    const {dragData, dropData} = useDndDataContext();
    const dialogControl = useDialogControl();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const handleFileUpload = useHandleFileUpload(files);
    const fileUploadErrorCallback = useFileUploadErrorCallback();
    const dispatch = useAppDispatch();

    const handleConfirmDeleteFile = (fileId: string) => {
      // If we are deleting a validation file, we are in start mode, and we should
      // ensure that the override validation is set to an empty list.
      if (files[fileId]?.type === ProjectFileType.VALIDATION) {
        dispatch(setOverrideValidations([]));
      }
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

    // setFileType only gets called in start mode. If we are setting a file to
    // validation or changing a validation file to a non-validation file, also
    // set the override validation to a passed all tests condition.
    // This makes it so the progress manager gets updated accordingly and
    // levelbuilders can run the new validation file and see results.
    // All files are set to starter by default, so we will catch all new validation
    // files with this method.
    const handleSetFileType = useMemo(
      () => (fileId: FileId, type: ProjectFileType) => {
        const file = files[fileId];
        if (
          file.type === ProjectFileType.VALIDATION &&
          type !== ProjectFileType.VALIDATION
        ) {
          // If this was a validation file and we are changing it to a non-validation file,
          // remove the override validation.
          dispatch(setOverrideValidations([]));
        } else if (type === ProjectFileType.VALIDATION) {
          // If the new type is validation, use the passed all tests validation condition.
          dispatch(setOverrideValidations([PASSED_ALL_TESTS_VALIDATION]));
        }
        setFileType(fileId, type);
      },
      [dispatch, files, setFileType]
    );

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
            onClick={() =>
              handleSetFileType(file.id, ProjectFileType.VALIDATION)
            }
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
            onClick={() => handleSetFileType(file.id, ProjectFileType.STARTER)}
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
            onClick={() => handleSetFileType(file.id, ProjectFileType.SUPPORT)}
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

                    <OverflowTooltip
                      tooltipProps={{
                        text: f.name,
                        tooltipId: `folder-tooltip-${f.id}`,
                        size: 's',
                        direction: 'onBottom',
                      }}
                      tooltipOverlayClassName={moduleStyles.nameContainer}
                      className={moduleStyles.nameContainer}
                    >
                      <span
                        className={classNames({
                          [moduleStyles.acceptingDrop]:
                            f.id === dropData?.id &&
                            dragData?.parentId !== f.id,
                        })}
                      >
                        {f.name}
                      </span>
                    </OverflowTooltip>
                  </span>
                  {!isReadOnly && !dragData?.id && (
                    <PopUpButton
                      iconName="ellipsis-v"
                      className={moduleStyles['button-kebab']}
                    >
                      <span className={moduleStyles['button-bar']}>
                        <PopUpButtonOption
                          iconName="arrow-right"
                          labelText={codebridgeI18n.moveFolder()}
                          clickHandler={() => moveFolderPrompt(f.id)}
                        />
                        <PopUpButtonOption
                          iconName="pencil"
                          labelText={codebridgeI18n.renameFolder()}
                          clickHandler={() => renameFolderPrompt(f.id)}
                        />
                        <PopUpButtonOption
                          iconName="folder-plus"
                          labelText={codebridgeI18n.addSubFolder()}
                          clickHandler={() =>
                            openNewFolderPrompt({parentId: f.id})
                          }
                        />
                        <PopUpButtonOption
                          iconName="plus"
                          labelText={codebridgeI18n.newFile()}
                          clickHandler={() =>
                            openNewFilePrompt({folderId: f.id})
                          }
                        />

                        <FileUploader
                          validMimeTypes={validMimeTypes}
                          callback={(fileName, contents) =>
                            handleFileUpload({
                              folderId: f.id,
                              fileName,
                              contents,
                            })
                          }
                          errorCallback={fileUploadErrorCallback}
                        >
                          <PopUpButtonOption
                            iconName="upload"
                            labelText={codebridgeI18n.uploadFile()}
                          />
                        </FileUploader>
                        <PopUpButtonOption
                          iconName="trash"
                          labelText={codebridgeI18n.deleteFolder()}
                          clickHandler={() => handleDeleteFolder(f.id)}
                        />
                      </span>
                    </PopUpButton>
                  )}
                </div>
                {f.open && (
                  <ul>
                    <InnerFileBrowser
                      folders={folders}
                      parentId={f.id}
                      files={files}
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

                    <OverflowTooltip
                      tooltipProps={{
                        text: f.name,
                        tooltipId: `file-tooltip-${f.id}`,
                        size: 's',
                        direction: 'onBottom',
                      }}
                      tooltipOverlayClassName={moduleStyles.nameContainer}
                      className={moduleStyles.nameContainer}
                    >
                      <span>{f.name}</span>
                    </OverflowTooltip>
                  </div>
                  {!isReadOnly && !dragData?.id && (
                    <PopUpButton
                      iconName="ellipsis-v"
                      className={moduleStyles['button-kebab']}
                    >
                      <span className={moduleStyles['button-bar']}>
                        <PopUpButtonOption
                          iconName="arrow-right"
                          labelText={codebridgeI18n.moveFile()}
                          clickHandler={() =>
                            openMoveFilePrompt({fileId: f.id})
                          }
                        />
                        <PopUpButtonOption
                          iconName="pencil"
                          labelText={codebridgeI18n.renameFile()}
                          clickHandler={() => renameFilePrompt(f.id)}
                        />
                        {editableFileTypes.some(
                          type => type === f.language
                        ) && (
                          <PopUpButtonOption
                            iconName="download"
                            labelText={codebridgeI18n.downloadFile()}
                            clickHandler={() => handleFileDownload(f, appName)}
                          />
                        )}
                        <PopUpButtonOption
                          iconName="trash"
                          labelText={codebridgeI18n.deleteFile()}
                          clickHandler={() => handleDeleteFile(f.id)}
                        />
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
    renameFile,
    moveFile,
    moveFolder,

    renameFolder,
    setFileType,
  } = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const dialogControl = useDialogControl();
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const validateFileName = usePartialApply(globalValidateFileName, {
    isStartMode,
    validationFile,
    projectFiles: project.files,
  } satisfies PAFunctionArgs<typeof globalValidateFileName>);

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
            const parentId = findFolder(destinationFolderName.split('/'), {
              folders: Object.values(project.folders),
              required: true,
            });
            return validateFolderName({
              folderName: folder.name,
              parentId,
              projectFolders: project.folders,
            });
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
    [project.folders, dialogControl, appName, moveFolder]
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
          if (!isValidFileName(newName)) {
            return codebridgeI18n.invalidNameError();
          }
          return validateFileName({
            fileName: newName,
            folderId: file.folderId,
          });

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
    [project.files, dialogControl, renameFile, appName, validateFileName]
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

          return validateFolderName({
            folderName: newName,
            parentId: folder.parentId,
            projectFolders: project.folders,
          });
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
      if (e?.over && e?.active) {
        // first, if we're dragging something into the folder which currently contains it, just bow out.
        if (e.active.data.current?.parentId === e.over.id) {
          return;
        }
        if (e.active.data.current?.type === DragType.FOLDER) {
          const validationError = validateFolderName({
            folderName: project.folders[e.active.data.current.id].name,
            parentId: e.over.id as string,
            projectFolders: project.folders,
          });
          if (validationError) {
            dialogControl?.showDialog({
              type: DialogType.GenericAlert,
              title: validationError,
            });
          } else {
            moveFolder(e.active.data.current.id as string, e.over.id as string);
          }
        } else if (e.active.data.current?.type === DragType.FILE) {
          const validationError = validateFileName({
            fileName: project.files[e.active.data.current.id].name,
            folderId: e.over.id as string,
          });
          if (validationError) {
            dialogControl?.showDialog({
              type: DialogType.GenericAlert,
              title: validationError,
            });
          } else {
            moveFile(e.active.data.current.id as string, e.over.id as string);
          }
        }
      }
    },
    [
      dialogControl,
      moveFile,
      moveFolder,
      project.files,
      project.folders,
      validateFileName,
    ]
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
      headerClassName={moduleStyles.fileBrowserHeader}
      className={moduleStyles['file-browser']}
      rightHeaderContent={!isReadOnly && <FileBrowserHeaderPopUpButton />}
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
                files={project.files}
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
