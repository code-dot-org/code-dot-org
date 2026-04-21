import React, {useCallback, useEffect, useRef, useState} from 'react';

import {WaitingAnimation} from '@cdo/apps/aichat/views/WaitingAnimation';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {aiTutorModelId} from '@cdo/apps/lab2/ai/ai-tutor-model-id';
import AiTutorManager, {
  AiTutorMessageType,
} from '@cdo/apps/lab2/ai/AiTutorManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStylesFixed from '../AiTutorResponseFixed.module.scss';
import moduleStylesShrink from '../AiTutorResponseShrink.module.scss';

/** 
 * We aren't currently using this but keeping this code around for now in case we want to put
 * a similar hint UI somewhere else in the product in the near future.
 * 
 * added in PR #65737 
 * 
 * Usage looks like:
 * 
 *   const isAiTutorHintEnabled = queryParams('show-ai-tutor-hint') === 'true';
 *   const [askAiTutor, AiTutorResponse] = useAiTutor(
     isAiTutorHintEnabled,
     'hint'
   );
 
 * 
 */

export function useAiTutor(
  isEnabled: boolean,
  type: AiTutorMessageType,
  shrink = false
) {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const [loading, setLoading] = useState<boolean>();

  const managerRef = useRef<AiTutorManager | null>(
    isEnabled
      ? new AiTutorManager(aiTutorModelId, currentLevelId, scriptId, channelId)
      : null
  );

  // This could also be lifecycle hook? or get passed as function arguments?
  // Or return initialize(levelId, scriptId, channelId) and clearResponse() functions to the caller.
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    console.log(
      '🤖: creating AiTutorManager',
      currentLevelId,
      scriptId,
      channelId,
      aiTutorModelId
    );
    managerRef.current = new AiTutorManager(
      aiTutorModelId,
      currentLevelId,
      scriptId,
      channelId
    );
    setResponse(undefined);
  }, [isEnabled, currentLevelId, scriptId, channelId]);

  const [response, setResponse] = useState<string>();

  const askAiTutor = useCallback(
    async (question: string, questionExtra: string) => {
      if (!isEnabled) {
        return;
      }

      console.log('🤖: starting chat request', question);

      setLoading(true);
      const response = await managerRef.current?.askAiTutor(
        question,
        questionExtra,
        type
      );
      if (response) {
        setResponse(response[1].chatMessageText);
      }
      setLoading(false);
    },
    [isEnabled, type]
  );

  const AiTutorResponse = loading ? (
    <WaitingAnimation
      shouldDisplay={true}
      className={moduleStylesShrink.waitingAnimation}
    />
  ) : response ? (
    <ChatMessage
      text={response.trim()}
      role={Role.ASSISTANT}
      customStyles={shrink ? moduleStylesShrink : moduleStylesFixed}
    />
  ) : null;

  return [askAiTutor, AiTutorResponse] as const;
}
