import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import AiAssessmentBox from './AiAssessmentBox';
const icon = require('@cdo/static/ai-bot.png');

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
}) {
  return (
    <div>
      <Heading6>{i18n.aiAssessment()}</Heading6>
      <div className={style.aiAssessmentBlock}>
        <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
        <AiAssessmentBox
          isAiAssessed={isAiAssessed}
          aiUnderstandingLevel={aiUnderstandingLevel}
          studentName={studentName}
          aiConfidence={aiConfidence}
        />
      </div>
    </div>
  );
}

AiAssessment.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiUnderstandingLevel: PropTypes.number,
  aiConfidence: PropTypes.number,
};
