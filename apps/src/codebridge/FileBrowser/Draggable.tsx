import {useDraggable} from '@dnd-kit/core';
import React from 'react';

import {DragDataType} from './types';

/*
  This component adds draggable functionality to files/folders in the file browser. The intent is that the user can drag a file into a new folder as well
  as drag a folder into a new parent folder.

  Should be used as a wrapper component around the contents which should be draggable, and can be given an html tag as a string to define the rendered component
  on the page (defaults to 'div')
*/

type DraggableProps = {
  children: React.ReactNode;
  data: DragDataType;
  Component?: keyof JSX.IntrinsicElements;
};

export const Draggable = ({
  children,
  data,
  Component = 'div',
}: DraggableProps) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `${data.type}-${data.id}`,
    data,
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
