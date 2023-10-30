import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default function AiAssessmentFeedback({
  learningGoalKey,
  radioAiFeedbackCallback,
  aiFeedback,
}) {
  const radioGroupName = `ai-assessment-feedback-${learningGoalKey}`;

  return (
    <div>
      <div className={style.aiFeedbackRow}>
        <BodyThreeText>{i18n.aiAssessmentFeedbackAsk()}</BodyThreeText>
        <label>
          <span
            className={
              aiFeedback === 'thumbsup'
                ? style.aiFeedbackThumbsUpChecked
                : style.aiFeedbackThumbsUp
            }
            aria-hidden="true"
          >
            {aiFeedback === 'thumbsup' ? (
              <FontAwesome icon="thumbs-up" />
            ) : (
              <FontAwesome icon="thumbs-o-up" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value="thumbsup"
            onChange={() => {
              radioAiFeedbackCallback('thumbsup');
            }}
            checked={aiFeedback === 'thumbsup'}
          />
        </label>

        <label>
          <span
            className={
              aiFeedback === 'thumbsdown'
                ? style.aiFeedbackThumbsDownChecked
                : style.aiFeedbackThumbsDown
            }
            aria-hidden="true"
          >
            {aiFeedback === 'thumbsdown' ? (
              <FontAwesome icon="thumbs-down" />
            ) : (
              <FontAwesome icon="thumbs-o-down" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value="thumbsdown"
            onChange={() => {
              radioAiFeedbackCallback('thumbsdown');
            }}
            checked={aiFeedback === 'thumbsdown'}
          />
        </label>
      </div>
    </div>
  );
}

AiAssessmentFeedback.propTypes = {
  learningGoalKey: PropTypes.string,
  radioAiFeedbackCallback: PropTypes.func,
  aiFeedback: PropTypes.string,
};
