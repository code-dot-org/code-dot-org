import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {EmText, Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
const icon = require('@cdo/static/AI-FAB.png');

export default function AiAssessment({
  isAiAssessed,
  studentName,
  aiAssessmentLevel,
  aiConfidence,
}) {
  // TO DO: Internationalize all text
  return (
    <div>
      <Heading6>{i18n.aiAssessment()}</Heading6>
      <div className="aiAssessmentBlock">
        <img className="aiBot" alt="Ai bot" src={icon} />
        <div className="assessment">
          <div className="text">
            <Heading6 className="AI-rating">
              {studentName} has achieved {aiAssessmentLevel} for this learning
              goal.
            </Heading6>
            <div className="confidence-score">
              <EmText>
                AI is {aiConfidence}% confident in this assessment
              </EmText>
              <span data-tip data-for="info-tip">
                <FontAwesome icon="info-circle" className={style.infoTipIcon} />
              </span>
              <ReactTooltip id="info-tip" effect="solid">
                <p>text here</p>
              </ReactTooltip>
            </div>
          </div>
        </div>
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
