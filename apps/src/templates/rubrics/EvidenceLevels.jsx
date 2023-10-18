import React from 'react';
import PropTypes from 'prop-types';
import {evidenceLevelShape, submittedEvaluationShape} from './rubricShapes';
import EvidenceLevelsForStudents from './EvidenceLevelsForStudents';
import EvidenceLevelsForTeachers from './EvidenceLevelsForTeachers';

export default function EvidenceLevels({
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  submittedEvaluation,
}) {
  const sortedEvidenceLevels = () => {
    const newArray = [...evidenceLevels];
    return newArray.sort((a, b) => b.understanding - a.understanding);
  };
  if (canProvideFeedback) {
    return (
      <EvidenceLevelsForTeachers
        learningGoalKey={learningGoalKey}
        evidenceLevels={sortedEvidenceLevels()}
        understanding={understanding}
        radioButtonCallback={radioButtonCallback}
      />
    );
  } else {
    return (
      <EvidenceLevelsForStudents
        evidenceLevels={sortedEvidenceLevels()}
        submittedEvaluation={submittedEvaluation}
      />
    );
  }
}

EvidenceLevels.propTypes = {
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  canProvideFeedback: PropTypes.bool,
  learningGoalKey: PropTypes.string,
  understanding: PropTypes.number,
  radioButtonCallback: PropTypes.func,
  submittedEvaluation: submittedEvaluationShape,
};
