import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

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
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const level = useAppSelector(state => state.aiTutor.level);

  const handleIconClick = (thumbsUp: boolean, thumbsDown: boolean) => {
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_FEEDBACK_SUBMITTED, {
      levelId: level?.id,
      levelType: level?.type,
      progressionType: level?.progressionType,
      chatMessageId: messageId,
      thumbsUp: thumbsUp,
      thumbsDown: thumbsDown,
    });
    setFeedbackState({thumbsUp: thumbsUp, thumbsDown: thumbsDown});
    setDetailsOpen(thumbsUp || thumbsDown);
  };

  return (
    <div className={style.feedbackIcons}>
      {i18n.aiFeedbackQuestion()}
      <Button
        color={buttonColors.black}
        disabled={false}
        icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => handleIconClick(true, false)}
        size="xs"
        type={feedbackState.thumbsUp ? 'primary' : 'tertiary'}
      />
      <Button
        color={buttonColors.black}
        disabled={false}
        icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => handleIconClick(false, true)}
        size="xs"
        type={feedbackState.thumbsDown ? 'primary' : 'tertiary'}
      />
      {detailsOpen && (
        <AssistantMessageFeedbackDetails
          feedbackData={feedbackState}
          messageId={messageId}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default AssistantMessageFeedback;
