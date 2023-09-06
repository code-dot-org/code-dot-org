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
          reportingData={{isTeacher: false}}
        />
      ))}
    </div>
  );
}

StudentRubricView.propTypes = {
  rubric: rubricShape.isRequired,
};
