import {Box} from '@mui/material';
import React, {useMemo} from 'react';
import {useParams} from 'react-router-dom';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {LIKERT_QUESTION_FOOTER, MIN_RESPONSE_COUNT} from '../../constants';
import {getQuestionDescription, prepLikertBreakdown} from '../../helpers';

import styles from '../../../workshop.module.scss';

export const FacilitatorFeedback = () => {
  const {facilitatorId} = useParams();
  const {surveys} = useWorkshopContext();

  const questions: SurveyQuestions | undefined = useMemo(
    () =>
      facilitatorId
        ? surveys?.surveys?.post_workshop?.categories?.facilitators?.[
            facilitatorId
          ]?.questions
        : undefined,
    [facilitatorId, surveys?.surveys?.post_workshop?.categories?.facilitators]
  );

  const likertQuestionRowOne = useMemo(() => {
    if (!questions) return [];
    return [
      questions.demonstrated_knowledge,
      questions.equitable_workshop_environment,
      questions.on_track,
    ];
  }, [questions]);

  const likertQuestionRowTwo = useMemo(() => {
    if (!questions) return [];
    return [
      questions.productive_discussions,
      questions.create_equity_for_students,
      questions.healthy_relationship,
    ];
  }, [questions]);

  const facilitatorDidWell = useMemo(
    () => (questions ? questions.facilitator_did_well_fr : undefined),
    [questions]
  );

  const facilitatorCouldImprove = useMemo(
    () => (questions ? questions.facilitator_could_improve_fr : undefined),
    [questions]
  );

  return (
    <Box className={styles.surveyResultsContainer}>
      {[likertQuestionRowOne, likertQuestionRowTwo].map((questionRow, i) => (
        <Box key={i} className={styles.cardRow}>
          {questionRow.map(question =>
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
                minResponseCount={MIN_RESPONSE_COUNT}
                breakdown={prepLikertBreakdown(question.results.breakdown)}
              />
            ) : null
          )}
        </Box>
      ))}

      <Box className={styles.cardRow}>
        {isQuestionType(facilitatorDidWell, 'text') && (
          <FreeResponseCard
            title={
              facilitatorDidWell.question_short_text ??
              facilitatorDidWell.question_text
            }
            items={facilitatorDidWell.results.responses}
            tagText={`${facilitatorDidWell.results.total_responses} Submitted`}
            statusColor="success"
            size="s"
          />
        )}
        {isQuestionType(facilitatorCouldImprove, 'text') && (
          <FreeResponseCard
            title={
              facilitatorCouldImprove.question_short_text ??
              facilitatorCouldImprove.question_text
            }
            items={facilitatorCouldImprove.results.responses}
            tagText={`${facilitatorCouldImprove.results.total_responses} Submitted`}
            statusColor="warning"
            size="s"
          />
        )}
      </Box>
    </Box>
  );
};
