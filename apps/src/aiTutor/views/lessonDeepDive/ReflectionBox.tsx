import {Typography} from '@mui/material';
import React, {FC} from 'react';

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
    <ul>
      {objectives.map(objective => (
        <li key={objective.id}>{objective.description}</li>
      ))}
    </ul>
  </div>
);

export default ReflectionBox;
