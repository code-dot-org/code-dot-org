import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {Heading4, StrongText} from '@code-dot-org/component-library/typography';
import React, {useState, useRef} from 'react';

import {
  FeedbackData,
  logAiInteractionFeedback as logUserFeedbackOnStudentEvaluation,
} from '@cdo/apps/aiEvaluation/aiInteractionFeedbackApi';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from './summary.module.scss';

interface AiEvaluationFeedbackModalProps {
  feedbackData: FeedbackData;
  forStudentAiInteractionFeedback: boolean;
  closeModalHandler: () => void;
}

const AiEvaluationFeedbackModal: React.FC<AiEvaluationFeedbackModalProps> = ({
  feedbackData,
  forStudentAiInteractionFeedback,
  closeModalHandler,
}) => {
  const [aiTooHigh, setAiTooHigh] = useState(false);
  const [aiTooLow, setAiTooLow] = useState(false);
  const [aiProfanityFalsePositive, setAiFalsePositiveFlag] = useState(false);
  const [aiVague, setAiVague] = useState(false);
  const [aiFeedbackOther, setAiFeedbackOther] = useState(false);
  const [aiOtherContent, setAiOtherContent] = useState('');

  const reasonGivenRef = useRef(false);

  const sendFeedbackWithMetadata = async () => {
    const metadata = {
      tooHigh: aiTooHigh,
      tooLow: aiTooLow,
      profanityFalsePositive: aiProfanityFalsePositive,
      Vague: aiVague,
      feedbackOther: aiFeedbackOther,
      otherContent: aiOtherContent,
    };

    const combinedFeedbackData = {
      ...feedbackData,
      metadata,
    };
    logUserFeedbackOnStudentEvaluation(combinedFeedbackData);
  };

  const renderOptionsForStudentAiInteractionFeedback = () => {
    return (
      <>
        <Checkbox
          checked={aiTooLow}
          onChange={() => {
            setAiTooLow(!aiTooLow);
          }}
          name={'tooLow'}
          label={'Response was evaluated too low'}
        />

        <Checkbox
          checked={aiTooHigh}
          onChange={() => {
            setAiTooHigh(!aiTooHigh);
          }}
          name={'tooHigh'}
          label={'Response was evaluated too high'}
        />
        <Checkbox
          checked={aiProfanityFalsePositive}
          onChange={() => {
            setAiFalsePositiveFlag(!aiProfanityFalsePositive);
          }}
          name={'flagged'}
          label={'Response was incorrectly flagged'}
        />

        <Checkbox
          checked={aiVague}
          onChange={() => {
            setAiVague(!aiVague);
          }}
          name={'notHelpful'}
          label={'Not specific enough to be helpful'}
        />
        <Checkbox
          checked={aiFeedbackOther}
          onChange={() => {
            setAiFeedbackOther(!aiFeedbackOther);
          }}
          name={'other'}
          label={'Other'}
        />
        {aiFeedbackOther && (
          <div className={style.aiFeedbackOther}>
            <StrongText>{i18n.aiFeedbackOtherDetails()} </StrongText>
            <textarea
              onChange={e => {
                setAiOtherContent(e.target.value);
              }}
              className={style.aiFeedbackOtherTextArea}
              aria-label="AI feedback details"
            />
          </div>
        )}
      </>
    );
  };

  const handleSubmitButtonClick = () => {
    reasonGivenRef.current = true;
    sendFeedbackWithMetadata();
    closeModalHandler();
  };

  const onCloseHandler = () => {
    if (!reasonGivenRef.current) {
      logUserFeedbackOnStudentEvaluation(feedbackData);
      closeModalHandler();
    }
  };

  return (
    <AccessibleDialog onClose={onCloseHandler} closeOnClickBackdrop={true}>
      <div>
        <Heading4>
          Why is the AI analysis inaccurate? (Check all that apply)
        </Heading4>
        <hr />
        {/* TODO: add options for section-level feedback - TEACH-1769 */}
        {forStudentAiInteractionFeedback &&
          renderOptionsForStudentAiInteractionFeedback()}
        <hr />
        <div className={style.feedbackPortalButtonContainer}>
          <Button
            onClick={closeModalHandler}
            type="secondary"
            color="black"
            text={i18n.closeDialog()}
          />
          <Button
            onClick={handleSubmitButtonClick}
            type="primary"
            color="purple"
            text={i18n.aiFeedbackSubmit()}
          />
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default AiEvaluationFeedbackModal;
