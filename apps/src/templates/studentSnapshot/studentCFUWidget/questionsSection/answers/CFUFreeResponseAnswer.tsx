import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CFULevelResponseResponse} from '../../types';

import styles from './studentCFUAnswers.module.scss';

interface CFUFreeResponseAnswerProps {
  response: CFULevelResponseResponse;
}

const CFUFreeResponseAnswer: React.FC<CFUFreeResponseAnswerProps> = ({
  response,
}) => (
  <div className={styles.freeResponseAnswerContainer}>
    <div className={styles.freeResponseAnswer}>
      <Typography variant="body4">
        <SafeMarkdown
          unwrapped
          markdown={
            typeof response?.student_result === 'string'
              ? response.student_result
              : 'No answer provided by student.'
          }
        />
      </Typography>
    </div>
  </div>
);

export default CFUFreeResponseAnswer;
