import {TutorFeedbackProps} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useEffect, useRef, useState} from 'react';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage} from '@cdo/apps/aichat/types';
import WaitingAnimation from '@cdo/apps/aichat/views/WaitingAnimation';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createUuid} from '@cdo/apps/utils';
import {
  AiChatClientTypes,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {useAiTutorModelParameters} from '../../../hooks/useAiTutorModelParameters';

const TutorFeedback: FC<TutorFeedbackProps> = ({
  systemPrompt,
  userMessage,
  lessonId,
  onFeedback,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const requested = useRef(false);

  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPrompt: systemPrompt,
    aiTutorJsonSchema: undefined,
  });

  useEffect(() => {
    if (!modelParameters || loading || requested.current) return;
    requested.current = true;
    const msg: PendingChatMessage & {updateId: string} = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: userMessage,
      timestamp: Date.now(),
      updateId: createUuid(),
    };
    setFeedbackLoading(true);
    postAichatCompletionMessage(
      msg,
      [],
      {...modelParameters},
      {
        clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
        currentLevelId: null,
        scriptId: null,
        channelId: undefined,
        lessonId,
      }
    )
      .then(messages => {
        const text = messages[messages.length - 1].chatMessageText;
        setFeedback(text);
        onFeedback(text);
      })
      .catch(error => console.log(error))
      .finally(() => setFeedbackLoading(false));
  }, [modelParameters, loading, userMessage, lessonId, onFeedback]);

  return (
    <>
      <WaitingAnimation shouldDisplay={feedbackLoading} />
      {feedback && !feedbackLoading && (
        <SafeMarkdown unwrapped localized={false} markdown={feedback} />
      )}
    </>
  );
};

export default TutorFeedback;
