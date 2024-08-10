import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

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
  arrowPositionCallback,
}) {
  const ref = useRef(null);

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

  useLayoutEffect(() => {
    // Get the position of the suggested buttons and determine the position of the arrow
    const edge = ref.current.getBoundingClientRect().left;
    const nodes = ref.current.querySelectorAll('button[data-ai-suggested]');
    const node = nodes[0];
    const dim = node?.getBoundingClientRect();

    let left = 0;
    if (nodes.length === 1) {
      // If there is just one node, we center it on that suggested level
      left = (dim.right - dim.left) / 2 + dim.left - edge;
    } else if (nodes.length === 2) {
      // If there are two nodes, we place it between the two
      const nextDim = nodes[1].getBoundingClientRect();
      left = (nextDim.left - dim.right) / 2 + dim.right - edge;
    }
    arrowPositionCallback(left);
  }, [arrowPositionCallback, suggestedEvidenceLevels]);

  if (canProvideFeedback) {
    return (
      <div id="tour-evidence-levels">
        <BodyThreeText className={style.evidenceLevelHeaderText}>
          <StrongText>{i18n.assignARubricScore()}</StrongText>
        </BodyThreeText>
        <div className={style.evidenceLevelSetHorizontal} ref={ref}>
          {evidenceLevels.map(evidenceLevel => (
            <button
              data-ai-suggested={
                suggestedEvidenceLevels.includes(evidenceLevel.understanding)
                  ? ''
                  : null
              }
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
  arrowPositionCallback: PropTypes.func,
};
