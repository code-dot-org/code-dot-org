import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {evidenceLevelShape} from './rubricShapes';
import RadioButton from '@cdo/apps/componentLibrary/radioButton/RadioButton';
import {
  BodyThreeText,
  StrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

export default function EvidenceLevelsForTeachers({
  evidenceLevels,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  canProvideFeedback,
}) {
  const radioGroupName = `evidence-levels-${learningGoalKey}`;
  if (canProvideFeedback) {
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

EvidenceLevelsForTeachers.propTypes = {
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  learningGoalKey: PropTypes.string,
  understanding: PropTypes.number,
  radioButtonCallback: PropTypes.func,
  canProvideFeedback: PropTypes.bool,
};
