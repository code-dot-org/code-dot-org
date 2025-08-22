import {Box} from '@mui/material';
import React, {useMemo} from 'react';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {MIN_RESPONSE_COUNT} from '../../constants';
import {getQuestionDescription} from '../../helpers';

import styles from '../../../workshop.module.scss';

export const Engagement = () => {
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined =
    surveys?.surveys?.post_workshop?.categories?.engagement?.questions;

  const likelyToRecommend = questions?.nps_self_paced_pd_byow;

  const otherQuestionsEngagement = questions?.other_feedback_FR;

  const likertQuestionRow = useMemo(() => {
    if (!questions) return [];
    return [questions.likelihood_other_pd, questions.rp_as_resource];
  }, [questions]);

  if (!questions) return null;

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.cardRow}>
        {isQuestionType(likelyToRecommend, 'promoter') && (
          <ScoreCard
            key={likelyToRecommend.question_name}
            title={
              likelyToRecommend.question_short_text ??
              likelyToRecommend.question_text
            }
            description={getQuestionDescription(likelyToRecommend)}
            footer={likelyToRecommend.question_sub_text}
            score={likelyToRecommend.results.promoter_percentage}
            responseCount={likelyToRecommend.results.total_responses}
            minResponseCount={MIN_RESPONSE_COUNT}
          />
        )}
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

      <Box className={styles.cardRow}>
        {isQuestionType(otherQuestionsEngagement, 'text') && (
          <FreeResponseCard
            title={
              otherQuestionsEngagement.question_short_text ??
              otherQuestionsEngagement.question_text
            }
            items={otherQuestionsEngagement.results.responses}
            tagText={`${otherQuestionsEngagement.results.total_responses} Submitted`}
          />
        )}
      </Box>
    </Box>
  );
};
