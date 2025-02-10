import {useDroppable} from '@dnd-kit/core';
import React from 'react';

import {DropDataType} from './types';

/*
  This component just adds droppable functionality to folders in the file browser. This wraps the folders in the browser, and allows the user to drag a folder/file
  onto the folder and have it moved into the target drop folder.

  Should be used as a wrapper component around the contents which should be droppable, and can be given an html tag as a string to define the rendered component
  on the page (defaults to 'div')
*/

type DroppableProps = {
  children: React.ReactNode;
  data: DropDataType;
  Component?: keyof JSX.IntrinsicElements;
  className?: string;
};

export const Droppable = ({
  children,
  data,
  Component = 'div',
  className,
}: DroppableProps) => {
  const {setNodeRef} = useDroppable({
    id: data.id,
    data,
  });

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
      className,
    },
    children
  );
};
