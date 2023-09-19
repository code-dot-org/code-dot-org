import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {evidenceLevelShape} from './rubricShapes';
import RadioButton from '@cdo/apps/componentLibrary/radioButton/RadioButton';
import {BodyThreeText, Heading6} from '@cdo/apps/componentLibrary/typography';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

export default function EvidenceLevels({
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
  understanding,
  radioButtonCallback,
}) {
  const [understandingChecked, setUnderstandingChecked] =
    useState(understanding);
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
              checked={understandingChecked === evidenceLevel.id}
              defaultChecked={understanding === evidenceLevel.id ? true : false}
              onChange={() => {
                radioButtonCallback(evidenceLevel.id);
                setUnderstandingChecked(evidenceLevel.id);
              }}
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
        {evidenceLevels.map(evidenceLevel => (
          <div key={evidenceLevel.id} className={style.evidenceLevelOption}>
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
};
