import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import i18n from '@cdo/locale';

import {saveFeedback, FeedbackData} from '../interactionsApi';

import style from './chat-workspace.module.scss';

interface AssistantMessageFeedbackDetailsProps {
  messageId: number | undefined;
  feedbackData: FeedbackData;
  onClose: () => void;
}

const AssistantMessageFeedbackDetails: React.FC<
  AssistantMessageFeedbackDetailsProps
> = ({feedbackData, messageId, onClose}) => {
  const [feedbackDetails, setFeedbackDetails] = useState<string>();

  const handleFeedbackSubmission = async (
    feedbackData: FeedbackData,
    feedbackDetails: string | undefined,
    messageId?: number
  ) => {
    if (!messageId) {
      return;
    }

    const feedback = {
      thumbsUp: feedbackData.thumbsUp,
      thumbsDown: feedbackData.thumbsDown,
      details: feedbackDetails,
    };

    try {
      await saveFeedback(messageId, feedback);
      setFeedbackDetails('');
      onClose();
    } catch (error) {
      console.log('Error saving feedback.');
    }
  };

  return !open ? null : (
    <div>
      <textarea
        onChange={e => setFeedbackDetails(e.target.value)}
        value={feedbackDetails}
        placeholder={i18n.aiFeedbackOtherDetails()}
        className={style.feedbackDetails}
      />
      <div>
        <span className={style.feedbackButton}>
          <Button
            onClick={() =>
              handleFeedbackSubmission(feedbackData, feedbackDetails, messageId)
            }
            color={buttonColors.purple}
            disabled={!feedbackDetails}
            text={i18n.aiFeedbackSubmit()}
            size="xs"
          />
        </span>
        <Button text={i18n.cancel()} onClick={onClose} size="xs" />
      </div>
    </div>
  );
};

export default AssistantMessageFeedbackDetails;
