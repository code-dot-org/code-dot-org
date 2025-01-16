import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FolderId} from '@codebridge/types';
import {shouldShowFile} from '@codebridge/utils';
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
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DndDataContextProvider,
  useDndDataContext,
} from './DnDDataContextProvider';
import {Draggable, NotDraggable} from './Draggable';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {FileRow, FileRowProps, FolderRow} from './FileBrowserRow';
import {useHandleDragEnd} from './hooks';
import {DragType, DragDataType, DropDataType, setFileType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type FilesComponentProps = {
  files: MultiFileSource['files'];
  folders: MultiFileSource['folders'];
  parentId?: FolderId;
  setFileType: setFileType;
  appName?: string;
};

const InnerFileBrowser = React.memo(
  ({parentId, folders, files, setFileType, appName}: FilesComponentProps) => {
    const {dragData, dropData} = useDndDataContext();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    const hasValidationFile = !!Object.values(files).find(
      f => f.type === ProjectFileType.VALIDATION
    );
    const isReadOnly = useAppSelector(isReadOnlyWorkspace);

    return (
      <>
        {Object.values(folders)
          .filter(f => f.parentId === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const MaybeDraggable = isReadOnly ? NotDraggable : Draggable;
            return (
              <Droppable
                data={{id: f.id}}
                key={f.id + f.open}
                Component="li"
                className={classNames(moduleStyles.droppableArea, {
                  [moduleStyles.acceptingDrop]:
                    f.id === dropData?.id && dragData?.parentId !== f.id,
                })}
              >
                <MaybeDraggable
                  data={{id: f.id, type: DragType.FOLDER, parentId: f.parentId}}
                >
                  <FolderRow
                    item={f}
                    enableMenu={!isReadOnly && !dragData?.id}
                  />
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
                </MaybeDraggable>
              </Droppable>
            );
          })}
        {Object.values(files)
          .filter(f => f.folderId === parentId && shouldShowFile(f))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const isDraggingLocked =
              isReadOnly ||
              (!isStartMode && f.type === ProjectFileType.LOCKED_STARTER);
            const fileRowProps: FileRowProps = {
              item: f,
              hasValidationFile,
              enableMenu: !isReadOnly && (!dragData?.id || isDraggingLocked),
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
  const {source, setFileType} = useCodebridgeContext();
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
      headerContent={codebridgeI18n.filesHeader()}
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
                folders={source.folders}
                files={source.files}
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
