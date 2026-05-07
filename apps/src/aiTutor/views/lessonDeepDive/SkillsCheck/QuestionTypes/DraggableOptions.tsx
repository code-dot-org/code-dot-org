import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {Typography} from '@mui/material';
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
    useDraggable({id});
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
      className={[
        styles.carddraggableOption,
        showAnswer ? (correct ? styles.cardcorrect : styles.cardincorrect) : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Typography variant="body1" component="span" className={styles.cardLabel}>
        {option}
      </Typography>
      {showAnswer && correct && (
        <span className={styles.correctIcon}>
          <FontAwesomeV6Icon iconName="check" />
        </span>
      )}
      {showAnswer && !correct && (
        <span className={styles.incorrectIcon}>
          <FontAwesomeV6Icon iconName="xmark" />
        </span>
      )}
    </div>
  );
};
