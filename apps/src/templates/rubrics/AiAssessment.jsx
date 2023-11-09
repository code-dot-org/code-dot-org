import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import AiAssessmentBox from './AiAssessmentBox';
import AiAssessmentFeedback from './AiAssessmentFeedback';
import {aiEvaluationShape} from './rubricShapes';
const icon = require('@cdo/static/ai-bot.png');

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiEvaluation,
  studentSubmitted,
  learningGoalKey,
}) {
  const hasAiInfo = !!aiEvaluation;
  return (
    <div>
      <Heading6>{i18n.aiAssessment()}</Heading6>
      <div className={style.aiAssessmentBlock}>
        <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
        <AiAssessmentBox
          isAiAssessed={isAiAssessed}
          studentName={studentName}
          studentSubmitted={studentSubmitted}
          aiEvaluation={aiEvaluation}
        />
      </div>
      {hasAiInfo && (
        <div>
          <AiAssessmentFeedback learningGoalKey={learningGoalKey} />
        </div>
      )}
    </div>
  );
}

AiAssessment.propTypes = {
  isAiAssessed: PropTypes.bool.isRequired,
  studentName: PropTypes.string,
  aiEvaluation: aiEvaluationShape,
  studentSubmitted: PropTypes.bool,
  learningGoalKey: PropTypes.string,
};
