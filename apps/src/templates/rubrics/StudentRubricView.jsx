import React from 'react';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {rubricShape} from './rubricShapes';
import LearningGoal from './LearningGoal';

export default function StudentRubricView({rubric}) {
  return (
    <div
      className={classnames(
        style.learningGoalContainer,
        style.studentLearningGoalContainer
      )}
    >
      {rubric.learningGoals.map(lg => (
        <LearningGoal
          key={lg.key}
          learningGoal={lg}
          canProvideFeedback={false}
          /* TODO: [AITT-161] add reporting data for the student case */
          reportingData={{}}
        />
      ))}
    </div>
  );
}

StudentRubricView.propTypes = {
  rubric: rubricShape.isRequired,
};
