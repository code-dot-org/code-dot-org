import {Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';
import {evidenceLevelShape, submittedEvaluationShape} from './rubricShapes';

import style from './rubrics.module.scss';

export default function EvidenceLevelsForStudents({
  evidenceLevels,
  submittedEvaluation,
}) {
  return (
    <div className={style.evidenceLevelSet}>
      <Typography variant="h6" gutterBottom>
        {i18n.rubricScores()}
      </Typography>
      <div className={style.evidenceLevelSetHorizontal}>
        {evidenceLevels.map((evidenceLevel, index) => (
          <div key={evidenceLevel.id} className={style.evidenceLevelInnerDiv}>
            <div
              className={classNames(style.evidenceLevelOption, {
                [style.submittedEvaluationEvidenceLevel]:
                  submittedEvaluation?.understanding ===
                  evidenceLevel.understanding,
              })}
            >
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
          </div>
        ))}
      </div>
    </div>
  );
}

EvidenceLevelsForStudents.propTypes = {
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape).isRequired,
  submittedEvaluation: submittedEvaluationShape,
};
