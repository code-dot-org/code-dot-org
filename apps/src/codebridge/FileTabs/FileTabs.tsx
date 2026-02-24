import {getOpenFiles} from '@codebridge/utils';
import {
  dragAndDropKeyboardCodes,
  getFileNameById,
  sortableKeyboardCoordinatesWithTab,
} from '@codebridge/utils/dragAndDropUtils';
import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import React, {useMemo, useState} from 'react';

import i18n from '@cdo/apps/codebridge/locale';
import {
  closeFileThunk,
  rearrangeFilesThunk,
  setActiveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import FileTab from './FileTab';
import Sortable from './Sortable';

import moduleStyles from './styles/fileTabs.module.scss';

export const FileTabs = React.memo(() => {
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );
  const files = getOpenFiles(source);
  const dispatch = useAppDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0.01,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinatesWithTab,
      keyboardCodes: dragAndDropKeyboardCodes,
    })
  );
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    setDraggingFileId(null);

    if (active.id !== over!.id) {
      const oldIndex = files.indexOf(files.find(f => f.id === active.id)!);
      const newIndex = files.indexOf(files.find(f => f.id === over!.id)!);

      dispatch(
        rearrangeFilesThunk(
          arrayMove(files, oldIndex, newIndex).map(file => file.id)
        )
      );
    }
  }

  function handleDragCancel() {
    setDraggingFileId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    // Handle drag start only if the file is in the list of open files.
    // This can get called when the close button is clicked, and we want to ignore
    // it in this case.
    if (source.openFiles?.includes(event.active.id as string)) {
      setDraggingFileId(event.active.id as string);
      dispatch(setActiveFileThunk(event.active.id as string));
    }
  }

  function handleTabActivation(event: React.KeyboardEvent, fileId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      // We don't stop event propagation here because we want the close button to work.
      dispatch(setActiveFileThunk(fileId));
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      dispatch(closeFileThunk(fileId));
    }
  }

  const announcements = useMemo(() => {
    const getName = (id: string) => getFileNameById(id, source.files);
    const getPosition = (id: string) => files.findIndex(f => f.id === id) + 1;

    return {
      onDragStart({active}: DragStartEvent) {
        const position = getPosition(active.id as string);
        return `Picked up file ${getName(
          active.id as string
        )}. Item is in position ${position} of ${files.length}`;
      },
      onDragOver({active, over}: DragOverEvent) {
        const fileName = getName(active.id as string);
        return over
          ? `File ${fileName} is over ${getName(
              over.id as string
            )} at position ${getPosition(over.id as string)}`
          : `File ${fileName} is not over a valid position`;
      },
      onDragEnd({active, over}: DragEndEvent) {
        const fileName = getName(active.id as string);
        if (over && active.id !== over.id) {
          const movedFiles = arrayMove(
            files,
            getPosition(active.id as string) - 1,
            getPosition(over.id as string) - 1
          );
          const newPosition = movedFiles.findIndex(f => f.id === active.id) + 1;
          return `File ${fileName} was moved. New position is ${newPosition} of ${files.length}`;
        }
        return `File ${fileName} was dropped at its original position`;
      },
      onDragCancel({active}: DragCancelEvent) {
        return `Dragging was cancelled. ${getName(
          active.id as string
        )} was dropped`;
      },
    };
  }, [files, source.files]);

  return (
    <div className={moduleStyles.fileTabs}>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement, restrictToHorizontalAxis]}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: i18n.dragAndDropInstructionsTabs(),
          },
        }}
      >
        <SortableContext items={files} strategy={horizontalListSortingStrategy}>
          {files.map(f => (
            <Sortable
              id={f.id}
              key={f.id}
              isDragging={f.id === draggingFileId}
              onKeyDown={event => handleTabActivation(event, f.id)}
            >
              <FileTab file={f} />
            </Sortable>
          ))}
          <DragOverlay>
            {draggingFileId ? (
              <FileTab file={files.find(f => f.id === draggingFileId)!} />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  );
});
