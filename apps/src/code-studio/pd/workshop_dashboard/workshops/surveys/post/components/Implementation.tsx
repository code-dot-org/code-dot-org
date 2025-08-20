import {Box} from '@mui/material';
import React, {useMemo} from 'react';

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

  const likertQuestionRow = useMemo(() => {
    if (!questions) return [];
    return [
      questions.plan_to_teach,
      questions.more_prepared,
      questions.know_where_to_get_help,
      questions.intention_to_apply_in_classroom,
    ];
  }, [questions]);

  const barriersToImplementation = useMemo(
    () =>
      questions ? questions.barriers_implementation_curriculum : undefined,
    [questions]
  );

  // remove "none" option from barriers items since we only care about barriers, not that there weren't any
  const barriersItems = useMemo(() => {
    if (!isQuestionType(barriersToImplementation, 'multiSelect')) {
      return [];
    }
    return Object.entries(barriersToImplementation.results.breakdown)
      .filter(([key]) => key !== 'none')
      .map(([_, value]) => value);
  }, [barriersToImplementation]);

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

  if (!questions) return null;

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
            items={barriersItems}
            barLabel="Teachers"
          />
        )}
      </Box>
    </Box>
  );
};
