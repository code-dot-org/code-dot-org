import {useDroppable} from '@dnd-kit/core';
import React from 'react';

export type DropDataType = {id: string};

type DroppableProps = {
  children: React.ReactNode;
  data: DropDataType;
  Component?: keyof JSX.IntrinsicElements;
};

export const Droppable = ({
  children,
  data,
  Component = 'div',
}: DroppableProps) => {
  const {setNodeRef} = useDroppable({
    id: data.id,
    data,
  });

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
    },
    children
  );
};
