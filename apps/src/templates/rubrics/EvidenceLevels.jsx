import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {evidenceLevelShape, submittedEvaluationShape} from './rubricShapes';
import RadioButton from '@cdo/apps/componentLibrary/radioButton/RadioButton';
import {BodyThreeText, Heading6} from '@cdo/apps/componentLibrary/typography';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

export default function EvidenceLevels({
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  submittedEvaluation,
}) {
  if (canProvideFeedback) {
    const radioGroupName = `evidence-levels-${learningGoalKey}`;
    return (
      <div className={style.evidenceLevelSet}>
        <Heading6>{i18n.assignARubricScore()}</Heading6>
        {evidenceLevels.map(evidenceLevel => (
          <div
            key={evidenceLevel.id}
            className={classNames(
              style.evidenceLevelOption,
              style.evidenceLevelLabel
            )}
          >
            {' '}
            <RadioButton
              label={UNDERSTANDING_LEVEL_STRINGS[evidenceLevel.understanding]}
              name={radioGroupName}
              value={evidenceLevel.id}
              size="s"
              onChange={() => {
                radioButtonCallback(evidenceLevel.understanding);
              }}
              checked={understanding === evidenceLevel.understanding}
            />
            <BodyThreeText
              className={classNames(style.evidenceLevelDescriptionIndented)}
            >
              {evidenceLevel.teacherDescription}
            </BodyThreeText>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className={style.evidenceLevelSet}>
        <Heading6>Rubric Scores</Heading6>
        {evidenceLevels.map(evidenceLevel => (
          <div
            key={evidenceLevel.id}
            className={classNames(style.evidenceLevelOption, {
              [style.submittedEvaluationEvidenceLevel]:
                submittedEvaluation?.understanding ===
                evidenceLevel.understanding,
            })}
          >
            {/*TODO: [DES-321] Label-two styles here*/}
            <BodyThreeText className={style.evidenceLevelLabel}>
              {UNDERSTANDING_LEVEL_STRINGS[evidenceLevel.understanding]}
            </BodyThreeText>
            <BodyThreeText>{evidenceLevel.teacherDescription}</BodyThreeText>
          </div>
        ))}
      </div>
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
