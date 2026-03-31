import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import React from 'react';

import style from './../personalization-information.module.scss';

type PersonalizationProgressBarProps = {
  /** Current question number */
  currentQuestionNumber: number;
  /** Total number of questions */
  totalQuestionsNumber: number;
};

const PersonalizationProgressBar: React.FC<PersonalizationProgressBarProps> = ({
  currentQuestionNumber,
  totalQuestionsNumber,
}) => {
  const progressValue = +(
    (currentQuestionNumber / totalQuestionsNumber) *
    100
  ).toFixed(0);

  return (
    <div className={style.personalizationProgressBarContainer}>
      <div className={style.personalizationProgressBarHeader}>
        <Typography variant="body3">
          Question {currentQuestionNumber} of {totalQuestionsNumber}
        </Typography>
        <Typography variant="body3">{progressValue}% complete</Typography>
      </div>
      <Box style={{width: '100%'}}>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: '0.75rem',
            background: 'var(--background-neutral-quinary, #C6CED6)',
            borderRadius: '6.25rem',
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: '6.25rem',
              backgroundColor: 'var(--background-brand-teal-primary, #00818F)',
            },
          }}
        />
      </Box>
    </div>
  );
};

export default PersonalizationProgressBar;
