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
