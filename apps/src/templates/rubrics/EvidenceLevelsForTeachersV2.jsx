import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
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

export default function EvidenceLevelsForTeachersV2({
  evidenceLevels,
  understanding,
  radioButtonCallback,
  canProvideFeedback,
  isAutosaving,
  aiEvalInfo,
}) {
  const passFail = useMemo(() => {
    if (!!aiEvalInfo) {
      if (aiEvalInfo.understanding > 1) {
        console.log('pass');
        return [2, 3];
      } else if (aiEvalInfo.understanding >= 0) {
        console.log('fail');
        return [0, 1];
      }
    } else return [];
  }, [aiEvalInfo]);

  if (canProvideFeedback) {
    return (
      <div>
        <Heading6>{i18n.assignARubricScore()}</Heading6>
        <div className={style.evidenceLevelSetHorizontal}>
          {evidenceLevels.reverse().map(evidenceLevel => (
            <button
              disabled={isAutosaving}
              type="button"
              key={evidenceLevel.id}
              onClick={() => radioButtonCallback(evidenceLevel.understanding)}
              className={
                understanding === evidenceLevel.understanding
                  ? style.evidenceLevelSelected
                  : passFail.includes(evidenceLevel.understanding)
                  ? style.aiEvalSuggestion
                  : style.evidenceLevelUnselected
              }
            >
              {UNDERSTANDING_LEVEL_STRINGS_V2[evidenceLevel.understanding]}
            </button>
          ))}
          <BodyFourText>
            {understanding >= 0 &&
              evidenceLevels.find(e => e.understanding === understanding)
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
  aiEvalInfo: aiEvaluationShape,
};
