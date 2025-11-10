import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import emptyFileManagerPlaceholderImage from '@codebridge/images/empty-file-manager-placeholder.svg';
import {
  dragAndDropKeyboardCodes,
  fileBrowserCollisionDetector,
  fileBrowserKeyboardCoordinateGetter,
} from '@codebridge/utils/dragAndDropUtils';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
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
import {DragDataType, DropDataType} from './types';

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
