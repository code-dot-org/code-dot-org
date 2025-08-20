import {Box} from '@mui/material';
import React from 'react';

import {
  isQuestionType,
  SurveyQuestion,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {ScoreCard} from '../../components/ScoreCard';

import styles from '../../../workshop.module.scss';

export const MIN_RESPONSE_COUNT = 5;

export const Implementation = () => {
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined =
    surveys?.surveys?.post_workshop?.categories?.implementation?.questions;

  if (!questions) {
    return null;
  }

  const likertQuestionRow = [
    questions.plan_to_teach,
    questions.more_prepared,
    questions.know_where_to_get_help,
    questions.intention_to_apply_in_classroom,
  ];

  const getDescription = (question: SurveyQuestion) => {
    if (isQuestionType(question, 'likert')) {
      return `${question.results.agreement_count} of ${question.results.total_responses} respondents`;
    }
    return '';
  };

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.scoreCardRow}>
        {likertQuestionRow.map(question =>
          isQuestionType(question, 'likert') ? (
            <ScoreCard
              key={question.question_name}
              title={question.question_short_text}
              description={getDescription(question)}
              footer={question.question_sub_text}
              score={question.results.weighted_score}
              responseCount={question.results.total_responses}
              minResponseCount={MIN_RESPONSE_COUNT}
            />
          ) : null
        )}
      </Box>
    </Box>
  );
};
