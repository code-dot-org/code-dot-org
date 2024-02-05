import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {rubricShape, submittedEvaluationShape} from './rubricShapes';
import LearningGoal from './LearningGoal';

export default function StudentRubricView({rubric, submittedEvaluation}) {
  const evaluationsByLearningGoal = useMemo(() => {
    const evaluationMap = {};
    submittedEvaluation?.forEach(evaluation => {
      evaluationMap[evaluation.learning_goal_id] = evaluation;
    });
    return evaluationMap;
  }, [submittedEvaluation]);

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
          submittedEvaluation={
            evaluationsByLearningGoal && evaluationsByLearningGoal[lg.id]
          }
          /* TODO: [AITT-161] add reporting data for the student case */
          reportingData={{}}
          isStudent={true}
        />
      ))}
    </div>
  );
}

StudentRubricView.propTypes = {
  rubric: rubricShape.isRequired,
  submittedEvaluation: PropTypes.arrayOf(submittedEvaluationShape),
};
