import React, {useState} from 'react';
import classNames from 'classnames';

import {
  ChatCompletionMessage,
  AITutorInteractionStatus as Status,
} from '@cdo/apps/aiTutor/types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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

    // This logic allows the user to "ungive" feedback by clicking the same button again
    // If the user "ungives" all feedback, a row with null values will persist in the database
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
    message.status !== Status.ERROR &&
    message.status !== Status.PROFANITY_VIOLATION &&
    message.status !== Status.PII_VIOLATION;

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
          <SafeMarkdown
            markdown={message.chatMessageText}
            className={style.aiTutorMarkdown}
          />
        </div>
        {shouldRenderFeedbackButtons && (
          <>
            <Button
              className={style.hamburgerMenuButton}
              color={buttonColors.black}
              disabled={false}
              icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
              isIconOnly={true}
              onClick={() => handleFeedbackSubmission(true, message.id)}
              size="xs"
              type={feedbackState.thumbsUp ? 'primary' : 'tertiary'}
            />
            <Button
              className={style.hamburgerMenuButton}
              color={buttonColors.black}
              disabled={false}
              icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
              isIconOnly={true}
              onClick={() => handleFeedbackSubmission(false, message.id)}
              size="xs"
              type={feedbackState.thumbsDown ? 'primary' : 'tertiary'}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AssistantMessage;
