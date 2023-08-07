import React from 'react';
import PropTypes from 'prop-types';
// import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import RadioButton from '@cdo/apps/componentLibrary/radioButton/RadioButton';
import {
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';

export default function EvidenceLevels({
  evidenceLevels,
  canProvideFeedback,
  learningGoalKey,
}) {
  const radioGroupName = `evidence-levels-${learningGoalKey}`;

  const renderEvidenceLevel = evidenceLevel => {
    if (canProvideFeedback) {
      return (
        <div key={evidenceLevel.id} className={style.evidenceLevelOption}>
          <RadioButton
            label="Extensive Evidence"
            name={radioGroupName}
            value={evidenceLevel.id}
          />
          <BodyThreeText className={style.evidenceLevelDescriptionIndented}>
            {evidenceLevel.teacherDescription}
          </BodyThreeText>
        </div>
      );
    } else {
      return (
        <div key={evidenceLevel.id} className={style.evidenceLevelOption}>
          <BodyTwoText>Extensive Evidence</BodyTwoText>
          <BodyThreeText>{evidenceLevel.teacherDescription}</BodyThreeText>
        </div>
      );
    }
  };

  return <div>{evidenceLevels.map(renderEvidenceLevel)}</div>;
}

EvidenceLevels.propTypes = {
  evidenceLevels: PropTypes.arrayOf(PropTypes.object),
  canProvideFeedback: PropTypes.bool,
  learningGoalKey: PropTypes.string,
};
