import {Typography} from '@mui/material';
import React, {FC} from 'react';

interface LessonSummaryBoxProps {
  lessonName: string;
  lessonSummary: string;
}

const LessonSummaryBox: FC<LessonSummaryBoxProps> = ({
  lessonName,
  lessonSummary,
}) => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      {lessonName}
    </Typography>
    <Typography variant="body1">{lessonSummary}</Typography>
  </div>
);

export default LessonSummaryBox;
