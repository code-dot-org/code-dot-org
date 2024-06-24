import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';

import {FeedbackData} from '../interactionsApi';

import AssistantMessageFeedbackDetails from './AssistantMessageFeedbackDetails';

import style from './chat-workspace.module.scss';

interface AssistantMessageProps {
  messageId: number | undefined;
}

const AssistantMessageFeedback: React.FC<AssistantMessageProps> = ({
  messageId,
}) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackData>({
    thumbsUp: false,
    thumbsDown: false,
  });

  return (
    <div className={style.feedbackIcons}>
      Was this helpful?
      <Button
        color={buttonColors.black}
        disabled={false}
        icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => setFeedbackState({thumbsUp: true, thumbsDown: false})}
        size="xs"
        type={feedbackState.thumbsUp ? 'primary' : 'tertiary'}
      />
      <Button
        color={buttonColors.black}
        disabled={false}
        icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => setFeedbackState({thumbsUp: false, thumbsDown: true})}
        size="xs"
        type={feedbackState.thumbsDown ? 'primary' : 'tertiary'}
      />
      {(feedbackState.thumbsUp || feedbackState.thumbsDown) && (
        <AssistantMessageFeedbackDetails
          feedbackData={feedbackState}
          messageId={messageId}
        />
      )}
    </div>
  );
};

export default AssistantMessageFeedback;
