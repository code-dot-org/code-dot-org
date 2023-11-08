import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {aiEvaluationShape} from './rubricShapes';
// import HttpClient from '@cdo/apps/util/HttpClient';
import {
  BodyThreeText,
  EmText,
  Heading6,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import Button from '@cdo/apps/templates/Button';

export default function AiAssessmentFeedback({learningGoalKey, aiInfo}) {
  const radioGroupName = `ai-assessment-feedback-${learningGoalKey}`;
  // const radioGroupName = `ai-assessment-feedback-${aiInfo.learning_goal_id}`;
  const thumbsupval = 'thumbsup';
  const thumbsdownval = 'thumbsdown';

  const [aiFeedback, setAIFeedback] = useState('');
  const [aiSubmitted, setAISubmitted] = useState(false);
  const [aiFalsePos, setAIFalsePos] = useState(false);
  const [aiFalseNeg, setAIFalseNeg] = useState(false);
  const [aiVague, setAIVague] = useState(false);
  const [aiFeedbackOther, setAIFeedbackOther] = useState(false);
  const [aiOtherContent, setAIOtherContent] = useState('');
  const [aiFeedbackReceived, setAIFeedbackReceived] = useState(false);

  // Timer vars for feedback received flag
  const receivedTimer = useRef();
  const disappearAfter = 20000;

  const radioAiFeedbackCallback = radioButtonData => {
    setAIFeedback(radioButtonData);
    // TODO: http put ai feedback json data iff thumbsup
  };

  const submitAiFeedbackCallback = () => {
    const bodyData = JSON.stringify({
      learningGoalKey: learningGoalKey,
      aiFalseNeg: aiFalseNeg,
      aiFalsePos: aiFalsePos,
      aiVague: aiVague,
      aiOther: aiFeedbackOther,
      aiOtherContent: aiOtherContent,
    });
    // TODO: http put ai feedback json data
    console.log(bodyData);

    setAISubmitted(true);
    setAIFeedbackReceived(true);

    receivedTimer.current = setTimeout(() => {
      setAIFeedbackReceived(false);
    }, disappearAfter);
  };

  const cancelAiFeedbackCallback = () => {
    //reset all vars
    setAIFeedback('');
    setAISubmitted(false);
    setAIFalsePos(false);
    setAIFalseNeg(false);
    setAIVague(false);
    setAIFeedbackOther(false);
    setAIOtherContent('');
  };

  return (
    <div>
      <div className={style.aiFeedbackRow}>
        <BodyThreeText>{i18n.aiAssessmentFeedbackAsk()}</BodyThreeText>
        <label>
          <span
            className={
              aiFeedback === thumbsupval
                ? style.aiFeedbackThumbsUpChecked
                : style.aiFeedbackThumbsUp
            }
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
            onChange={() => {
              radioAiFeedbackCallback(thumbsupval);
            }}
            checked={aiFeedback === thumbsupval}
          />
        </label>

        <label>
          <span
            className={
              aiFeedback === thumbsdownval
                ? style.aiFeedbackThumbsDownChecked
                : style.aiFeedbackThumbsDown
            }
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
            onChange={() => {
              radioAiFeedbackCallback(thumbsdownval);
            }}
            checked={aiFeedback === thumbsdownval}
          />
        </label>
        {aiFeedbackReceived && (
          <EmText className={style.aiFeedbackReceived}>
            {i18n.aiFeedbackReceived()}
          </EmText>
        )}
      </div>

      {!aiSubmitted && aiFeedback === thumbsdownval && (
        <div>
          <Heading6>{i18n.aiFeedbackNegativeWhy()}</Heading6>
          <Checkbox
            label={i18n.aiFeedbackFalsePos()}
            size="s"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIFalsePos(!aiFalsePos);
            }}
            checked={aiFalsePos}
          />
          <Checkbox
            label={i18n.aiFeedbackFalseNeg()}
            size="s"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIFalseNeg(!aiFalseNeg);
            }}
            checked={aiFalseNeg}
          />
          <Checkbox
            label={i18n.aiFeedbackVague()}
            size="s"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIVague(!aiVague);
            }}
            checked={aiVague}
          />
          <Checkbox
            label={i18n.other()}
            size="s"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIFeedbackOther(!aiFeedbackOther);
            }}
            checked={aiFeedbackOther}
          />
          {aiFeedbackOther && (
            <div className={style.aiFeedbackOther}>
              <StrongText>{i18n.aiFeedbackOtherDetails()} </StrongText>
              <textarea
                className={style.aiFeedbackTextbox}
                onChange={e => {
                  setAIOtherContent(e.target.value);
                }}
                type="text"
              />
            </div>
          )}
          <div className={style.submitFeedbackRow}>
            <div className={style.submitFeedbackButtons}>
              <Button
                text={i18n.cancel()}
                color={Button.ButtonColor.neutralDark}
                onClick={cancelAiFeedbackCallback}
                className={style.submitToStudentButton}
              />
              <Button
                text={i18n.submit()}
                color={Button.ButtonColor.brandSecondaryDefault}
                onClick={submitAiFeedbackCallback}
                className={style.submitToStudentButton}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AiAssessmentFeedback.propTypes = {
  learningGoalKey: PropTypes.string,
  aiInfo: aiEvaluationShape,
};
