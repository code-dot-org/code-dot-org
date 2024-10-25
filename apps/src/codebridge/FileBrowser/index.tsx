import {
  useCodebridgeContext,
  findFiles,
  findSubFolders,
} from '@codebridge/codebridgeContext';
import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectType, FolderId} from '@codebridge/types';
import {
  getPossibleDestinationFoldersForFolder,
  validateFileName as globalValidateFileName,
  validateFolderName,
  sendCodebridgeAnalyticsEvent,
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
import React, {useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {
  isReadOnlyWorkspace,
  setOverrideValidations,
} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DndDataContextProvider,
  useDndDataContext,
} from './DnDDataContextProvider';
import {Draggable} from './Draggable';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import FileRow from './FileRow';
import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';
import {DragType, DragDataType, DropDataType, setFileType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

type FilesComponentProps = {
  files: ProjectType['files'];
  folders: ProjectType['folders'];
  parentId?: FolderId;
  setFileType: setFileType;
  appName?: string;
};

const InnerFileBrowser = React.memo(
  ({parentId, folders, files, setFileType, appName}: FilesComponentProps) => {
    const {
      openMoveFolderPrompt,
      openNewFilePrompt,
      openNewFolderPrompt,
      openRenameFolderPrompt,
    } = usePrompts();
    const {
      deleteFile,
      toggleOpenFolder,
      deleteFolder,
      config: {validMimeTypes},
    } = useCodebridgeContext();
    const {dragData, dropData} = useDndDataContext();
    const dialogControl = useDialogControl();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const handleFileUpload = useHandleFileUpload(files);
    const fileUploadErrorCallback = useFileUploadErrorCallback();

    const {startFileUpload, FileUploaderComponent} = useFileUploader({
      callback: handleFileUpload,
      errorCallback: fileUploadErrorCallback,
      validMimeTypes,
    });
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

    const hasValidationFile = !!Object.values(files).find(
      f => f.type === ProjectFileType.VALIDATION
    );
    const isReadOnly = useAppSelector(isReadOnlyWorkspace);

    return (
      <>
        <FileUploaderComponent />
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
                        className: darkModeStyles.tooltipBottom,
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
                        {Boolean(
                          getPossibleDestinationFoldersForFolder({
                            folder: f,
                            projectFolders: folders,
                          }).length
                        ) && (
                          <PopUpButtonOption
                            iconName="arrow-right"
                            labelText={codebridgeI18n.moveFolder()}
                            clickHandler={() =>
                              openMoveFolderPrompt({folderId: f.id})
                            }
                          />
                        )}
                        <PopUpButtonOption
                          iconName="pencil"
                          labelText={codebridgeI18n.renameFolder()}
                          clickHandler={() =>
                            openRenameFolderPrompt({folderId: f.id})
                          }
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

                        <PopUpButtonOption
                          iconName="upload"
                          labelText={codebridgeI18n.uploadFile()}
                          clickHandler={() => startFileUpload(f.id)}
                        />

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
            const isDraggingLocked =
              !isStartMode && f.type === ProjectFileType.LOCKED_STARTER;
            const fileRowProps = {
              key: f.id,
              file: f,
              isReadOnly,
              appName,
              hasValidationFile,
              isStartMode,
              setFileType,
              handleDeleteFile,
              enableMenu: !dragData?.id || isDraggingLocked,
            };
            return isDraggingLocked ? (
              <FileRow {...fileRowProps} />
            ) : (
              <Draggable
                data={{id: f.id, type: DragType.FILE, parentId: f.folderId}}
                key={f.id}
                Component="li"
              >
                <FileRow {...fileRowProps} />
              </Draggable>
            );
          })}
      </>
    );
  }
);

export const FileBrowser = React.memo(() => {
  const {project, moveFile, moveFolder, setFileType} = useCodebridgeContext();
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
            <ul id="uitest-files-list">
              <InnerFileBrowser
                parentId={DEFAULT_FOLDER_ID}
                folders={project.folders}
                files={project.files}
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
