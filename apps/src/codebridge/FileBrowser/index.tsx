import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectType, FolderId} from '@codebridge/types';
import {
  getPossibleDestinationFoldersForFolder,
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
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DndDataContextProvider,
  useDndDataContext,
} from './DnDDataContextProvider';
import {Draggable, NotDraggable} from './Draggable';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {FileRow, FileRowProps} from './FileBrowserRow';
import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleDragEnd,
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
      openConfirmDeleteFolder,
      openMoveFolderPrompt,
      openNewFilePrompt,
      openNewFolderPrompt,
      openRenameFolderPrompt,
    } = usePrompts();
    const {
      toggleOpenFolder,
      config: {validMimeTypes},
    } = useCodebridgeContext();
    const {dragData, dropData} = useDndDataContext();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const handleFileUpload = useHandleFileUpload(files);
    const fileUploadErrorCallback = useFileUploadErrorCallback();

    const {startFileUpload, FileUploaderComponent} = useFileUploader({
      callback: handleFileUpload,
      errorCallback: fileUploadErrorCallback,
      validMimeTypes,
    });

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
                          clickHandler={() =>
                            openConfirmDeleteFolder({folder: f})
                          }
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
            const fileRowProps: FileRowProps = {
              item: f,
              hasValidationFile,
              enableMenu: !dragData?.id || isDraggingLocked,
            };
            const MaybeDraggable = isDraggingLocked ? NotDraggable : Draggable;
            return (
              <MaybeDraggable
                data={{id: f.id, type: DragType.FILE, parentId: f.folderId}}
                key={f.id}
                Component="li"
              >
                <FileRow {...fileRowProps} />
              </MaybeDraggable>
            );
          })}
      </>
    );
  }
);

export const FileBrowser = React.memo(() => {
  const {project, setFileType} = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
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

  const handleDragEnd = useHandleDragEnd();

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
