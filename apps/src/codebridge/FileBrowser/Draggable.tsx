import {useDraggable} from '@dnd-kit/core';
import React from 'react';

type DraggableProps = {
  children: React.ReactNode;
  id: string;
  Component?: keyof JSX.IntrinsicElements;
};

export const Draggable = ({
  children,
  id,
  Component = 'div',
}: DraggableProps) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
      style: style,
      ...listeners,
      ...attributes,
    },
    children
  );
};
