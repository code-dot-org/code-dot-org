import {useDraggable} from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';

import {DragDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

// Provides the dnd-kit aria-describedby ID down to the label button in ItemRow
// so screen readers announce drag instructions when the button is focused.
export const DragDescriptionContext = React.createContext<string | undefined>(
  undefined
);

type DraggableProps = {
  children: React.ReactNode;
  data: DragDataType;
  Component?: keyof JSX.IntrinsicElements;
  className?: string;
};

export const Draggable: React.FunctionComponent<DraggableProps> = ({
  children,
  data,
  Component = 'div',
  className,
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

  return React.createElement(
    Component,
    {
      ref: setNodeRef,
      style,
      className: classNames(moduleStyles.draggable, className),
      ...listeners,
    },
    React.createElement(
      DragDescriptionContext.Provider,
      {value: attributes['aria-describedby']},
      children
    )
  );
};

type NotDraggableProps = {
  children: React.ReactNode;
};

export const NotDraggable: React.FunctionComponent<NotDraggableProps> = ({
  children,
}: NotDraggableProps) => {
  return React.createElement(
    'div',
    {className: moduleStyles.notDraggable},
    children
  );
};
