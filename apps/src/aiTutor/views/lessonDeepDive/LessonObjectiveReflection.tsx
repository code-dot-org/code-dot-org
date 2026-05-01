import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import {LessonDeepDiveData, ReflectionValue} from './types';

import styles from './reflection.module.scss';

export type {ReflectionValue};

interface LessonObjectiveReflectionProps {
  objective: LessonDeepDiveData['objectives'][number];
  selected: ReflectionValue | null;
  onSelectionChange: (objectiveId: string, value: ReflectionValue) => void;
}

const BUTTONS: {value: ReflectionValue; icon: string; label: string}[] = [
  {
    value: LessonObjectiveReflectionValues.LOST,
    icon: 'face-anxious-sweat',
    label: 'Struggling',
  },
  {
    value: LessonObjectiveReflectionValues.UNSURE,
    icon: 'face-thinking',
    label: 'Getting there',
  },
  {
    value: LessonObjectiveReflectionValues.CONFIDENT,
    icon: 'face-grin-stars',
    label: 'Got it',
  },
];

const LessonObjectiveReflection: FC<LessonObjectiveReflectionProps> = ({
  objective,
  selected,
  onSelectionChange,
}) => (
  <div className={styles.objectiveCard}>
    <p className={styles.objectiveDescription}>{objective.description}</p>
    <div className={styles.ratingButtons}>
      {BUTTONS.map(({value, icon, label}) => {
        const isActive = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelectionChange(objective.id, value)}
            aria-label={label}
            aria-pressed={isActive}
            className={`${styles.ratingButton} ${
              isActive ? styles.ratingButtonActive : ''
            }`}
          >
            <FontAwesomeV6Icon iconName={icon} />
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

export default LessonObjectiveReflection;
