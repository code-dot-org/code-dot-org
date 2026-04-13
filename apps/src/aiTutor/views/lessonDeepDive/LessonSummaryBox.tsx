import {Typography} from '@mui/material';
import React, {FC} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {LessonStudentProfile} from '@cdo/apps/aiTutor/lessonStudentProfile';

interface LessonSummaryBoxProps {
  lessonName: string;
  lessonSummary: string;
  studentProfile: LessonStudentProfile | null;
}

const LessonSummaryBox: FC<LessonSummaryBoxProps> = ({
  lessonName,
  lessonSummary,
  studentProfile: _studentProfile,
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
    ⚠️ COMING SOON: More screens and real content here!
  </div>
);

export default LessonSummaryBox;
