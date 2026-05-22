import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CFULevelResponseResponse} from '../../types';

import styles from './studentCFUAnswers.module.scss';

interface CFUFreeResponseAnswerProps {
  response: CFULevelResponseResponse;
  // this is a placeholder prop for future AI insight functionality, update when implemented
  hasAiInsight?: boolean;
  // this is a placeholder prop for future AI insight functionality, update when implemented
  aiInsightText?: string;
}

const CFUFreeResponseAnswer: React.FC<CFUFreeResponseAnswerProps> = ({
  response,
  hasAiInsight = false,
  aiInsightText = 'Some ai evaluation text goes here',
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
    {hasAiInsight && (
      <div className={styles.freeResponseAiInsightContainer}>
        <div className={styles.freeResponseAiInsight}>
          <div className={styles.freeResponseAiInsightLabel}>
            <FontAwesomeV6Icon iconName="sparkles" />
            <Typography variant="label3">AI Insight</Typography>
          </div>
          <Typography variant="body4">{aiInsightText}</Typography>
        </div>
      </div>
    )}
  </div>
);

export default CFUFreeResponseAnswer;
