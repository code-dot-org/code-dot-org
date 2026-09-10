import PropTypes from 'prop-types';
import React from 'react';

import EvidenceLevelsForStudents from './EvidenceLevelsForStudents';
import EvidenceLevelsForTeachersV2 from './EvidenceLevelsForTeachersV2';
import {
  aiEvaluationShape,
  evidenceLevelShape,
  submittedEvaluationShape,
} from './rubricShapes';

export default function EvidenceLevels({
  productTour,
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  submittedEvaluation,
  isStudent,
  isAutosaving,
  isAiAssessed,
  aiEvalInfo,
  arrowPositionCallback,
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
        productTour={productTour}
        aiEvalInfo={aiEvalInfo}
        isAiAssessed={isAiAssessed}
        learningGoalKey={learningGoalKey}
        evidenceLevels={sortedEvidenceLevels().reverse()}
        understanding={understanding}
        radioButtonCallback={radioButtonCallback}
        canProvideFeedback={canProvideFeedback}
        isAutosaving={isAutosaving}
        arrowPositionCallback={arrowPositionCallback}
      />
    );
  }
}

EvidenceLevels.propTypes = {
  productTour: PropTypes.bool,
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  canProvideFeedback: PropTypes.bool,
  learningGoalKey: PropTypes.string,
  understanding: PropTypes.number,
  radioButtonCallback: PropTypes.func,
  submittedEvaluation: submittedEvaluationShape,
  isStudent: PropTypes.bool,
  isAutosaving: PropTypes.bool,
  isAiAssessed: PropTypes.bool.isRequired,
  aiEvalInfo: aiEvaluationShape,
  arrowPositionCallback: PropTypes.func,
};
