import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/aiEvaluationApi';

import {FEEDBACK_TYPE} from './AiFeedbackType';

import styles from './summary.module.scss';

type FreeResponseStudentResponseRowProps = {
  studentWorkEvaluation: StudentWorkEvaluation | null;
};

const FreeResponseStudentResponseRow: React.FC<
  FreeResponseStudentResponseRowProps
> = ({studentWorkEvaluation}) => {
  // used to create the tag for the response
  const analysisTag = () => {
    if (
      studentWorkEvaluation?.aiEvaluation === 'great' ||
      studentWorkEvaluation?.aiEvaluation === 'ok'
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
          className={styles.proficientTag}
        />
      );
    } else if (studentWorkEvaluation?.aiEvaluation === 'needs revision') {
      return (
        <Tags
          tagsList={[
            {
              label: FEEDBACK_TYPE.NEEDS_REVIEW.label,
              icon: {
                iconName: FEEDBACK_TYPE.NEEDS_REVIEW.icon,
                iconStyle: 'solid',
                title: 'check',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.needsReviewTag}
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
                title: 'check',
                placement: 'left',
              },
            },
          ]}
          size="m"
          className={styles.noAttemptTag}
        />
      );
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
    </div>
  );
};

export default FreeResponseStudentResponseRow;
