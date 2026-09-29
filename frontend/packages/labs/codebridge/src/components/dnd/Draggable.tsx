// Wraps a file-browser row so it can be dragged (via @dnd-kit's useDraggable).
// Ported from apps/src/codebridge FileBrowser/Draggable. The draggable node is
// the row container, not a focusable control, so we thread only the dnd-kit ARIA
// hints onto it (not `role`/`tabIndex`, which would nest an interactive element
// inside the row's button). Pointer drag works off the spread listeners; the
// PointerSensor's activation distance keeps a plain click on the row's button a
// click, not a drag.
import {useDraggable} from '@dnd-kit/core';
import classNames from 'classnames';
import {createElement, type ReactNode} from 'react';

import styles from '../fileBrowser.module.css';

import type {DragData} from './types';

interface DraggableProps {
  children: ReactNode;
  data: DragData;
  component?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

export const Draggable = ({
  children,
  data,
  component = 'div',
  className,
}: DraggableProps) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: `${data.type}-${data.id}-draggable`,
      data,
    });
  const style = transform
    ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`}
    : undefined;

  return createElement(
    component,
    {
      ref: setNodeRef,
      style,
      // `dragging` disables the row's transition (so it tracks the cursor with no
      // trailing lag) and lifts it as a card, matching the legacy.
      className: classNames(
        styles.draggable,
        isDragging && styles.dragging,
        className,
      ),
      'aria-roledescription': attributes['aria-roledescription'],
      'aria-describedby': attributes['aria-describedby'],
      ...listeners,
    },
    children,
  );
};

/**
 * A non-draggable passthrough with the same call signature as {@link Draggable}
 * (extra drag props ignored), so a caller can pick `isReadOnly ? NotDraggable :
 * Draggable` without branching the JSX.
 */
export const NotDraggable = ({
  children,
  component = 'div',
  className,
}: DraggableProps) => createElement(component, {className}, children);
