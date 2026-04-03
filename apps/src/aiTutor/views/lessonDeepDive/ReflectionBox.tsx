import {Button, Typography} from '@mui/material';
import React, {FC} from 'react';

import LessonObjectiveReflection from './LessonObjectiveReflection';
import LessonReflection from './LessonReflection';
import {LessonDeepDiveData} from './types';

interface ReflectionBoxProps {
  objectives: LessonDeepDiveData['objectives'];
}

const ReflectionBox: FC<ReflectionBoxProps> = ({objectives}) => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      Reflection
    </Typography>
    <Typography variant="body1">
      How do you feel about each of the learning objectives for this lesson?
    </Typography>
    {objectives.map(objective => (
      <LessonObjectiveReflection key={objective.id} objective={objective} />
    ))}
    <LessonReflection />
    <Button
      variant="contained"
      type="button"
      fullWidth
      sx={{marginTop: '5px', textTransform: 'none'}}
    >
      Submit Reflection
    </Button>
  </div>
);

export default ReflectionBox;
