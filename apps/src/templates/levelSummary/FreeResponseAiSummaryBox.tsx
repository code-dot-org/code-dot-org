import Button from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import i18n from '@cdo/locale';

import aiBot from './AI-Bot-default.png';
import {FEEDBACK_TYPE} from './AiFeedbackType';
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
        <strong>{`${i18n.reasoning()}:`}</strong>
        {proficiencyCount > proficienceyThreshold
          ? 'This is proficient because more than 80% of the students demonstrated proficiency in their responses. '
          : 'This is needs review less than 80% of students demonstrated proficiency in their responses. '}
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
    ? countEvaluationsByType(studentWorkEvaluations, ['great', 'ok'])
    : 0;

  const needsRevisionStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['needs revision'])
    : 0;

  // TO DO: Update this with perhaps different logic for "flagged students"
  const flaggedStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['Cant Evaluate'])
    : 0;
  const noResponseStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['No attempt'])
    : 0;

  const showEvaluationSummary = studentWorkEvaluations && evaluationComplete;

  const aiSummaryContent = () => {
    return (
      <>
        {aiSummaryTag(proficientStudentCount)}
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
