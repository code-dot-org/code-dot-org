import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

interface SortableProps {
  id: string;
  isDragging: boolean;
  isActive: boolean;
  children: React.ReactNode;
}

const Sortable: React.FunctionComponent<SortableProps> = ({
  id,
  isDragging,
  isActive,
  children,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition} =
    useSortable({id, attributes: {role: 'tab'}});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1.0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-selected={isActive}
      aria-controls="codebridge-editor"
    >
      {children}
    </div>
  );
};
export default Sortable;
