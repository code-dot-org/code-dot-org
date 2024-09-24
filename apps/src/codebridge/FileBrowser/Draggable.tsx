import {useDraggable} from '@dnd-kit/core';
import React from 'react';

import {FileId, FolderId} from '../types';

export type DragDataType = {
  id: FileId | FolderId;
  type: 'FILE' | 'FOLDER';
  parentId: FolderId;
};

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
