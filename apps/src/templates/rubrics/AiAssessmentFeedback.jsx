import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {
  BodyFourText,
  StrongText,
  EmText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import AiAssessmentFeedbackContext, {
  NO_FEEDBACK,
  THUMBS_DOWN,
} from './AiAssessmentFeedbackContext';
import {aiEvaluationShape} from './rubricShapes';

import style from './rubrics.module.scss';

async function updateAiFeedback(values, aiFeedbackId) {
  const baseUrl = '/learning_goal_ai_evaluation_feedbacks';
  await HttpClient.put(
    `${baseUrl}/${aiFeedbackId}`,
    JSON.stringify(values),
    true,
    {'Content-Type': 'application/json'}
  );
}

export default function AiAssessmentFeedback({aiEvalInfo, aiFeedbackId}) {
  const {aiFeedback, setAiFeedback} = useContext(AiAssessmentFeedbackContext);
  const [aiSubmitted, setAISubmitted] = useState(false);
  const [aiFalsePos, setAIFalsePos] = useState(false);
  const [aiFalseNeg, setAIFalseNeg] = useState(false);
  const [aiVague, setAIVague] = useState(false);
  const [aiFeedbackOther, setAIFeedbackOther] = useState(false);
  const [aiOtherContent, setAIOtherContent] = useState('');
  const [aiFeedbackReceived, setAIFeedbackReceived] = useState(false);

  const submitAiFeedbackCallback = async () => {
    const bodyData = {
      learningGoalAiEvaluationId: aiEvalInfo.id,
      aiFeedbackApproval: aiFeedback,
      falsePositive: aiFalsePos,
      falseNegative: aiFalseNeg,
      // 'Vague' is capitalized to avoid a ForbiddenAttributes error
      // error cause is unknown
      Vague: aiVague,
      feedbackOther: aiFeedbackOther,
      otherContent: aiOtherContent,
    };

    await updateAiFeedback(bodyData, aiFeedbackId);

    setAISubmitted(true);
    setAIFeedbackReceived(true);
  };

  const cancelAiFeedbackCallback = () => {
    //reset all vars
    setAISubmitted(false);
    setAIFalsePos(false);
    setAIFalseNeg(false);
    setAIVague(false);
    setAIFeedbackOther(false);
    setAIOtherContent('');

    // Clear feedback
    setAiFeedback(NO_FEEDBACK);
  };

  return (
    <div>
      {aiFeedbackReceived && (
        <EmText className={style.aiFeedbackReceived}>
          <FontAwesome icon="circle-check" />
          {i18n.aiFeedbackReceived()}
        </EmText>
      )}
      {!aiSubmitted && aiFeedback === THUMBS_DOWN && aiFeedbackId && (
        <div className={style.aiAssessmentFeedback}>
          <BodyFourText>
            <StrongText>{i18n.aiFeedbackNegativeWhy()}</StrongText>
          </BodyFourText>
          <Checkbox
            label={i18n.aiFeedbackFalsePos()}
            size="xs"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIFalsePos(!aiFalsePos);
            }}
            checked={aiFalsePos}
          />
          <Checkbox
            label={i18n.aiFeedbackFalseNeg()}
            size="xs"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIFalseNeg(!aiFalseNeg);
            }}
            checked={aiFalseNeg}
          />
          <Checkbox
            label={i18n.aiFeedbackVague()}
            size="xs"
            name="aiNegativeFeedbackGroup"
            onChange={() => {
              setAIVague(!aiVague);
            }}
            checked={aiVague}
          />
          <Checkbox
            label={i18n.other()}
            size="xs"
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
                text={i18n.aiFeedbackSubmit()}
                color={Button.ButtonColor.brandSecondaryDefault}
                onClick={submitAiFeedbackCallback}
                className={style.submitToStudentButton}
              />
              <Button
                text={i18n.cancel()}
                color={Button.ButtonColor.neutralDark}
                onClick={cancelAiFeedbackCallback}
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
  aiEvalInfo: aiEvaluationShape,
  aiFeedbackId: PropTypes.number,
};
