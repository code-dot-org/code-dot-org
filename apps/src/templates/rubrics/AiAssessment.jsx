import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import AiAssessmentBox from './AiAssessmentBox';
const icon = require('@cdo/static/AI-FAB.png');

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiAssessmentLevel,
  aiConfidence,
}) {
  // TO DO: pass through props from parent to child component below
  return (
    <div>
      <Heading6>{i18n.aiAssessment()}</Heading6>
      <div className={style.aiAssessmentBlock}>
        <img className="aiBot" alt="Ai bot" src={icon} />
        <AiAssessmentBox
          isAiAssessed={true}
          aiAssessmentLevel={3}
          studentName={studentName}
          aiConfidence={50}
        />
      </div>
    </div>
  );
}

AiAssessment.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiAssessmentLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
};
