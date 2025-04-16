import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  KeyboardCoordinateGetter,
  KeyboardCode,
} from '@dnd-kit/core';
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DndDataContextProvider} from './DnDDataContextProvider';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {useHandleDragEnd} from './hooks';
import InnerFileBrowser from './InnerFileBrowser';
import {DragDataType, DropDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

export const FileBrowser = React.memo(() => {
  const {source, setFileType, levelProperties} = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const appName = levelProperties.appName;

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

  const keyboardCoordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    const {context} = args;
    const {droppableRects, over} = context;
    if (event.code !== KeyboardCode.Up && event.code !== KeyboardCode.Down) {
      return;
    }
    event.preventDefault();
    // need to find closest droppable container in the direction of the key press
    // and return the coordinates of that container
    const orderedRects = Array.from(droppableRects.keys());
    orderedRects.sort((a, b) => {
      // DEFAULT_FOLDER_ID should always be last in the list, because it is the root folder
      // and contains all other folders.
      if (a === DEFAULT_FOLDER_ID) {
        return 1;
      } else if (b === DEFAULT_FOLDER_ID) {
        return -1;
      }
      return (
        (droppableRects.get(a)?.top || 0) - (droppableRects.get(b)?.top || 0)
      );
    });
    const currentIndex = orderedRects.indexOf(over?.id as string);
    let nextIndex = currentIndex;
    if (event.code === KeyboardCode.Down) {
      nextIndex = Math.min(currentIndex + 1, orderedRects.length - 1);
    } else if (event.code === KeyboardCode.Up) {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    const newRectId = orderedRects[nextIndex];
    if (newRectId === over?.id) {
      return;
    }
    const newRect = droppableRects.get(orderedRects[nextIndex]);
    if (newRect) {
      const x = newRect.left;
      let y = newRect.top + 8;
      if (newRectId === DEFAULT_FOLDER_ID) {
        y = newRect.bottom;
      }
      const newCoordinates = {
        x,
        y,
      };

      return newCoordinates;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(KeyboardSensor, {coordinateGetter: keyboardCoordinateGetter})
  );

  return (
    <PanelContainer
      id="file-browser"
      headerContent={codebridgeI18n.filesHeader()}
      headerClassName={moduleStyles.fileBrowserHeader}
      className={moduleStyles['file-browser']}
      rightHeaderContent={!isReadOnly && <FileBrowserHeaderPopUpButton />}
    >
      <div className={moduleStyles.fileBrowserContents}>
        <DndContext
          onDragEnd={handleDragEnd}
          sensors={sensors}
          modifiers={[
            restrictToVerticalAxis,
            restrictToFirstScrollableAncestor,
          ]}
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
                  setFileType={setFileType}
                  appName={appName}
                />
              </div>
            </Droppable>
          </DndDataContextProvider>
        </DndContext>
      </div>
    </PanelContainer>
  );
});
