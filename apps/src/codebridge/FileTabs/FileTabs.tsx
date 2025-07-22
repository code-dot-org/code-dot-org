import {getOpenFiles} from '@codebridge/utils';
import {
  dragAndDropKeyboardCodes,
  sortableKeyboardCoordinatesWithTab,
} from '@codebridge/utils/dragAndDropUtils';
import {
  DndContext,
  DragEndEvent,
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
import React, {useState} from 'react';

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
