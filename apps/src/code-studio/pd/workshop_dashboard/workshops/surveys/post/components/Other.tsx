import {Box} from '@mui/material';
import React, {useMemo} from 'react';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {ScoreCard} from '../../components/ScoreCard';
import {MIN_RESPONSE_COUNT} from '../../constants';
import {getQuestionDescription} from '../../helpers';

import styles from '../../../workshop.module.scss';

export const Other = () => {
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined =
    surveys?.surveys?.post_workshop?.categories?.other?.questions;

  const likertQuestionRow = useMemo(() => {
    if (!questions) return [];
    return [
      questions.someone_to_turn_to,
      questions.workshop_helped_create_community,
      questions.suitable_for_my_level,
    ];
  }, [questions]);

  if (!questions) return null;

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.cardRow}>
        {likertQuestionRow.map(question =>
          isQuestionType(question, 'likert') ? (
            <ScoreCard
              key={question.question_name}
              title={question.question_short_text ?? question.question_text}
              description={getQuestionDescription(question)}
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
