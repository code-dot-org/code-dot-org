import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useMemo, useState, useEffect} from 'react';

import {
  BodyThreeText,
  BodyFourText,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {
  UNDERSTANDING_LEVEL_STRINGS,
  UNDERSTANDING_LEVEL_STRINGS_V2,
} from './rubricHelpers';
import {aiEvaluationShape, evidenceLevelShape} from './rubricShapes';

import style from './rubrics.module.scss';

const INVALID_UNDERSTANDING = -1;

export default function EvidenceLevelsForTeachersV2({
  productTour,
  evidenceLevels,
  understanding,
  radioButtonCallback,
  canProvideFeedback,
  isAutosaving,
  isAiAssessed,
  aiEvalInfo,
}) {
  // Generates a list of evidence levels to highlight, indicating the AI
  // recommendation. Using the precomputed value showExactMatch, decides whether
  // to highlight a single evidence level (exact match) or a range of two
  // evidence levels (pass / fail).
  const suggestedEvidenceLevels = useMemo(() => {
    if (!!aiEvalInfo) {
      // If a teacher set an understanding, or no AI assessment, then bail
      if (understanding !== INVALID_UNDERSTANDING || !isAiAssessed) {
        return [];
      }
      if (aiEvalInfo.showExactMatch) {
        return [aiEvalInfo.understanding];
      }
      if (aiEvalInfo.understanding > RubricUnderstandingLevels.LIMITED) {
        return [
          RubricUnderstandingLevels.CONVINCING,
          RubricUnderstandingLevels.EXTENSIVE,
        ];
      } else if (aiEvalInfo.understanding >= RubricUnderstandingLevels.NONE) {
        return [
          RubricUnderstandingLevels.LIMITED,
          RubricUnderstandingLevels.NONE,
        ];
      }
    } else return [];
  }, [aiEvalInfo, isAiAssessed, understanding]);

  const [showDescription, setShowDescription] = useState(INVALID_UNDERSTANDING);

  const handleMouseOver = understandingValue => {
    setShowDescription(understandingValue);
  };

  const handleMouseOut = () => {
    setShowDescription(INVALID_UNDERSTANDING);
  };

  useEffect(() => {
    if (productTour) {
      setShowDescription(3);
    } else {
      setShowDescription(INVALID_UNDERSTANDING);
    }
  }, [productTour]);

  if (canProvideFeedback) {
    return (
      <div id="tour-evidence-levels">
        <BodyThreeText className={style.evidenceLevelHeaderText}>
          <StrongText>{i18n.assignARubricScore()}</StrongText>
        </BodyThreeText>
        <div className={style.evidenceLevelSetHorizontal}>
          {evidenceLevels.map(evidenceLevel => (
            <button
              disabled={isAutosaving}
              type="button"
              key={evidenceLevel.id}
              onClick={() => radioButtonCallback(evidenceLevel.understanding)}
              onMouseOver={() => handleMouseOver(evidenceLevel.understanding)}
              onMouseOut={() => handleMouseOut()}
              className={classnames(
                style.evidenceLevel,
                [
                  understanding === evidenceLevel.understanding
                    ? style.evidenceLevelSelected
                    : suggestedEvidenceLevels.includes(
                        evidenceLevel.understanding
                      )
                    ? classnames(
                        'unittest-evidence-level-suggested',
                        style.evidenceLevelSuggested,
                        style.evidenceLevelUnselected
                      )
                    : style.evidenceLevelUnselected,
                ],
                []
              )}
            >
              {UNDERSTANDING_LEVEL_STRINGS_V2[evidenceLevel.understanding]}
            </button>
          ))}
          <BodyFourText>
            {showDescription !== INVALID_UNDERSTANDING
              ? evidenceLevels.find(e => e.understanding === showDescription)
                  .teacherDescription
              : understanding >= 0 &&
                evidenceLevels.find(e => e.understanding === understanding)
                  .teacherDescription}
          </BodyFourText>
        </div>
      </div>
    );
  } else {
    return (
      <div className={style.evidenceLevelSet}>
        <BodyThreeText>
          <StrongText>{i18n.rubricScores()}</StrongText>
        </BodyThreeText>
        {evidenceLevels.map(evidenceLevel => (
          <div key={evidenceLevel.id} className={style.evidenceLevelOption}>
            {/*TODO: [DES-321] Label-two styles here*/}
            <BodyThreeText>
              <StrongText>
                {UNDERSTANDING_LEVEL_STRINGS[evidenceLevel.understanding]}
              </StrongText>
            </BodyThreeText>
            <BodyThreeText>{evidenceLevel.teacherDescription}</BodyThreeText>
          </div>
        ))}
      </div>
    );
  }
}

EvidenceLevelsForTeachersV2.propTypes = {
  productTour: PropTypes.bool,
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  learningGoalKey: PropTypes.string,
  understanding: PropTypes.number,
  radioButtonCallback: PropTypes.func,
  canProvideFeedback: PropTypes.bool,
  isAutosaving: PropTypes.bool,
  isAiAssessed: PropTypes.bool.isRequired,
  aiEvalInfo: aiEvaluationShape,
};
