// Student-facing rubric view inside Lab2 panel

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import ProgressRing from '@cdo/apps/templates/rubrics/ProgressRing';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';
import {commonI18n} from '@cdo/apps/types/locale';
import {EvidenceLevel} from '@cdo/apps/types/rubricTypes';

import {useRubric} from './RubricWrapper';

import styles from './styles.module.scss';

const StudentRubricView: React.FC = () => {
  const {rubricData, teacherEvaluations, isLoading} = useRubric();
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  if (isLoading) {
    return (
      <div className={styles.rubricContainer}>
        <div className={styles.loadingSpinner}>
          <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
        </div>
      </div>
    );
  }

  if (!rubricData?.rubric?.learningGoals) {
    return null;
  }

  const learningGoals = rubricData.rubric.learningGoals;

  const switchGoal = (direction: -1 | 1) => {
    const numGoals = learningGoals.length;
    setCurrentGoalIndex((currentGoalIndex + direction + numGoals) % numGoals);
  };

  const currentLearningGoal = learningGoals[currentGoalIndex];
  const currentEvaluation = teacherEvaluations
    ? teacherEvaluations[currentGoalIndex]
    : undefined;

  if (!currentLearningGoal) {
    return null;
  }

  // Sort from highest to lowest understanding level
  const sortedEvidenceLevels = currentLearningGoal.evidenceLevels?.sort(
    (a, b) => b!.understanding - a!.understanding
  );

  return (
    <div className={styles.rubricContainer}>
      {learningGoals.length > 1 && (
        <div className={styles.goalSwitcher}>
          <button
            className={styles.goalSwitcherButton}
            type="button"
            onClick={() => switchGoal(-1)}
          >
            <FontAwesomeV6Icon iconName="angle-left" />
          </button>
          <ProgressRing
            className={styles.progressRing}
            learningGoals={learningGoals}
            currentLearningGoal={currentGoalIndex}
            understandingLevels={teacherEvaluations?.map(evaluation =>
              evaluation.understanding === null ? -1 : evaluation.understanding
            )}
            radius={30}
            stroke={4}
          />
          <button
            className={styles.goalSwitcherButton}
            type="button"
            onClick={() => switchGoal(1)}
          >
            <FontAwesomeV6Icon iconName="angle-right" />
          </button>
        </div>
      )}
      <BodyTwoText className={styles.learningGoalHeader}>
        {currentLearningGoal.learningGoal}
      </BodyTwoText>
      <div className={styles.scrollContainer}>
        <div className={styles.feedbackContainer}>
          <BodyFourText className={styles.feedbackHeader}>
            <i>
              {!!currentEvaluation?.feedback
                ? commonI18n.studentRubricTeacherFeedback()
                : commonI18n.studentRubricNoFeedback()}
            </i>
          </BodyFourText>
          {currentEvaluation?.feedback && (
            <div className={styles.teacherFeedback}>
              <BodyThreeText>{currentEvaluation?.feedback}</BodyThreeText>
            </div>
          )}
        </div>
        <div className={styles.evidenceLevelsContainer}>
          {sortedEvidenceLevels?.map((evidenceLevel, index) => {
            // InferProps allows evidenceLevel to be null, but if the array is defined
            // we can assume evidenceLevel is not null.
            const el = evidenceLevel as EvidenceLevel;
            const selected =
              currentEvaluation?.understanding === el.understanding;
            return (
              <EvidenceLevelView
                key={index}
                {...el}
                selected={selected}
                // If a teacher evaluation exists, only expand the corresponding evidence level. Otherwise show all by default.
                startExpanded={!currentEvaluation || selected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface EvidenceLevelViewProps extends EvidenceLevel {
  selected: boolean;
  startExpanded: boolean;
}

const EvidenceLevelView: React.FC<EvidenceLevelViewProps> = ({
  understanding,
  teacherDescription,
  selected,
  startExpanded,
}) => {
  const [collapsed, setCollapsed] = useState(!startExpanded);

  useEffect(() => {
    setCollapsed(!startExpanded);
  }, [startExpanded]);

  return (
    <div
      className={classNames(
        styles.evidenceLevelContainer,
        selected && styles.evidenceLevelContainerSelected
      )}
    >
      <div className={styles.header} onClick={() => setCollapsed(!collapsed)}>
        <div
          className={classNames(
            styles.bubble,
            selected && styles.bubbleSelected
          )}
        />
        <BodyTwoText>
          {
            (UNDERSTANDING_LEVEL_STRINGS as {[level: number]: string})[
              understanding
            ]
          }
        </BodyTwoText>
      </div>
      <div
        className={classNames(
          styles.descriptionContainer,
          collapsed && styles.descriptionContainerCollapsed
        )}
      >
        <BodyThreeText className={classNames(styles.description)}>
          {teacherDescription}
        </BodyThreeText>
      </div>
    </div>
  );
};

export default StudentRubricView;
