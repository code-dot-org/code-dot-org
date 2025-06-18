import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

interface SortableProps {
  id: string;
  isDragging: boolean;
  children: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

const Sortable: React.FunctionComponent<SortableProps> = ({
  id,
  isDragging,
  children,
  onKeyDown,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition} =
    useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1.0,
  };

  // Call the provided onKeyDown function if it exists,
  // then call the listeners.onKeyDown function if it exists.
  // This allows for custom keyboard handling while still
  // allowing the default keyboard handling provided by dnd-kit.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (listeners?.onKeyDown) {
      listeners?.onKeyDown(event);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};
export default Sortable;
