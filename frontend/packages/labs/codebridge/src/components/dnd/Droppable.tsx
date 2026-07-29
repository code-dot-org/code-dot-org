// Marks a folder (or the root) as a drop target (via @dnd-kit's useDroppable).
// Ported from apps/src/codebridge FileBrowser/Droppable, plus `isOver` → an
// `overClassName` so the folder that WOULD receive the drop highlights. `isOver`
// reflects dnd-kit's resolved `over` (from the file-browser collision detector),
// so for nested folders it is the innermost one, matching where a drop lands.
import {useDroppable} from '@dnd-kit/core';
import classNames from 'classnames';
import {createElement, type ReactNode} from 'react';

import type {DropData} from './types';

interface DroppableProps {
  children: ReactNode;
  data: DropData;
  component?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** Applied while a dragged item is over this target. */
  overClassName?: string;
}

export const Droppable = ({
  children,
  data,
  component = 'div',
  className,
  overClassName,
}: DroppableProps) => {
  const {setNodeRef, isOver} = useDroppable({id: data.id, data});
  return createElement(
    component,
    {
      ref: setNodeRef,
      className: classNames(className, isOver && overClassName),
    },
    children,
  );
};
