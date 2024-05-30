import React, {useState} from 'react';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';

import {saveFeedback, FeedbackData} from '../interactionsApi';
import style from './chat-workspace.module.scss';

interface AssistantMessageProps {
  messageId: number | undefined;
}

const AssistantMessageFeedback: React.FC<AssistantMessageProps> = ({messageId}) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackData>({
    thumbsUp: false,
    thumbsDown: false,
    inappropriate: false,
  });

  const FeedbackType = {
    thumbsUp: 'thumbsUp',
    thumbsDown: 'thumbsDown',
    inappropriate: 'inappropriate'
  };

  const handleFeedbackSubmission = async (
    // TODO: Erin figure out how to make this work with the 3rd option for clicking/unclicking
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
      inappropriate: 
    };

    try {
      setFeedbackState(feedbackData);
      await saveFeedback(messageId, feedbackData);
    } catch (error) {
      setFeedbackState({thumbsUp: null, thumbsDown: null});
    }
  };

  return (
        <>
            <Button
                className={style.hamburgerMenuButton}
                color={buttonColors.black}
                disabled={false}
                icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
                isIconOnly={true}
                onClick={() => handleFeedbackSubmission(FeedbackType.thumbsUp, messageId)}
                size="xs"
                type={feedbackState.thumbsUp ? 'primary' : 'tertiary'}
            />
            <Button
                className={style.hamburgerMenuButton}
                color={buttonColors.black}
                disabled={false}
                icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
                isIconOnly={true}
                onClick={() => handleFeedbackSubmission(false, messageId)}
                size="xs"
                type={feedbackState.thumbsDown ? 'primary' : 'tertiary'}
            />
            <Button
                className={style.hamburgerMenuButton}
                color={buttonColors.black}
                disabled={false}
                icon={{iconName: 'flag-pennant', iconStyle: 'regular'}}
                isIconOnly={true}
                onClick={() => handleFeedbackSubmission(false, messageId)}
                size="xs"
                type={feedbackState.inappropriate ? 'primary' : 'tertiary'}
            />
        </>
    )}

export default AssistantMessageFeedback;