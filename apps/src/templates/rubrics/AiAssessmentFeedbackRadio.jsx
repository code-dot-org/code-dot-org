import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import AiAssessmentFeedbackContext, {
  THUMBS_UP,
  THUMBS_DOWN,
} from './AiAssessmentFeedbackContext';

import style from './rubrics.module.scss';

export default function AiAssessmentFeedbackRadio({aiEvalId, setAiFeedbackId}) {
  const radioGroupName = `ai-assessment-feedback-${aiEvalId}`;

  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);

  const createAiFeedback = async value => {
    // immediately show the thumbs up or down icon as selected in the UI
    setAiFeedback(value);

    // send the thumbs up or down value to the server
    const baseUrl = '/learning_goal_ai_evaluation_feedbacks';
    const response = await HttpClient.post(
      baseUrl,
      JSON.stringify({
        learningGoalAiEvaluationId: aiEvalId,
        aiFeedbackApproval: value,
      }),
      true,
      {'Content-Type': 'application/json'}
    );

    // for thumbs down, wait until we have the server id of the feedback before
    // displaying the survey form, so that we know which feedback to update.
    const responseData = await response.json();
    setAiFeedbackId(responseData.id);
  };

  return (
    <div id="tour-ai-assessment-feedback" className={style.aiFeedbackRadioBox}>
      <div className={style.aiFeedbackRadioRow}>
        <label>
          <span
            className={classnames(style.aiFeedbackRadioLabel, [
              aiFeedback === THUMBS_UP && style.aiFeedbackRadioLabelChecked,
            ])}
            aria-hidden="true"
          >
            {aiFeedback === THUMBS_UP ? (
              <FontAwesome icon="thumbs-up" />
            ) : (
              <FontAwesome icon="thumbs-o-up" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value={THUMBS_UP}
            onChange={() => createAiFeedback(THUMBS_UP)}
            checked={aiFeedback === THUMBS_UP}
          />
        </label>

        <label>
          <span
            className={classnames(style.aiFeedbackRadioLabel, [
              aiFeedback === THUMBS_DOWN && style.aiFeedbackRadioLabelChecked,
            ])}
            aria-hidden="true"
          >
            {aiFeedback === THUMBS_DOWN ? (
              <FontAwesome icon="thumbs-down" />
            ) : (
              <FontAwesome icon="thumbs-o-down" />
            )}
          </span>
          <input
            type="radio"
            className={style.aiFeedbackRadio}
            name={radioGroupName}
            value={THUMBS_DOWN}
            onChange={() => createAiFeedback(THUMBS_DOWN)}
            checked={aiFeedback === THUMBS_DOWN}
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
