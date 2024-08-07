import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import i18n from '@cdo/locale';

import {submitAiFeedback} from './AiAssessmentFeedback';
import AiAssessmentFeedbackContext from './AiAssessmentFeedbackContext';

import style from './rubrics.module.scss';

export default function AiAssessmentFeedbackRadio({aiEvalId, onChosen}) {
  const radioGroupName = `ai-assessment-feedback-${aiEvalId}`;
  const thumbsupval = 1;
  const thumbsdownval = 0;

  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);

  const updateFeedback = value => {
    setAiFeedback(value);

    if (value === thumbsupval) {
      submitAiFeedback({
        learningGoalAiEvaluationId: aiEvalId,
        aiFeedbackApproval: thumbsupval,
      });
    }
  };

  return (
    <div id="tour-ai-assessment-feedback" className={style.aiFeedbackRadioBox}>
      <div className={style.aiFeedbackRadioRow}>
        <label>
          <span
            className={classnames(style.aiFeedbackRadioLabel, [
              aiFeedback === thumbsupval && style.aiFeedbackRadioLabelChecked,
            ])}
            aria-hidden="true"
          >
            {aiFeedback === thumbsupval ? (
              <FontAwesome icon="thumbs-up" />
            ) : (
              <FontAwesome icon="thumbs-o-up" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value={thumbsupval}
            onChange={() => updateFeedback(thumbsupval)}
            checked={aiFeedback === thumbsupval}
          />
        </label>

        <label>
          <span
            className={classnames(style.aiFeedbackRadioLabel, [
              aiFeedback === thumbsdownval && style.aiFeedbackRadioLabelChecked,
            ])}
            aria-hidden="true"
          >
            {aiFeedback === thumbsdownval ? (
              <FontAwesome icon="thumbs-down" />
            ) : (
              <FontAwesome icon="thumbs-o-down" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value={thumbsdownval}
            onChange={() => updateFeedback(thumbsdownval)}
            checked={aiFeedback === thumbsdownval}
          />
        </label>
      </div>
      <p className={style.aiFeedbackRadioBoxText}>
        {i18n.aiAssessmentFeedbackAsk()}
      </p>
    </div>
  );
}
/*
      {aiFeedbackReceived && (
        <EmText className={style.aiFeedbackReceived}>
          {i18n.aiFeedbackReceived()}
        </EmText>
      )}
      */

AiAssessmentFeedbackRadio.propTypes = {
  aiEvalId: PropTypes.number.isRequired,
  onChosen: PropTypes.func.isRequired,
};
