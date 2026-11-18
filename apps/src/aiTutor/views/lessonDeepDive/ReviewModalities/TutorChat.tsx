import React, {FC, useCallback, useRef} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

interface TutorChatProps {
  systemPrompt: string;
  lessonId: number;
}

const TutorChat: FC<TutorChatProps> = ({systemPrompt, lessonId}) => {
  const sentCountRef = useRef(0);
  // The chat editor calls this once per message the student sends.
  const hiddenContextCallback = useCallback(async () => {
    sentCountRef.current += 1;
    analyticsReporter.sendEvent(EVENTS.TUTOR_PLUS_CHAT_MESSAGE_SENT, {
      lesson_id: lessonId,
      message_index: sentCountRef.current,
    });
    return '';
  }, [lessonId]);

  return (
    <AiTutorChat
      hiddenContextCallback={hiddenContextCallback}
      aiTutorSystemPrompt={systemPrompt}
      aiTutorChatButtonData={[]}
      isLessonDeepDive={true}
      levelId={null}
      lessonId={lessonId}
    />
  );
};

export default TutorChat;
