import {Typography} from '@mui/material';
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

const BUTTONS: {value: ReflectionValue; emoji: string; label: string}[] = [
  {value: LessonObjectiveReflectionValues.LOST, emoji: '😥', label: 'Lost'},
  {value: LessonObjectiveReflectionValues.UNSURE, emoji: '🤔', label: 'Unsure'},
  {
    value: LessonObjectiveReflectionValues.CONFIDENT,
    emoji: '✅',
    label: 'Confident',
  },
];

const LessonObjectiveReflection: FC<LessonObjectiveReflectionProps> = ({
  objective,
  selected,
  onSelectionChange,
}) => (
  <div className={styles.objectiveRow}>
    <Typography
      variant="h6"
      component="h6"
      className={styles.objectiveDescription}
    >
      {objective.description}
    </Typography>
    {BUTTONS.map(({value, emoji, label}) => (
      <button
        key={value}
        type="button"
        onClick={() => onSelectionChange(objective.id, value)}
        aria-label={label}
        aria-pressed={selected === value}
        className={styles.emojiButton}
        style={{opacity: selected === null || selected === value ? 1 : 0.4}}
      >
        {emoji}
      </button>
    ))}
  </div>
);

export default LessonObjectiveReflection;
