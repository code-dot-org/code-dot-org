import {useDraggable} from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';

import {DragDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type DragAriaAttributes = {
  'aria-describedby': string | undefined;
  'aria-roledescription': string;
  'aria-pressed': true | undefined;
};

// Threads dnd-kit ARIA attributes down to the label button in ItemRow.
export const DragDescriptionContext = React.createContext<
  DragAriaAttributes | undefined
>(undefined);

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
      {
        value: {
          'aria-describedby': attributes['aria-describedby'],
          'aria-roledescription': attributes['aria-roledescription'],
          'aria-pressed': attributes['aria-pressed'] as true | undefined,
        },
      },
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
