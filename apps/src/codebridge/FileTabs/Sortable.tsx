import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

interface SortableProps {
  id: string;
  isDragging: boolean;
  children: React.ReactNode;
}

const Sortable: React.FunctionComponent<SortableProps> = ({
  id,
  isDragging,
  children,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition} =
    useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1.0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};
export default Sortable;
