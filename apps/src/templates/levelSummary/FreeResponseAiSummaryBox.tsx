import Button from '@code-dot-org/component-library/button';
import Tags from '@code-dot-org/component-library/tags';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {StudentWorkEvaluation} from '@cdo/apps/aiEvaluation/evaluationApi';

import aiBot from './AI-Bot-default.png';
import FreeResponseSummaryDataBox from './FreeResponseSummaryDataBox';

import styles from './summary.module.scss';

type FreeResponseAiSummaryBoxProps = {
  aiEvaluationHandler: () => void;
  disabled: boolean;
  isPending: boolean;
  studentWorkEvaluations?: StudentWorkEvaluation[];
  evaluationComplete?: boolean;
};

const FreeResponseAiSummaryBox: React.FC<FreeResponseAiSummaryBoxProps> = ({
  aiEvaluationHandler,
  disabled,
  isPending,
  studentWorkEvaluations,
  evaluationComplete,
}) => {
  // TO DO: Update logic for the proficiency label.  Should be > 20% of students have a proficient answer
  const aiSummaryTag = (proficiencyCount: number) => (
    <Tags
      tagsList={[
        {
          label: proficiencyCount > 0 ? 'Proficient' : 'Needs Review',
          icon: {
            iconName:
              proficiencyCount > 0 ? 'circle-check' : 'circle-exclamation',
            iconStyle: 'solid',
            title: 'check',
            placement: 'left',
          },
        },
      ]}
      size="l"
      className={
        proficiencyCount > 0 ? styles.proficientTag : styles.needsReviewTag
      }
    />
  );

  const aiSummaryMessage = (proficiencyCount: number) => (
    <BodyTwoText>
      <strong>Reasoning: </strong>
      {proficiencyCount > 0
        ? 'This is proficient because more than 1 student has a proficient answer'
        : 'This is needs review because more than one student needed review'}
    </BodyTwoText>
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

  // TO DO: Update this with perhaps different logic...
  const flaggedStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['Cant Evaluate'])
    : 0;
  const noResponseStudentCount = studentWorkEvaluations
    ? countEvaluationsByType(studentWorkEvaluations, ['No Response'])
    : 0;

  const showEvaluationSummary = studentWorkEvaluations && evaluationComplete;

  const aiSummaryContent = () => {
    return (
      <>
        {aiSummaryTag(proficientStudentCount)}
        {aiSummaryMessage(proficientStudentCount)}
        <FreeResponseSummaryDataBox
          totalStudentCount={10}
          proficientStudentCount={proficientStudentCount}
          needsRevisionStudentCount={needsRevisionStudentCount}
          flaggedStudentCount={flaggedStudentCount}
          noResponseStudentCount={noResponseStudentCount}
        />
      </>
    );
  };

  // TO DO: Get total student count loaded in
  return (
    <div className={styles.aiSummaryContainer}>
      <div className={styles.leftSide}>
        <img src={aiBot} alt="Ai Bot" className={styles.botImage} />
        <Button
          text="Evaluate student responses"
          onClick={aiEvaluationHandler}
          size={'s'}
          color={'gray'}
          disabled={disabled}
          type="secondary"
          isPending={isPending}
        />
      </div>
      <div className={styles.rightSide}>
        {showEvaluationSummary && aiSummaryContent()}
      </div>
    </div>
  );
};

export default FreeResponseAiSummaryBox;
