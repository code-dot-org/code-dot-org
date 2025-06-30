import React, {useCallback, useEffect, useRef, useState} from 'react';

import {WaitingAnimation} from '@cdo/apps/aichat/views/WaitingAnimation';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiTutor2Manager, {
  AiTutor2MessageType,
} from '@cdo/apps/lab2/ai/AiTutor2Manager';
import {aiTutorModelId} from '@cdo/apps/lab2/ai/AiTutorModelId';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStylesFixed from '../AiTutor2ResponseFixed.module.scss';
import moduleStylesShrink from '../AiTutor2ResponseShrink.module.scss';

export function useAiTutor2(
  isEnabled: boolean,
  type: AiTutor2MessageType,
  shrink = false
) {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const [loading, setLoading] = useState<boolean>();

  const managerRef = useRef<AiTutor2Manager | null>(
    isEnabled
      ? new AiTutor2Manager(aiTutorModelId, currentLevelId, scriptId, channelId)
      : null
  );

  // This could also be lifecycle hook? or get passed as function arguments?
  // Or return initialize(levelId, scriptId, channelId) and clearResponse() functions to the caller.
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    console.log(
      '🤖: creating AiTutor2Manager',
      currentLevelId,
      scriptId,
      channelId,
      aiTutorModelId
    );
    managerRef.current = new AiTutor2Manager(
      aiTutorModelId,
      currentLevelId,
      scriptId,
      channelId
    );
    setResponse(undefined);
  }, [isEnabled, currentLevelId, scriptId, channelId]);

  const [response, setResponse] = useState<string>();

  const askAiTutor2 = useCallback(
    async (question: string, questionExtra: string) => {
      if (!isEnabled) {
        return;
      }

      console.log('🤖: starting chat request', question);

      setLoading(true);
      const response = await managerRef.current?.askAiTutor2(
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

  const AiTutor2Response = loading ? (
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

  return [askAiTutor2, AiTutor2Response] as const;
}
