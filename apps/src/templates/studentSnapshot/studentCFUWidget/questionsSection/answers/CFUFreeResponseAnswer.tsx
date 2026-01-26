import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CFULevel, CFULevelResponse} from '../../types';

import styles from './studentCFUAnswers.module.scss';

interface CFUFreeResponseAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
}

const CFUFreeResponseAnswer: React.FC<CFUFreeResponseAnswerProps> = ({
  level,
  response,
}) => {
  console.log(level, response);
  return (
    <div className={styles.freeResponseAnswerContainer}>
      <div className={styles.freeResponseAnswer}>
        <Typography variant="body4">
          <SafeMarkdown
            unwrapped
            markdown={
              response?.response?.student_result ||
              'No answer provided by student.'
            }
          />
        </Typography>
      </div>
    </div>
  );
};

export default CFUFreeResponseAnswer;
