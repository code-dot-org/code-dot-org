import Button from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';
import {
  BodyTwoText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import aiBot from './AI-Bot-default.png';
import {FEEDBACK_TYPE} from './AiFeedbackType';
import FeedbackToggle from './FeedbackToggle';
import FreeResponseSummaryDataBox from './FreeResponseSummaryDataBox';

import styles from './summary.module.scss';

type FreeResponseAiSummaryBoxProps = {
  aiEvaluationHandler: () => void;
  disabled: boolean;
  isPending: boolean;
  studentWorkEvaluations?: StudentWorkEvaluation[];
  evaluationComplete?: boolean;
  totalNumberOfStudents: number;
  openDetailedAnalysis?: () => void;
};

const FreeResponseAiSummaryBox: React.FC<FreeResponseAiSummaryBoxProps> = ({
  aiEvaluationHandler,
  disabled,
  isPending,
  studentWorkEvaluations,
  evaluationComplete,
  totalNumberOfStudents,
  openDetailedAnalysis,
}) => {
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const proficienceyThreshold = totalNumberOfStudents * 0.8;
  const aiSummaryTag = (proficiencyCount: number) => {
    return (
      <Tags
        tagsList={[
          {
            label:
              proficiencyCount > proficienceyThreshold
                ? FEEDBACK_TYPE.PROFICIENT.label
                : FEEDBACK_TYPE.NEEDS_REVIEW.label,
            icon: {
              iconName:
                proficiencyCount > proficienceyThreshold
                  ? FEEDBACK_TYPE.PROFICIENT.icon
                  : FEEDBACK_TYPE.NEEDS_REVIEW.icon,
              iconStyle: 'solid',
              title: 'check',
              placement: 'left',
            },
          },
        ]}
        size="l"
        className={
          proficiencyCount > proficienceyThreshold
            ? styles.proficientTag
            : styles.needsReviewTag
        }
      />
    );
  };

  const aiSummaryMessage = (proficiencyCount: number) => (
    <>
      <BodyTwoText>
        <strong>{`${i18n.reasoning()}: `}</strong>
        {proficiencyCount > proficienceyThreshold
          ? 'More than 80% of the students demonstrated proficiency in their responses. '
          : 'Less than 80% of the students demonstrated proficiency in their responses. '}
        <Link
          type="primary"
          size="m"
          onClick={openDetailedAnalysis}
          className={styles.viewAnalysisLink}
        >
          {i18n.viewDetailedAnalysis()}
        </Link>
      </BodyTwoText>
    </>
  );

  const countEvaluationsByType = (
    evaluations: StudentWorkEvaluation[],
    types: StudentWorkEvaluation['aiEvaluation'][]
  ): number => {
    return evaluations.filter(evaluation =>
      types.includes(evaluation.aiEvaluation)
    ).length;
  };

  const proficientStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['Great', 'Ok'])
    : 0;

  const needsRevisionStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['Needs revision'])
    : 0;

  const flaggedStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['Profanity detected'])
    : 0;

  // A student can have "no response" if they have not started the level yet OR
  // if they have submitted a response but it is empty.
  const noResponseStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['No attempt']) +
      (totalNumberOfStudents - studentWorkEvaluations.length)
    : 0;

  const handleIconClick = (thumbsUp: boolean) => {
    if (!studentWorkEvaluations) {
      return;
    }
    analyticsReporter.sendEvent(EVENTS.AI_SUMMARY_FRQ_PAGE_USER_FEEDBACK, {
      userId: currentUserId,
      levelId: studentWorkEvaluations[0].levelId,
      scriptId: studentWorkEvaluations[0].unitId,
      aiInteractionType: 'ai_summary',
      thumbsUp: thumbsUp,
    });
  };

  const showEvaluationSummary = studentWorkEvaluations && evaluationComplete;

  const aiSummaryContent = () => {
    return (
      <>
        <div className={styles.summaryBoxHeader}>
          {aiSummaryTag(proficientStudentCount)}
          <div className={styles.feedbackQuestion}>
            <BodyThreeText className={styles.feedbackText}>
              {i18n.aiFeedbackQuestion()}
            </BodyThreeText>
            <FeedbackToggle
              onThumbsUpClick={() => {
                handleIconClick(true);
              }}
              onThumbsDownClick={() => {
                handleIconClick(false);
              }}
              size="xs"
              color="gray"
            />
          </div>
        </div>
        {aiSummaryMessage(proficientStudentCount)}
        <FreeResponseSummaryDataBox
          totalStudentCount={totalNumberOfStudents}
          proficientStudentCount={proficientStudentCount}
          needsRevisionStudentCount={needsRevisionStudentCount}
          flaggedStudentCount={flaggedStudentCount}
          noResponseStudentCount={noResponseStudentCount}
        />
      </>
    );
  };

  return (
    <div className={styles.aiSummaryContainer}>
      <div className={styles.leftSide}>
        <img src={aiBot} alt="Ai Bot" className={styles.botImage} />
        <Button
          text={i18n.evaluateStudentResponses()}
          onClick={aiEvaluationHandler}
          size={'s'}
          color={'gray'}
          disabled={disabled}
          type="secondary"
          isPending={isPending}
          className={styles.evaluateButton}
        />
      </div>
      <div className={styles.rightSide}>
        {showEvaluationSummary && aiSummaryContent()}
      </div>
    </div>
  );
};

export default FreeResponseAiSummaryBox;
