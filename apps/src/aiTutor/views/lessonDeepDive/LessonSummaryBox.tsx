import {Typography} from '@mui/material';
import React, {FC} from 'react';

const LessonSummaryBox: FC = () => (
  <div>
    <Typography variant="h2">Lesson Summary</Typography>
    <Typography variant="body1">
      Here&apos;s a summary of what you covered in today&apos;s lesson.
    </Typography>
  </div>
);

export default LessonSummaryBox;
