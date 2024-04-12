import React, {useState} from 'react';
import classNames from 'classnames';

import {ChatCompletionMessage} from '@cdo/apps/aiTutor/types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import Button from '@cdo/apps/templates/Button';

import {saveFeedback} from '../interactionsApi';
import style from './chat-workspace.module.scss';

interface AssistantMessageProps {
  message: ChatCompletionMessage;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({message}) => {
  const [feedbackState, setFeedbackState] = useState({
    thumbsUp: false,
    thumbsDown: false,
  });

  const handleFeedbackSubmission = async (
    messageId: number,
    thumbsUp: boolean
  ) => {
    const feedbackData = {thumbsUp, thumbsDown: !thumbsUp};
    try {
      setFeedbackState(feedbackData);
      await saveFeedback(messageId, feedbackData);
    } catch (error) {
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
          <Button
            onClick={() => handleFeedbackSubmission(message.id, true)}
            color={Button.ButtonColor.white}
            icon="thumbs-up"
            className={style.hamburgerMenuButton}
            disabled={feedbackState.thumbsUp}
          />
          <Button
            onClick={() => handleFeedbackSubmission(message.id, false)}
            color={Button.ButtonColor.white}
            icon="thumbs-down"
            className={style.hamburgerMenuButton}
            disabled={feedbackState.thumbsDown}
          />
          <Button
            onClick={() => console.log('Ask AI Tutor')}
            color={Button.ButtonColor.white}
            icon="bars"
            className={style.hamburgerMenuButton}
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
