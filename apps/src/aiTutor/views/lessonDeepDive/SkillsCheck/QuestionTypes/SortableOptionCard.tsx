import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Typography} from '@mui/material';
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
    <div
      {...attributes}
      {...listeners}
      className={styles.sectionCardWrapper}
      ref={setNodeRef}
      style={{cursor: isDragging ? 'grabbing' : 'inherit', ...style}}
      aria-labelledby={`section-card-title-${option}`}
    >
      <div
        className={[
          styles.card,
          styles.carddraggable,
          showAnswer
            ? correct
              ? styles.cardcorrect
              : styles.cardincorrect
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Typography variant="body1" className={styles.cardLabel}>
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
    </div>
  );
};
