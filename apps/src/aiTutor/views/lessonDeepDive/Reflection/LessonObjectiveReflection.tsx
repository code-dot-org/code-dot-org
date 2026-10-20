import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import {
  LessonDeepDiveData,
  ReflectionValue,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

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
    icon: 'eyes',
    label: 'New to me',
  },
  {
    value: LessonObjectiveReflectionValues.UNSURE,
    icon: 'battery-half',
    label: 'Getting there',
  },
  {
    value: LessonObjectiveReflectionValues.CONFIDENT,
    icon: 'thumbs-up',
    label: 'Got it',
  },
];

const LessonObjectiveReflection: FC<LessonObjectiveReflectionProps> = ({
  objective,
  selected,
  onSelectionChange,
}) => (
  <>
    <p className={styles.objectiveText}>{objective.description}</p>
    {BUTTONS.map(({value, icon, label}) => {
      const isActive = selected === value;
      return (
        <button
          key={value}
          type="button"
          onClick={() => onSelectionChange(objective.id, value)}
          aria-label={label}
          aria-pressed={isActive}
          className={`${styles.ratingOption} ${
            isActive ? styles.ratingOptionActive : ''
          }`}
        >
          <FontAwesomeV6Icon iconName={icon} />
          {label}
        </button>
      );
    })}
  </>
);

export default LessonObjectiveReflection;
