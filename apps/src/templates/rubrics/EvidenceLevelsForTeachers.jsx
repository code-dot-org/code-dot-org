import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';
import {evidenceLevelShape} from './rubricShapes';

import style from './rubrics.module.scss';

export default function EvidenceLevelsForTeachers({
  evidenceLevels,
  learningGoalKey,
  understanding,
  radioButtonCallback,
  canProvideFeedback,
  isAutosaving,
}) {
  const radioGroupName = `evidence-levels-${learningGoalKey}`;
  if (canProvideFeedback) {
    return (
      <div className={style.evidenceLevelSet}>
        <Typography variant="h6" gutterBottom>
          {i18n.assignARubricScore()}
        </Typography>
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
              disabled={isAutosaving}
            />
            <Typography
              className={classNames(style.evidenceLevelDescriptionIndented)}
              variant="body3"
              gutterBottom
            >
              {evidenceLevel.teacherDescription}
            </Typography>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className={style.evidenceLevelSet}>
        <Typography variant="h6" gutterBottom>
          {i18n.rubricScores()}
        </Typography>
        {evidenceLevels.map(evidenceLevel => (
          <div key={evidenceLevel.id} className={style.evidenceLevelOption}>
            {/*TODO: [DES-321] Label-two styles here*/}
            <Typography variant="body3" gutterBottom>
              <Typography variant="strong">
                {UNDERSTANDING_LEVEL_STRINGS[evidenceLevel.understanding]}
              </Typography>
            </Typography>
            <Typography variant="body3" gutterBottom>
              {evidenceLevel.teacherDescription}
            </Typography>
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
  isAutosaving: PropTypes.bool,
};
