import {Typography} from '@mui/material';
import React, {FC} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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
      You worked on: {lessonName}
    </Typography>
    The big ideas from this lesson were:
    <SafeMarkdown markdown={lessonSummary} />
    <Typography variant="body1">
      Let's take a look at your work from the lesson...
    </Typography>
    ⚠️ COMING SOON: More screens and real content here!
  </div>
);

export default LessonSummaryBox;
