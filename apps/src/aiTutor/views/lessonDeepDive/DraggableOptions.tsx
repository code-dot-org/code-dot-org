import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './practice-problems.module.scss';

interface DraggableOptionProps {
  id: string;
  option: string;
  correct: boolean;
  showAnswer: boolean;
}

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
export const DraggableOptions: React.FunctionComponent<
  DraggableOptionProps
> = ({id, option, correct, showAnswer}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: id,
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={{cursor: isDragging ? 'grabbing' : 'inherit', ...style}}
      aria-labelledby={`section-card-title-${option}`}
      className={classNames([
        styles.carddraggableOption,
        showAnswer
          ? correct
            ? styles.cardcorrect
            : styles.cardincorrect
          : null,
      ])}
    >
      <Typography variant="body1" className={styles.cardLabel}>
        {option}
      </Typography>
    </div>
  );
};
