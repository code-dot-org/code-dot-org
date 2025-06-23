import {useDraggable} from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';

import {DragDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

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
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
};

/**
 * A React component that makes its children draggable using the `useDraggable` hook. Should wrap around a FileBrowserRow.
 * If you -don't- want a row to be draggable, but still want a wrapper, you can wrap it in NotDraggable, below.
 *
 * @param props - The props for the `Draggable` component.
 * @param props.children - The content to be made draggable.
 * @param props.data - An object containing data associated with the draggable element. data must be of type DragDataType.
 * @param props.Component - (Optional) The underlying HTML element to use as the draggable container.
 *                         - Defaults to `'div'`.
 * @returns A React element with the provided children, styled for dragging and handling drag events.
 */
export const Draggable: React.FunctionComponent<DraggableProps> = ({
  children,
  data,
  Component = 'div',
  className,
  onKeyDown,
}: DraggableProps) => {
  const draggableId = `${data.type}-${data.id}-draggable`;
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: draggableId,
    data,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Call the provided onKeyDown function if it exists,
  // then call the listeners.onKeyDown function if it exists.
  // This allows for custom keyboard handling while still
  // allowing the default keyboard handling provided by dnd-kit.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (listeners?.onKeyDown) {
      listeners?.onKeyDown(event);
    }
  };

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
      style: style,
      className: classNames(moduleStyles.draggable, className),
      ...listeners,
      ...attributes,
      onKeyDown: handleKeyDown,
    },
    children
  );
};

type NotDraggableProps = {
  children: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent) => void;
};

export const NotDraggable: React.FunctionComponent<NotDraggableProps> = ({
  children,
  onKeyDown,
}: NotDraggableProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return React.createElement(
    'div',
    {
      onKeyDown: handleKeyDown,
      className: moduleStyles.notDraggable,
      tabIndex: 0,
      role: 'button',
    },
    children
  );
};
