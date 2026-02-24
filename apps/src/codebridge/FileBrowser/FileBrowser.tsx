import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import emptyFileManagerPlaceholderImage from '@codebridge/images/empty-file-manager-placeholder.svg';
import {
  dragAndDropKeyboardCodes,
  fileBrowserCollisionDetector,
  fileBrowserKeyboardCoordinateGetter,
  getFileNameById,
} from '@codebridge/utils/dragAndDropUtils';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DndDataContextProvider} from './DnDDataContextProvider';
import {Droppable} from './Droppable';
import {useHandleDragEnd} from './hooks';
import InnerFileBrowser from './InnerFileBrowser';
import {DragDataType, DragType, DropDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

export const FileBrowser = React.memo(() => {
  const {levelProperties} = useCodebridgeContext();
  const appName = levelProperties.appName;
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );

  const [dragData, setDragData] = useState<DragDataType | undefined>(undefined);
  const [dropData, setDropData] = useState<DropDataType | undefined>(undefined);
  const projectFolders = source.folders;

  const hasFiles = Object.keys(source.files).length > 0;
  const hasCustomFolders = Object.values(source.folders).some(
    folder => folder.id !== DEFAULT_FOLDER_ID
  );
  const isEmpty = !hasFiles && !hasCustomFolders;

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
      onDragCancel: () => {
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
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: fileBrowserKeyboardCoordinateGetter(projectFolders),
      keyboardCodes: dragAndDropKeyboardCodes,
    })
  );

  const collisionDetector = useMemo(
    () => fileBrowserCollisionDetector(projectFolders),
    [projectFolders]
  );

  const announcements = useMemo(() => {
    const getItemName = (itemId: string, itemType: DragType) =>
      itemType === DragType.FILE
        ? getFileNameById(itemId, source.files)
        : source.folders[itemId]?.name || itemId;

    const getItemPosition = (itemId: string, parentId: string) => {
      const foldersInParent = Object.values(source.folders)
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
      const filesInParent = Object.values(source.files)
        .filter(f => f.folderId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

      const folderIndex = foldersInParent.findIndex(f => f.id === itemId);
      if (folderIndex !== -1)
        return {
          position: folderIndex + 1,
          total: foldersInParent.length + filesInParent.length,
        };

      const fileIndex = filesInParent.findIndex(f => f.id === itemId);
      if (fileIndex !== -1)
        return {
          position: foldersInParent.length + fileIndex + 1,
          total: foldersInParent.length + filesInParent.length,
        };

      return {position: 0, total: 0};
    };

    const getFolderName = (folderId: string) =>
      folderId === DEFAULT_FOLDER_ID
        ? 'root folder'
        : projectFolders[folderId]?.name || 'folder';

    const getTypeLabel = (type: DragType) =>
      type === DragType.FILE ? 'file' : 'folder';

    return {
      onDragStart({active}: DragStartEvent) {
        const data = active.data.current as DragDataType;
        const {position, total} = getItemPosition(data.id, data.parentId);
        return `Picked up ${getTypeLabel(data.type)} ${getItemName(
          data.id,
          data.type
        )}. Item is in position ${position} of ${total}`;
      },
      onDragOver({active, over}: DragOverEvent) {
        const data = active.data.current as DragDataType;
        const itemName = getItemName(data.id, data.type);
        const typeLabel = getTypeLabel(data.type);
        return over
          ? `${
              typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
            } ${itemName} is over ${getFolderName(
              (over.data.current as DropDataType).id
            )}`
          : `${
              typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
            } ${itemName} is not over a drop zone`;
      },
      onDragEnd({active, over}: DragEndEvent) {
        const data = active.data.current as DragDataType;
        const itemName = getItemName(data.id, data.type);
        const typeLabel = getTypeLabel(data.type);
        if (over) {
          const {position, total} = getItemPosition(
            data.id,
            (over.data.current as DropDataType).id
          );
          return `${
            typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
          } ${itemName} was moved to ${getFolderName(
            (over.data.current as DropDataType).id
          )}. New position is ${position} of ${total}`;
        }
        return `${
          typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
        } ${itemName} was dropped`;
      },
      onDragCancel({active}: DragCancelEvent) {
        const data = active.data.current as DragDataType;
        return `Dragging was cancelled. ${getItemName(
          data.id,
          data.type
        )} was dropped`;
      },
    };
  }, [source.folders, source.files, projectFolders]);

  return (
    <div id="file-browser" className={moduleStyles.fileBrowser}>
      <div className={moduleStyles.fileBrowserContents}>
        {isEmpty ? (
          <CodebridgeEmptyState
            imageProps={{src: emptyFileManagerPlaceholderImage}}
            description={codebridgeI18n.thisProjectIsEmpty()}
          />
        ) : (
          <DndContext
            onDragEnd={handleDragEnd}
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={collisionDetector}
            accessibility={{
              announcements,
              screenReaderInstructions: {
                draggable: codebridgeI18n.dragAndDropInstructionsFolders(),
              },
            }}
          >
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
                <div id="uitest-files-list" className={moduleStyles.folder}>
                  <InnerFileBrowser
                    parentId={DEFAULT_FOLDER_ID}
                    folders={source.folders}
                    files={source.files}
                    appName={appName}
                  />
                </div>
              </Droppable>
            </DndDataContextProvider>
          </DndContext>
        )}
      </div>
    </div>
  );
});
