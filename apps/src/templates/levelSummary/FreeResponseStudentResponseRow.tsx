import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {
  FeedbackData,
  logAiInteractionFeedback as logUserFeedbackOnStudentEvaluation,
} from '@cdo/apps/aiEvaluation/aiInteractionFeedbackApi';
import {StudentWorkEvaluationStatus} from '@cdo/generated-scripts/sharedConstants';

import AiEvaluationFeedbackModal from './AiEvaluationFeedbackModal';
import {FEEDBACK_TYPE} from './AiFeedbackType';
import FeedbackToggle from './FeedbackToggle';

import styles from './summary.module.scss';

type FreeResponseStudentResponseRowProps = {
  studentWorkEvaluation: StudentWorkEvaluation;
};

const FreeResponseStudentResponseRow: React.FC<
  FreeResponseStudentResponseRowProps
> = ({studentWorkEvaluation}) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  // used to create the tag for the response
  const analysisTag = () => {
    if (
      studentWorkEvaluation?.aiEvaluation ===
        StudentWorkEvaluationStatus.ALL_COMPLETE_CORRECT ||
      studentWorkEvaluation?.aiEvaluation ===
        StudentWorkEvaluationStatus.PARTIAL_COMPLETE_CORRECT
    ) {
      return (
        <Tags
          tagsList={[
            {
              label: FEEDBACK_TYPE.PROFICIENT.label,
              icon: {
                iconName: FEEDBACK_TYPE.PROFICIENT.icon,
                iconStyle: 'solid',
                title: 'check',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.proficientStudentTag}
        />
      );
    } else if (
      studentWorkEvaluation?.aiEvaluation ===
      StudentWorkEvaluationStatus.INCOMPLETE_INCORRECT
    ) {
      return (
        <Tags
          tagsList={[
            {
              label: FEEDBACK_TYPE.NOT_PROFICIENT.label,
              icon: {
                iconName: FEEDBACK_TYPE.NOT_PROFICIENT.icon,
                iconStyle: 'solid',
                title: 'exclamation point',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.needsReviewStudentTag}
        />
      );
    } else if (
      studentWorkEvaluation?.aiReasoning ===
      StudentWorkEvaluationStatus.NO_ATTEMPT
    ) {
      return (
        <Tags
          tagsList={[
            {
              label: FEEDBACK_TYPE.NO_ATTEMPT.label,
              icon: {
                iconName: FEEDBACK_TYPE.NO_ATTEMPT.icon,
                iconStyle: 'solid',
                title: 'dash',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.noAttemptTag}
        />
      );
    } else if (
      studentWorkEvaluation?.aiReasoning ===
        StudentWorkEvaluationStatus.STUDENT_PROFANITY ||
      studentWorkEvaluation?.aiReasoning ===
        StudentWorkEvaluationStatus.STUDENT_PII
    ) {
      return (
        <Tags
          tagsList={[
            {
              label: FEEDBACK_TYPE.FLAGGED.label,
              icon: {
                iconName: FEEDBACK_TYPE.FLAGGED.icon,
                iconStyle: 'solid',
                title: 'flag',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.flaggedTag}
        />
      );
    }
  };

  const handleFeedbackClick = async (thumbsUp: boolean) => {
    const feedbackDataGenerated = {
      aiInteractionType: 'UserLevelEvaluation',
      aiInteractionId: studentWorkEvaluation.id,
      thumbsUp,
      levelId: studentWorkEvaluation.levelId,
      scriptId: studentWorkEvaluation.unitId,
    };
    setFeedbackData(feedbackDataGenerated);

    if (!thumbsUp) {
      setFeedbackModalOpen(true);
    } else {
      logUserFeedbackOnStudentEvaluation(feedbackDataGenerated);
    }
  };

  const getReasoningText = () => {
    if (
      studentWorkEvaluation?.aiReasoning ===
      StudentWorkEvaluationStatus.NO_ATTEMPT
    ) {
      return `The student's response was blank.`;
    } else if (
      studentWorkEvaluation?.aiReasoning ===
      StudentWorkEvaluationStatus.STUDENT_PROFANITY
    ) {
      return 'The response contains profanity and could not be evaluated.';
    } else if (
      studentWorkEvaluation?.aiReasoning ===
      StudentWorkEvaluationStatus.STUDENT_PII
    ) {
      return 'The response could not be evaluated because it contains personal information that is not safe for your student to share.';
    }
    return studentWorkEvaluation?.aiReasoning || '';
  };

  return (
    <div className={styles.rowContainer}>
      <BodyThreeText className={styles.aiAnalysisNameColumn}>
        <strong>{studentWorkEvaluation?.studentDisplayName}</strong>
      </BodyThreeText>
      <BodyThreeText className={styles.aiAnalysisResponseColumn}>
        {studentWorkEvaluation?.studentWork}
      </BodyThreeText>
      <div className={styles.aiAnalysisTagColumn}>{analysisTag()}</div>
      <BodyThreeText className={styles.aiAnalysisReasoningColumn}>
        {getReasoningText()}
      </BodyThreeText>
      <div>
        <FeedbackToggle
          onThumbsUpClick={() => handleFeedbackClick(true)}
          onThumbsDownClick={() => handleFeedbackClick(false)}
          size="xs"
          color="gray"
        />
      </div>
      {feedbackModalOpen && feedbackData && (
        <AiEvaluationFeedbackModal
          feedbackData={feedbackData}
          forStudentAiInteractionFeedback={true}
          closeModalHandler={() => {
            setFeedbackModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default FreeResponseStudentResponseRow;
