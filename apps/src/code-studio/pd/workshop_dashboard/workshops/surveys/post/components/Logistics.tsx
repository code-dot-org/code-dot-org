import {Box} from '@mui/material';
import React, {useMemo} from 'react';

import {MinSurveyResponseCount} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {LIKERT_QUESTION_FOOTER} from '../../constants';
import {getQuestionDescription, prepLikertBreakdown} from '../../helpers';

import styles from '../../../workshop.module.scss';

export const Logistics = () => {
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined =
    surveys?.surveys?.post_workshop?.categories?.logistics?.questions;

  const likertQuestionRow = useMemo(() => {
    if (!questions) return [];
    return [
      questions.clear_communication_when_where,
      questions.modality_met_needs,
    ];
  }, [questions]);

  const otherQuestionsLogistics = useMemo(
    () => (questions ? questions.other_feedback_logistics : undefined),
    [questions]
  );

  if (!questions) return null;

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.cardRow}>
        {likertQuestionRow.map(question =>
          isQuestionType(question, 'likert') ? (
            <ScoreCard
              key={question.question_name}
              title={question.question_short_text ?? question.question_text}
              longTitle={question.question_text}
              description={getQuestionDescription(question)}
              questionType={question.question_type}
              footer={LIKERT_QUESTION_FOOTER}
              score={question.results.weighted_score}
              responseCount={question.results.total_responses}
              minResponseCount={MinSurveyResponseCount}
              breakdown={prepLikertBreakdown(question.results.breakdown)}
            />
          ) : null
        )}
      </Box>

      <Box className={styles.cardRow}>
        {isQuestionType(otherQuestionsLogistics, 'text') && (
          <FreeResponseCard
            title={
              otherQuestionsLogistics.question_short_text ??
              otherQuestionsLogistics.question_text
            }
            items={otherQuestionsLogistics.results.responses}
            tagText={`${
              otherQuestionsLogistics.results.total_responses ?? 0
            } Submitted`}
          />
        )}
      </Box>
    </Box>
  );
};
