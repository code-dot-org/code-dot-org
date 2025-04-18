import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {Heading4, StrongText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from './summary.module.scss';

interface AiEvaluationFeedbackModalProps {
  forStudentAiInteractionFeedback: boolean;
  closeModalHandler: () => void;
}

const AiEvaluationFeedbackModal: React.FC<AiEvaluationFeedbackModalProps> = ({
  forStudentAiInteractionFeedback,
  closeModalHandler,
}) => {
  const [aiTooHigh, setAiTooHigh] = useState(false);
  const [aiTooLow, setAiTooLow] = useState(false);
  const [aiFlagged, setAiFlagged] = useState(false);
  const [aiVague, setAiVague] = useState(false);
  const [aiFeedbackOther, setAiFeedbackOther] = useState(false);
  const [aiOtherContent, setAiOtherContent] = useState('');

  const handleSendingFeedback = async () => {
    const bodyData = {
      tooHigh: aiTooHigh,
      tooLow: aiTooLow,
      flaggedIncorrectly: aiFlagged,
      // 'Vague' is capitalized to avoid a ForbiddenAttributes error
      // error cause is unknown
      Vague: aiVague,
      feedbackOther: aiFeedbackOther,
      otherContent: aiOtherContent,
    };

    // await updateAiFeedback(bodyData, aiFeedbackId);

    // setAISubmitted(true);
    // setAIFeedbackReceived(true);
    console.log('Feedback prepped:', bodyData);
    closeModalHandler();
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
          checked={aiFlagged}
          onChange={() => {
            setAiFlagged(!aiFlagged);
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
              //   className={style.aiFeedbackTextbox}
              onChange={e => {
                setAiOtherContent(e.target.value);
              }}
              // eslint-disable-next-line react/forbid-dom-props
              data-testid="ai-frq-feedback-textarea"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <AccessibleDialog onClose={closeModalHandler} closeOnClickBackdrop={true}>
      <div>
        <Heading4>
          Why is the AI analysis inaccurate? (Check all that apply)
        </Heading4>
        <hr />
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
            onClick={handleSendingFeedback}
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
