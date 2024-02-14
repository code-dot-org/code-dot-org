import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {aiEvaluationShape, evidenceLevelShape} from './rubricShapes';
import {
  BodyThreeText,
  BodyFourText,
  StrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import {
  UNDERSTANDING_LEVEL_STRINGS,
  UNDERSTANDING_LEVEL_STRINGS_V2,
} from './rubricHelpers';

const INVALID_UNDERSTANDING = -1;

export default function EvidenceLevelsForTeachersV2({
  evidenceLevels,
  understanding,
  radioButtonCallback,
  canProvideFeedback,
  isAutosaving,
  isAiAssessed,
  aiEvalInfo,
}) {
  // Generates a list based on whether the AI understanding level falls in the pass
  // (Extensive / Convincing) or fail (Limited / None) range. Used to display AI bubble
  // around evidence level.
  const passFail = useMemo(() => {
    if (!!aiEvalInfo) {
      // If a teacher set an understanding, or no AI assessment, then bail
      if (understanding !== INVALID_UNDERSTANDING || !isAiAssessed) {
        return [];
      }
      if (aiEvalInfo.understanding > 1) {
        return [2, 3];
      } else if (aiEvalInfo.understanding >= 0) {
        return [0, 1];
      }
    } else return [];
  }, [aiEvalInfo, isAiAssessed, understanding]);

  const [showDescription, setShowDescription] = useState(INVALID_UNDERSTANDING);
  //const evidenceLevelsReverse = evidenceLevels.reverse();
  const handleMouseOver = understandingValue => {
    setShowDescription(understandingValue);
  };

  const handleMouseOut = () => {
    setShowDescription(INVALID_UNDERSTANDING);
  };

  if (canProvideFeedback) {
    return (
      <div>
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
                    : passFail.includes(evidenceLevel.understanding)
                    ? classnames(
                        style.evidenceLevelHighlighted,
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
            {understanding >= 0
              ? evidenceLevels.find(e => e.understanding === understanding)
                  .teacherDescription
              : showDescription !== INVALID_UNDERSTANDING &&
                evidenceLevels.find(e => e.understanding === showDescription)
                  .teacherDescription}
          </BodyFourText>
        </div>
      </div>
    );
  } else {
    return (
      <div className={style.evidenceLevelSet}>
        <Heading6>{i18n.rubricScores()}</Heading6>
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
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  learningGoalKey: PropTypes.string,
  understanding: PropTypes.number,
  radioButtonCallback: PropTypes.func,
  canProvideFeedback: PropTypes.bool,
  isAutosaving: PropTypes.bool,
  isAiAssessed: PropTypes.bool.isRequired,
  aiEvalInfo: aiEvaluationShape,
};
