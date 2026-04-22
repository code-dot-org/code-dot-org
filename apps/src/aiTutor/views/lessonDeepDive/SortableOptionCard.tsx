import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './practice-problems.module.scss';

interface SortableOptionProps {
  option: string;
  id: string;
  correct: boolean;
  showAnswer: boolean;
}

export const SortableOptionCard: React.FC<SortableOptionProps> = ({
  option,
  id,
  correct,
  showAnswer,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <li
      {...attributes}
      {...listeners}
      className={styles.sectionCardWrapper}
      ref={setNodeRef}
      style={{cursor: isDragging ? 'grabbing' : 'inherit', ...style}}
      aria-labelledby={`section-card-title-${option}`}
    >
      <div
        className={classNames([
          styles.card,
          styles.carddraggable,
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
    </li>
  );
};
