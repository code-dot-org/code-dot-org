import React, {useState} from 'react';
import classNames from 'classnames';

import {ChatCompletionMessage} from '@cdo/apps/aiTutor/types';
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
      thumbsUp: feedbackState.thumbsUp === thumbsUp ? null : thumbsUp,
      thumbsDown: feedbackState.thumbsDown === !thumbsUp ? null : !thumbsUp,
    };

    try {
      setFeedbackState(feedbackData);
      await saveFeedback(messageId, feedbackData);
    } catch (error) {
      console.log('Failed to save feedback: ', error);
      setFeedbackState({thumbsUp: false, thumbsDown: false});
    }
  };

  return (
    <div id={`chat-message-id-${message.id}`}>
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
          {message.id && (
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
    </div>
  );
};

export default AssistantMessage;
