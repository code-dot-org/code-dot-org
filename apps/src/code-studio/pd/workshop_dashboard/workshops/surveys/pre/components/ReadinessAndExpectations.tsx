import {Box} from '@mui/material';
import React, {useMemo} from 'react';

import {MinSurveyResponseCount} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {SurveyQuestions} from '../../../types';
import {
  getQuestionDescription,
  isQuestionType,
  prepLikertBreakdown,
} from '../../../utils';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {LIKERT_QUESTION_FOOTER} from '../../constants';

import styles from '../../../WorkshopLayout.module.scss';

const ReadinessAndExpectations = () => {
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined =
    surveys?.surveys?.pre_workshop?.categories?.readiness_expectations
      ?.questions;

  const likertQuestions = useMemo(() => {
    if (!questions) return [];

    const keys = [
      'feel_prepared',
      'confindent_use_cdo_resources',
      'understand_cs_concepts',
      'know_where_to_get_help',
      'community_cs_educators',
      'strategies_support_all_learners',
    ] as const;

    return keys
      .map(key => questions[key])
      .filter((q): q is Extract<typeof q, {question_type: 'likert'}> =>
        isQuestionType(q, 'likert')
      );
  }, [questions]);

  const learning_expectations = questions?.learning_expectations;

  if (!questions) return null;

  return (
    <Box className={styles.surveyResultsContainer}>
      {Array.from({length: 2}).map((_, rowIndex) => (
        <Box key={rowIndex} className={styles.cardRow}>
          {likertQuestions
            .slice(rowIndex * 3, rowIndex * 3 + 3)
            .map(question => (
              <ScoreCard
                key={question.question_name}
                title={question.question_short_text ?? question.question_text}
                longTitle={question.question_text}
                questionType={question.question_type}
                description={getQuestionDescription(question)}
                footer={LIKERT_QUESTION_FOOTER}
                score={question.results.weighted_score}
                responseCount={question.results.total_responses}
                minResponseCount={MinSurveyResponseCount}
                breakdown={prepLikertBreakdown(question.results.breakdown)}
              />
            ))}
        </Box>
      ))}

      {isQuestionType(learning_expectations, 'text') && (
        <Box className={styles.cardRow}>
          <FreeResponseCard
            title={
              learning_expectations.question_short_text ??
              learning_expectations.question_text
            }
            items={learning_expectations.results.responses}
            tagText={`${learning_expectations.results.total_responses} Submitted`}
          />
        </Box>
      )}
    </Box>
  );
};

export default ReadinessAndExpectations;
