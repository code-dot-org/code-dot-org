import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {getOpenFiles} from '@codebridge/utils';
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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import React, {useState} from 'react';

import FileTab from './FileTab';
import Sortable from './Sortable';

import moduleStyles from './styles/fileTabs.module.scss';

export const FileTabs = React.memo(() => {
  const {project, rearrangeFiles} = useCodebridgeContext();

  const files = getOpenFiles(project);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0.01,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    setDraggingFileId(null);

    if (active.id !== over!.id) {
      const oldIndex = files.indexOf(files.find(f => f.id === active.id)!);
      const newIndex = files.indexOf(files.find(f => f.id === over!.id)!);

      rearrangeFiles(arrayMove(files, oldIndex, newIndex).map(file => file.id));
    }
  }
  function handleDragStart(event: DragStartEvent) {
    setDraggingFileId(event.active.id as string);
    // set file to active
  }

  return (
    <div className={moduleStyles.fileTabs}>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement, restrictToHorizontalAxis]}
      >
        <SortableContext items={files} strategy={horizontalListSortingStrategy}>
          {files.map(f => (
            <Sortable id={f.id} key={f.id} isDragging={f.id === draggingFileId}>
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
