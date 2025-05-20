import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {
  FeedbackData,
  logUserFeedbackOnStudentEvaluation,
} from '@cdo/apps/aiEvaluation/aiInteractionFeedbackApi';

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
      studentWorkEvaluation?.aiEvaluation === 'Great' ||
      studentWorkEvaluation?.aiEvaluation === 'Ok'
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
    } else if (studentWorkEvaluation?.aiEvaluation === 'Needs revision') {
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
    } else if (studentWorkEvaluation?.aiEvaluation === 'No attempt') {
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
    } else if (studentWorkEvaluation?.aiEvaluation === 'Profanity detected') {
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

  return (
    <div className={styles.rowContainer}>
      <BodyThreeText className={styles.aiAnalysisNameColumn}>
        <strong>{studentWorkEvaluation?.studentDisplayName}</strong>
      </BodyThreeText>
      <BodyThreeText className={styles.aiAnalysisResponseColumn}>
        {studentWorkEvaluation?.studentWork}
      </BodyThreeText>
      <div className={styles.aiAnalysisTagColumn}>{analysisTag()}</div>
      <BodyThreeText
        className={styles.aiAnalysisReasoningColumn}
      >{`${studentWorkEvaluation?.aiEvaluation}. ${studentWorkEvaluation?.aiReasoning}`}</BodyThreeText>
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
