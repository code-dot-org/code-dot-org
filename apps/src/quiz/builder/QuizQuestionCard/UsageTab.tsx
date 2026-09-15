import {Typography} from '@mui/material';
import React from 'react';

import {QuizBuilderQuestion} from '../types';

import styles from '../quiz-question-card.module.scss';

interface UsageTabProps {
  question: QuizBuilderQuestion;
}

// Read-only cross-quiz usage context that QuizQuestionSerialization adds -
// not part of the editable draft.
const UsageTab: React.FunctionComponent<UsageTabProps> = ({question}) => (
  <div className={styles.tabContent}>
    <Typography variant="body3" component="p">
      {question.attachedToOtherQuizzes
        ? 'This question is also used on other quizzes.'
        : 'This question is only used on this quiz.'}
    </Typography>
    <Typography variant="body3" component="p">
      {question.usedInPublishedUnit
        ? 'This question is used in a published unit. Saving changes will fork it, so students in that unit keep seeing the current version.'
        : 'This question is not yet used in a published unit.'}
    </Typography>
    {question.page !== null && (
      <Typography variant="body3" component="p">
        Page {question.page}
      </Typography>
    )}
  </div>
);

export default UsageTab;
