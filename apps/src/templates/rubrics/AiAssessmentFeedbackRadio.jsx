/* eslint-disable import/order */
import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import {BodyThreeText, StrongText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import AiAssessmentFeedbackContext from './AiAssessmentFeedbackContext';
import {submitAiFeedback} from './AiAssessmentFeedback';

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
    <div className={style.aiFeedbackRadioBox}>
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
      <BodyThreeText className={style.aiFeedbackRadioBoxText}>
        <StrongText>{i18n.aiAssessmentFeedbackAsk()}</StrongText>
      </BodyThreeText>
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
