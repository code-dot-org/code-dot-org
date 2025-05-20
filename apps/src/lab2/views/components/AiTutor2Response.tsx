import React, {useCallback, useEffect, useRef} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiTutor2Manager from '@cdo/apps/lab2/ai/AiTutor2Manager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './AiTutor2Response.module.scss';

interface AiTutor2ResponseProps {
  type: 'user' | 'hint';
  question?: string;
  getFullPrompt?: (question: string) => string;
}

// A single response from the AITutor2, answering the provided question.
const AiTutor2Response: React.FunctionComponent<AiTutor2ResponseProps> = ({
  type,
  question,
  getFullPrompt,
}) => {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Remember the last level ID used to instantiate the AiTutor2Manager.
  const lastLevelId = useRef<string | null>(null);

  // Remember the last question asked to avoid asking it multiple times, especially
  // as UI is re-rendered.
  const lastQuestion = useRef<string | undefined>(undefined);

  // This UI component will instantiate and use an AITutorManager.
  const aiTutor2Manager = useRef<AiTutor2Manager | null>(null);
  if (
    aiTutor2Manager.current === null ||
    currentLevelId !== lastLevelId.current
  ) {
    console.log('🤖: creating AiTutor2Manager', currentLevelId);

    aiTutor2Manager.current = new AiTutor2Manager(
      currentLevelId,
      scriptId,
      channelId
    );

    lastLevelId.current = currentLevelId;
  }

  // Store the most recent response.  Later we might store a longer history.
  const [response, setResponse] = React.useState<string | null>(null);

  // Ask the AiTutor2 something and get a response.
  const askAiTutor2 = useCallback(
    async (message: string) => {
      const fullQuestion = getFullPrompt ? getFullPrompt(message) : message;

      if (message !== lastQuestion.current) {
        console.log('🤖: starting chat request', question);
        lastQuestion.current = message;
        setResponse(null);

        const messages = await aiTutor2Manager.current?.askAiTutor2(
          fullQuestion,
          type
        );

        if (messages && messages.length > 1) {
          setResponse(messages[1].chatMessageText);
        }
      } else {
        console.log(' 🤖: skipping previously asked question');
      }
    },
    [getFullPrompt, question, type]
  );

  // If the incoming question changes, then ask it.
  useEffect(() => {
    if (question) {
      askAiTutor2(question);
    } else {
      if (type === 'hint') {
        setResponse(null);
      }

      lastQuestion.current = question;
    }
  }, [question, type, askAiTutor2]);

  if (!response) {
    return null;
  }

  return (
    <ChatMessage
      text={response?.trim()}
      role={Role.ASSISTANT}
      customStyles={moduleStyles}
    />
  );
};

export default AiTutor2Response;
