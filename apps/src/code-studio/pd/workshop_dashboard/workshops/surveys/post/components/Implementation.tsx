import {Box} from '@mui/material';
import React from 'react';

import {
  isQuestionType,
  SurveyQuestion,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {MultiSelectCard} from '../../components/MultiSelectCard';
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

  const barriersToImplementation = questions.barriers_implementation_curriculum;

  const getDescription = (question: SurveyQuestion) => {
    if (isQuestionType(question, 'likert')) {
      return `${question.results.agreement_count} of ${question.results.total_responses} respondents`;
    }
    if (
      isQuestionType(question, 'multiSelect') &&
      question.question_name === 'barriers_implementation_curriculum'
    ) {
      const numWithBarriers =
        (question.results.total_respondents ?? 0) -
        (question.results.breakdown?.none?.count ?? 0);
      return `${numWithBarriers} teachers reported at least 1 or more barriers to implementation`;
    }
    return '';
  };

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.cardRow}>
        {likertQuestionRow.map(question =>
          isQuestionType(question, 'likert') ? (
            <ScoreCard
              key={question.question_name}
              title={question.question_short_text ?? question.question_text}
              description={getDescription(question)}
              footer={question.question_sub_text}
              score={question.results.weighted_score}
              responseCount={question.results.total_responses}
              minResponseCount={MIN_RESPONSE_COUNT}
            />
          ) : null
        )}
      </Box>

      <Box className={styles.cardRow}>
        {isQuestionType(barriersToImplementation, 'multiSelect') && (
          <MultiSelectCard
            key={barriersToImplementation.question_name}
            title={
              barriersToImplementation.question_short_text ??
              barriersToImplementation.question_text
            }
            description={getDescription(barriersToImplementation)}
            items={Object.values(barriersToImplementation.results.breakdown)}
            barLabel="Teachers"
          />
        )}
      </Box>
    </Box>
  );
};
