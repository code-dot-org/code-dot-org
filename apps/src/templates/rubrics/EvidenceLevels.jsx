import React from 'react';
import PropTypes from 'prop-types';
import {
  aiEvaluationShape,
  evidenceLevelShape,
  submittedEvaluationShape,
} from './rubricShapes';
import EvidenceLevelsForStudents from './EvidenceLevelsForStudents';
import EvidenceLevelsForTeachersV2 from './EvidenceLevelsForTeachersV2';

export default function EvidenceLevels({
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  submittedEvaluation,
  isStudent,
  isAutosaving,
  aiEvalInfo,
}) {
  const sortedEvidenceLevels = () => {
    const newArray = [...evidenceLevels];
    return newArray.sort((a, b) => b.understanding - a.understanding);
  };
  if (isStudent) {
    return (
      <EvidenceLevelsForStudents
        evidenceLevels={sortedEvidenceLevels()}
        submittedEvaluation={submittedEvaluation}
      />
    );
  } else {
    return (
      <EvidenceLevelsForTeachersV2
        aiEvalInfo={aiEvalInfo}
        learningGoalKey={learningGoalKey}
        evidenceLevels={sortedEvidenceLevels().reverse()}
        understanding={understanding}
        radioButtonCallback={radioButtonCallback}
        canProvideFeedback={canProvideFeedback}
        isAutosaving={isAutosaving}
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
  isStudent: PropTypes.bool,
  isAutosaving: PropTypes.bool,
  aiEvalInfo: aiEvaluationShape,
};
