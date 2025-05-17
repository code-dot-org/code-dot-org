// Student-facing rubric view inside Lab2 panel

import {Button} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {getTaRubricFeedbackForStudent} from '@cdo/apps/templates/instructions/topInstructionsDataApi';
import ProgressRing from '@cdo/apps/templates/rubrics/ProgressRing';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';

import {EvidenceLevel, Rubric, SubmittedEvaluation} from './types';

import styles from './styles.module.scss';

interface RubricViewProps {
  rubric: Rubric;
}

const RubricView: React.FC<RubricViewProps> = ({rubric}) => {
  const [evaluations, setEvaluations] = useState<SubmittedEvaluation[]>();
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  useEffect(() => {
    getTaRubricFeedbackForStudent(rubric.id).then(response =>
      setEvaluations(response.value as SubmittedEvaluation[])
    );
  }, [rubric.id]);

  if (!evaluations) {
    return <div>Loading...</div>;
  }

  const switchGoal = (direction: -1 | 1) => {
    const numGoals = rubric.learningGoals.length;
    setCurrentGoalIndex((currentGoalIndex + direction + numGoals) % numGoals);
  };

  const currentLearningGoal = rubric.learningGoals[currentGoalIndex];
  const currentEvaluation = evaluations[currentGoalIndex];
  return (
    <div className={styles.rubricContainer}>
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
          learningGoals={rubric.learningGoals}
          currentLearningGoal={currentGoalIndex}
          understandingLevels={evaluations.map(evaluation =>
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
      <BodyTwoText className={styles.learningGoalHeader}>
        {currentLearningGoal.learningGoal}
      </BodyTwoText>
      <div className={styles.scrollContainer}>
        <div className={styles.feedbackContainer}>
          <BodyFourText className={styles.feedbackHeader}>
            <i>
              {!!currentEvaluation?.feedback
                ? 'Your teacher wrote:'
                : 'No feedback yet!'}
            </i>
          </BodyFourText>
          {currentEvaluation?.feedback && (
            <div className={styles.teacherFeedback}>
              <BodyThreeText>{currentEvaluation?.feedback}</BodyThreeText>
            </div>
          )}
        </div>
        <div className={styles.evidenceLevelsContainer}>
          {currentLearningGoal.evidenceLevels.map((evidenceLevel, index) => (
            <EvidenceLevelView
              key={index}
              {...evidenceLevel}
              selected={
                currentEvaluation?.understanding === evidenceLevel.understanding
              }
            />
          ))}
        </div>
      </div>
      <div className={styles.navigationButtonContainer} data-theme="Light">
        <Button
          id="instructions-continue-button"
          text={'Submit'}
          onClick={() => {}}
          className={styles.navigationButton}
          type={'primary'}
          color={'purple'}
        />
      </div>
    </div>
  );
};

interface EvidenceLevelViewProps extends EvidenceLevel {
  selected: boolean;
}

const EvidenceLevelView: React.FC<EvidenceLevelViewProps> = ({
  understanding,
  teacherDescription,
  selected,
}) => {
  const [collapsed, setCollapsed] = useState(!selected);

  useEffect(() => {
    setCollapsed(!selected);
  }, [selected]);

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

export default RubricView;
