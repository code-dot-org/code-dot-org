import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import React, {FC} from 'react';

import styles from './collaborative-activity.module.scss';

export type CardStatus = 'neutral' | 'correct' | 'incorrect';

interface CollaboratorCardProps {
  id: string;
  text: string;
  // Contributor's initials, shown in a badge bottom-right.
  initials: string;
  status: CardStatus;
  // Disables dragging once the activity has been checked.
  disabled?: boolean;
}

// A draggable scenario card for the collaborative sort. Distinct from the
// SkillsCheck DraggableOptions (pill-shaped, no contributor) so that shared
// component stays untouched.
const CollaboratorCard: FC<CollaboratorCardProps> = ({
  id,
  text,
  initials,
  status,
  disabled,
}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({id, disabled});

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1 : undefined,
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
  };

  const className = [
    styles.card,
    status === 'correct' ? styles.cardCorrect : '',
    status === 'incorrect' ? styles.cardIncorrect : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      <span className={styles.cardText}>{text}</span>
      {status === 'correct' && (
        <span className={styles.statusCorrect}>
          <FontAwesomeV6Icon iconName="check" />
        </span>
      )}
      {status === 'incorrect' && (
        <span className={styles.statusIncorrect}>
          <FontAwesomeV6Icon iconName="xmark" />
        </span>
      )}
      <span className={styles.initialsBadge} title={initials}>
        {initials}
      </span>
    </div>
  );
};

export default CollaboratorCard;
