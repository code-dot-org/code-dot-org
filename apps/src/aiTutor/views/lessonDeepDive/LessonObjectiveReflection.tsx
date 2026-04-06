import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import {LessonDeepDiveData} from './types';

const REFLECTION_VALUES = Object.values(LessonObjectiveReflectionValues);
type ReflectionValue = (typeof REFLECTION_VALUES)[number] | null;

interface LessonObjectiveReflectionProps {
  objective: LessonDeepDiveData['objectives'][number];
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
}) => {
  const [selected, setSelected] = useState<ReflectionValue>(null);

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
      <Typography variant="h6" component="h6" style={{margin: 0, flex: 1}}>
        {objective.description}
      </Typography>
      {BUTTONS.map(({value, emoji, label}) => (
        <button
          key={value}
          type="button"
          onClick={() => setSelected(value)}
          aria-label={label}
          aria-pressed={selected === value}
          style={{
            fontSize: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: selected === null || selected === value ? 1 : 0.4,
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default LessonObjectiveReflection;
