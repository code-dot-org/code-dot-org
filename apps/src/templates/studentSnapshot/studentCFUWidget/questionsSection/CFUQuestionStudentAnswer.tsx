import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponse} from './../types';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CFUQuestionStudentAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
}

const CFUQuestionStudentAnswer: React.FC<CFUQuestionStudentAnswerProps> = ({
  level,
  response,
}) => (
  <div className={styles.cfuQuestionStudentAnswer}>
    <div>
      <Typography variant="body3">Question</Typography>
      <Typography variant="body4">{level.question_text}</Typography>
    </div>
    <div>
      <Typography variant="body3">Student Answer</Typography>
      <Typography variant="body4">
        {response?.response
          ? JSON.stringify(response.response.student_result)
          : 'No response submitted'}
      </Typography>
    </div>
  </div>
);

export default CFUQuestionStudentAnswer;
