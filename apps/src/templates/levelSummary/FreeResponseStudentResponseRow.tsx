import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  StudentAnswer,
  StudentWorkEvaluation,
} from '@cdo/apps/aiEvaluation/evaluationApi';

import styles from './summary.module.scss';

type FreeResponseStudentResponseRowProps = {
  studentResponse: StudentAnswer | null;
  studentWorkEvaluation: StudentWorkEvaluation;
};

const FreeResponseStudentResponseRow: React.FC<
  FreeResponseStudentResponseRowProps
> = ({studentResponse, studentWorkEvaluation}) => {
  // used to create the tag for the response
  const analysisTag = () => {
    if (
      studentWorkEvaluation.aiEvaluation === 'great' ||
      studentWorkEvaluation.aiEvaluation === 'ok'
    ) {
      return (
        <Tags
          tagsList={[
            {
              label: 'Proficient',
              icon: {
                iconName: 'circle-check',
                iconStyle: 'solid',
                title: 'check',
                placement: 'left',
              },
            },
          ]}
          size="m"
          //   className={styles.proficientTag}
        />
      );
    } else if (studentWorkEvaluation.aiEvaluation === 'needs revision') {
      return (
        <Tags
          tagsList={[
            {
              label: 'Needs Revision',
              icon: {
                iconName: 'circle-check',
                iconStyle: 'solid',
                title: 'check',
                placement: 'left',
              },
            },
          ]}
          size="m"
          //   className={styles.proficientTag}
        />
      );
    }
  };

  return (
    <div className={styles.rowContainer}>
      <BodyThreeText className={styles.aiAnalysisNameColumn}>
        <strong>{studentResponse?.studentDisplayName}</strong>
      </BodyThreeText>
      <BodyThreeText className={styles.aiAnalysisResponseColumn}>
        {studentResponse?.studentWork}
      </BodyThreeText>
      <div className={styles.aiAnalysisTagColumn}>{analysisTag()}</div>
      <BodyThreeText
        className={styles.aiAnalysisReasoningColumn}
      >{`${studentWorkEvaluation.aiEvaluation}. ${studentWorkEvaluation.aiReasoning}`}</BodyThreeText>
    </div>
  );
};

export default FreeResponseStudentResponseRow;
