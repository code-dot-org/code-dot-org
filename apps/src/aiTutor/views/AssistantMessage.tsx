import React, {useState} from 'react';
import classNames from 'classnames';

import {
  ChatCompletionMessage,
  AITutorInteractionStatus as Status,
} from '@cdo/apps/aiTutor/types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import Button from '@cdo/apps/templates/Button';

import {saveFeedback, FeedbackData} from '../interactionsApi';
import style from './chat-workspace.module.scss';

interface AssistantMessageProps {
  message: ChatCompletionMessage;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({message}) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackData>({
    thumbsUp: false,
    thumbsDown: false,
  });

  const handleFeedbackSubmission = async (
    thumbsUp: boolean,
    messageId?: number
  ) => {
    if (!messageId) {
      return;
    }

    const feedbackData = {
      thumbsUp: thumbsUp ? (feedbackState.thumbsUp ? null : true) : null,
      thumbsDown: thumbsUp ? null : feedbackState.thumbsDown ? null : true,
    };

    try {
      setFeedbackState(feedbackData);
      await saveFeedback(messageId, feedbackData);
    } catch (error) {
      setFeedbackState({thumbsUp: null, thumbsDown: null});
    }
  };

  const shouldRenderFeedbackButtons =
    message.id &&
    message.status !== Status.PROFANITY_VIOLATION &&
    message.status !== Status.PII_VIOLATION;
  console.log('message', message);
  console.log('message.status', message.status);
  return (
    <div className={style.assistantMessageContainer}>
      <Typography semanticTag="h5" visualAppearance="heading-xs">
        AI Tutor ({message.role})
      </Typography>
      <div className={style.assistantMessageButtonRow}>
        <div
          id={'chat-workspace-message-body'}
          className={classNames(style.message, style.assistantMessage)}
        >
          {message.chatMessageText}
        </div>
        {shouldRenderFeedbackButtons && (
          <>
            <Button
              onClick={() => handleFeedbackSubmission(true, message.id)}
              color={
                feedbackState.thumbsUp
                  ? Button.ButtonColor.green
                  : Button.ButtonColor.white
              }
              icon="thumbs-up"
              className={style.hamburgerMenuButton}
              disabled={false}
            />
            <Button
              onClick={() => handleFeedbackSubmission(false, message.id)}
              color={
                feedbackState.thumbsDown
                  ? Button.ButtonColor.red
                  : Button.ButtonColor.white
              }
              icon="thumbs-down"
              className={style.hamburgerMenuButton}
              disabled={false}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AssistantMessage;
