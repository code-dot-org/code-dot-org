import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {
  isQuestionType,
  SurveyQuestions,
} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import {FollowUpRequestedCard} from '../../components/FollowUpRequestedCard';
import {FreeResponseCard} from '../../components/FreeResponseCard';
import {ScoreCard} from '../../components/ScoreCard';
import {SelectCard} from '../../components/SelectCard';
import {LIKERT_QUESTION_FOOTER, MIN_RESPONSE_COUNT} from '../../constants';
import {getQuestionDescription, prepLikertBreakdown} from '../../helpers';

import styles from '../../../workshop.module.scss';

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

  const otherQuestionsImplementation = useMemo(
    () => (questions ? questions.other_questions_implementation : undefined),
    [questions]
  );

  // remove "none" option from barriers items since we only care about barriers, not that there weren't any
  const barriersItems = useMemo(() => {
    if (!isQuestionType(barriersToImplementation, 'multiSelect')) {
      return [];
    }
    return Object.entries(barriersToImplementation.results.breakdown ?? {})
      .filter(([key]) => key !== 'none')
      .map(([_, value]) => value);
  }, [barriersToImplementation]);

  const followUpRequestedItems = surveys?.follow_up_requested ?? [];

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
              minResponseCount={MIN_RESPONSE_COUNT}
              breakdown={prepLikertBreakdown(question.results.breakdown)}
            />
          ) : null
        )}
      </Box>

      <Box className={classNames(styles.cardRow, styles.scrollContainerRow)}>
        {isQuestionType(barriersToImplementation, 'multiSelect') && (
          <SelectCard
            title={
              barriersToImplementation.question_short_text ??
              barriersToImplementation.question_text
            }
            description={getQuestionDescription(barriersToImplementation)}
            totalRespondents={
              barriersToImplementation.results.total_respondents
            }
            items={barriersItems}
            barLabel="Teachers"
          />
        )}
        <FollowUpRequestedCard
          items={followUpRequestedItems}
          title="Follow-up requested"
          description={
            followUpRequestedItems.length
              ? `${followUpRequestedItems.length} teachers requested additional support with implementation.`
              : ''
          }
        />
      </Box>

      <Box className={styles.cardRow}>
        {isQuestionType(otherQuestionsImplementation, 'text') && (
          <FreeResponseCard
            title={
              otherQuestionsImplementation.question_short_text ??
              otherQuestionsImplementation.question_text
            }
            items={otherQuestionsImplementation.results.responses ?? []}
            tagText={`${
              otherQuestionsImplementation.results.total_responses ?? 0
            } Submitted`}
          />
        )}
      </Box>
    </Box>
  );
};
