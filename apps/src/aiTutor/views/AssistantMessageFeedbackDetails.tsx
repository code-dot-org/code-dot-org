import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';

import {saveFeedback, FeedbackData} from '../interactionsApi';

interface AssistantMessageFeedbackDetailsProps {
  messageId: number | undefined;
  feedbackData: FeedbackData;
}

const AssistantMessageFeedbackDetails: React.FC<
  AssistantMessageFeedbackDetailsProps
> = ({feedbackData, messageId}) => {
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
    } catch (error) {
      console.log('Error saving feedback.');
    }
  };

  return (
    <>
      <textarea
        placeholder={'Tell us more.'}
        onChange={e => setFeedbackDetails(e.target.value)}
        value={feedbackDetails}
      />

      <Button
        onClick={() =>
          handleFeedbackSubmission(feedbackData, feedbackDetails, messageId)
        }
        color={buttonColors.purple}
        disabled={!feedbackDetails}
        text={'Submit'}
      />
    </>
  );
};

export default AssistantMessageFeedbackDetails;
