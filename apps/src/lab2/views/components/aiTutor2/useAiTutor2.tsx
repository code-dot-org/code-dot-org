import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  setAiCustomizationProperty,
  setUserMessageExtra,
  setChatButtons,
  setSavedAiCustomizationProperty,
} from '@cdo/apps/aichat/redux';
import {setSavedAiCustomizations} from '@cdo/apps/aichat/redux/slice';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {WaitingAnimation} from '@cdo/apps/aichat/views/WaitingAnimation';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiTutor2Manager, {
  AiTutor2MessageType,
} from '@cdo/apps/lab2/ai/AiTutor2Manager';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import moduleStylesFixed from '../AiTutor2ResponseFixed.module.scss';
import moduleStylesShrink from '../AiTutor2ResponseShrink.module.scss';

export function useAiTutor2(
  isEnabled: boolean,
  getFullPrompt: (question: string) => string,
  type: AiTutor2MessageType,
  shrink = false
) {
  const dispatch = useAppDispatch();
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const [loading, setLoading] = useState<boolean>();

  /*const currentAiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );*/

  const managerRef = useRef<AiTutor2Manager | null>(
    isEnabled ? new AiTutor2Manager(currentLevelId, scriptId, channelId) : null
  );

  // This could also be lifecycle hook? or get passed as function arguments?
  // Or return initialize(levelId, scriptId, channelId) and clearResponse() functions to the caller
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    console.log(
      '🤖: creating AiTutor2Manager',
      currentLevelId,
      scriptId,
      channelId
    );
    managerRef.current = new AiTutor2Manager(
      currentLevelId,
      scriptId,
      channelId
    );
    setResponse(undefined);
    dispatch(
      setSavedAiCustomizationProperty({
        property: 'systemPrompt',
        value:
          'You are an AI Computer Science Tutor that supports students through scaffolded learning, metacognitive reflection, and problem-solving strategies. Target the reading age of an American 7th grader. By default, when a student asks a question, you should respond with a clarifying question, a small hint, or a reflective nudge—to help them take the next step without solving the task for them. Do not give them the answer directly. If the student appears frustrated, you may include syntax or pseudocode. If the student explicitly asks for a HINT, provide a tip that nudges them forward to take the next step. If they ask for an EXAMPLE, give a short (1–3 line) conceptual code snippet from a different context that illustrates the relevant idea without solving the actual task. If they request DOCUMENTATION, share 1–3 concise and relevant references formatted with a clear keyword, short explanation and example code. Always work within the provided instructions, student code, and question, and tailor your support to encourage confidence, independence, and thoughtful programming.',
      })
    );
    dispatch(
      setSavedAiCustomizationProperty({
        property: 'selectedModelId',
        value: AiChatModelIds.CHATGPT,
      })
    );

    //dispatch(setSavedAiCustomizations(currentAiCustomizations));

    // selectedModelId: AiChatModelIds.CHATGPT
    dispatch(setUserMessageExtra(getFullPrompt));

    const buttons = [
      {
        label: 'example',
        value: 'Can you give me an example?',
      },
      {
        label: 'hint',
        value: 'Can you give me a hint?',
      },
      {
        label: 'doc',
        value: 'Can you give me some documentation?',
      },
    ];
    dispatch(setChatButtons(buttons));
  }, [isEnabled, currentLevelId, scriptId, channelId, dispatch, getFullPrompt]);

  const [response, setResponse] = useState<string>();

  const askAiTutor2 = useCallback(
    async (question: string) => {
      if (!isEnabled) {
        return;
      }

      console.log('🤖: starting chat request', question);

      setLoading(true);
      const response = await managerRef.current?.askAiTutor2(
        getFullPrompt(question),
        type
      );
      if (response) {
        setResponse(response[1].chatMessageText);
      }
      setLoading(false);
    },
    [isEnabled, getFullPrompt, type]
  );

  const AiTutor2Response = <ChatWorkspace onClear={() => {}} />;

  /*  const AiTutor2Response = loading ? (
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
  */

  return [askAiTutor2, AiTutor2Response] as const;
}
