import {Typography} from '@mui/material';
import React, {FC} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

type LessonProgressCounts = {
  levelsTotalCount: number;
  levelsCompletedCount: number;
  levelsCorrectCount: number;
};

interface LessonSummaryBoxProps {
  lessonName: string;
  lessonSummary: string;
  progressCounts: LessonProgressCounts;
}

const LessonSummaryBox: FC<LessonSummaryBoxProps> = ({
  lessonName,
  lessonSummary,
  progressCounts,
}) => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      You worked on: {lessonName}
    </Typography>
    <br />
    <SafeMarkdown markdown={lessonSummary} />
    <Typography variant="body1">
      Let's take a look at your work from the lesson...
    </Typography>
    <Typography variant="body2">
      Levels completed: {progressCounts.levelsCompletedCount} /{' '}
      {progressCounts.levelsTotalCount}
      <br />
      Levels correct: {progressCounts.levelsCorrectCount} /{' '}
      {progressCounts.levelsTotalCount}
    </Typography>
    ⚠️ COMING SOON: More screens and real content here!
  </div>
);

export default LessonSummaryBox;
