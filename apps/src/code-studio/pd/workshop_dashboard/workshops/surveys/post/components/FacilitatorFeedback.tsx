import {Box, Card, CardContent} from '@mui/material';
import React, {useMemo} from 'react';
import {useParams} from 'react-router-dom';

import noResponsesText from '@cdo/static/pd/no-responses-text.png';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {EmptyState} from '../../components/EmptyState';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {MIN_RESPONSE_COUNT} from '../../constants';
import {getQuestionDescription} from '../../helpers';

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
      {!questions ? (
        <Card className={styles.card}>
          <CardContent className={styles.cardContent}>
            <EmptyState
              title="No survey responses submitted yet."
              description="Results will appear here once participants complete the survey."
              imageProps={{src: noResponsesText}}
              large
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {[likertQuestionRowOne, likertQuestionRowTwo].map(
            (questionRow, i) => (
              <Box key={i} className={styles.cardRow}>
                {questionRow.map(question =>
                  isQuestionType(question, 'likert') ? (
                    <ScoreCard
                      key={question.question_name}
                      title={
                        question.question_short_text ?? question.question_text
                      }
                      description={getQuestionDescription(question)}
                      footer={question.question_sub_text}
                      score={question.results.weighted_score}
                      responseCount={question.results.total_responses}
                      minResponseCount={MIN_RESPONSE_COUNT}
                    />
                  ) : null
                )}
              </Box>
            )
          )}

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
        </>
      )}
    </Box>
  );
};
