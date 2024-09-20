import {useDroppable} from '@dnd-kit/core';
import React from 'react';

type DroppableProps = {
  children: React.ReactNode;
  id: string;
  Component?: keyof JSX.IntrinsicElements;
};

export const Droppable = ({
  children,
  id,
  Component = 'div',
}: DroppableProps) => {
  const {setNodeRef} = useDroppable({
    id,
  });

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
    },
    children
  );
};
