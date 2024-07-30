import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import AiAssessmentFeedbackContext from './AiAssessmentFeedbackContext';

import style from './rubrics.module.scss';

async function createAiFeedback(values, setAiFeedbackId) {
  const baseUrl = '/learning_goal_ai_evaluation_feedbacks';
  const response = await HttpClient.post(
    baseUrl,
    JSON.stringify(values),
    true,
    {'Content-Type': 'application/json'}
  );
  const data = await response.json();
  setAiFeedbackId(data.id);
}

export default function AiAssessmentFeedbackRadio({aiEvalId, setAiFeedbackId}) {
  const radioGroupName = `ai-assessment-feedback-${aiEvalId}`;
  const thumbsupval = 1;
  const thumbsdownval = 0;

  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);

  const updateFeedback = value => {
    setAiFeedback(value);
    const data = {
      learningGoalAiEvaluationId: aiEvalId,
      aiFeedbackApproval: thumbsupval,
    };
    createAiFeedback(data, setAiFeedbackId);
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
  setAiFeedbackId: PropTypes.func.isRequired,
};
