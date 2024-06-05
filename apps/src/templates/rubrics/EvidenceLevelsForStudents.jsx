import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {
  BodyThreeText,
  Heading6,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
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
      <Heading6>{i18n.rubricScores()}</Heading6>
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
              <BodyThreeText>
                <StrongText>
                  {UNDERSTANDING_LEVEL_STRINGS[evidenceLevel.understanding]}
                </StrongText>
              </BodyThreeText>
              <BodyThreeText>{evidenceLevel.teacherDescription}</BodyThreeText>
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
