import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import AiAssessmentBox from './AiAssessmentBox';
import AiAssessmentFeedback from './AiAssessmentFeedback';
const icon = require('@cdo/static/ai-bot.png');

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiUnderstandingLevel,
  aiConfidence,
  learningGoalKey,
}) {
  const [aiFeedback, setAIFeedback] = useState('');

  const radioAiFeedbackCallback = radioButtonData => {
    setAIFeedback(radioButtonData);
  };

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
      <div>
        <AiAssessmentFeedback
          learningGoalKey={learningGoalKey}
          radioAiFeedbackCallback={radioAiFeedbackCallback}
          aiFeedback={aiFeedback}
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
  learningGoalKey: PropTypes.string,
};
