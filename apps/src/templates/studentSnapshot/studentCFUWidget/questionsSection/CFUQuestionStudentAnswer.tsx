import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponse} from './../types';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CFUQuestionStudentAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
  isOpen: boolean;
}

const CFUQuestionStudentAnswer: React.FC<CFUQuestionStudentAnswerProps> = ({
  level,
  response,
  isOpen,
}) => (
  <div className={styles.cfuQuestionStudentAnswer}>
    {isOpen && (
      <>
        <div className={styles.cfuQuestionStudentAnswerQuestion}>
          <Typography variant="body3">
            <strong>Question</strong>
          </Typography>
          <Typography variant="body4">{level.question_text}</Typography>
        </div>
        <div>
          <Typography variant="body3">
            <strong>Student Answer</strong>
          </Typography>
          <Typography variant="body4">
            {response?.response?.student_result
              ? JSON.stringify(response.response.student_result)
              : 'No response submitted'}
          </Typography>
        </div>
      </>
    )}
  </div>
);

export default CFUQuestionStudentAnswer;
