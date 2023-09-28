import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {rubricShape} from './rubricShapes';
import LearningGoal from './LearningGoal';

export default function StudentRubricView({rubric}) {
  const [evaluationsByLearningGoal, setEvaluationsByLearningGoal] =
    useState(null);

  useEffect(() => {
    fetch(`/rubrics/${rubric.id}/get_teacher_evaluations`).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const evaluationMap = {};
          data.forEach(evaluation => {
            evaluationMap[evaluation.learning_goal_id] = evaluation;
          });
          setEvaluationsByLearningGoal(evaluationMap);
        });
      } else {
        console.error(
          `Failed to fetch teacher feedback for rubric ${rubric.id}`
        );
      }
    });
  }, [rubric.id]);

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
        />
      ))}
    </div>
  );
}

StudentRubricView.propTypes = {
  rubric: rubricShape.isRequired,
};
