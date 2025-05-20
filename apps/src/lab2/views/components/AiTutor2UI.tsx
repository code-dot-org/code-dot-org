import React, {useCallback, useEffect, useRef} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import AiTutor2Manager from '@cdo/apps/lab2/ai/AiTutor2Manager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './AiTutor2UI.module.scss';

interface AiTutor2UIProps {
  allowChat?: boolean;
  type: 'user' | 'hint';
  question?: string;
  getFullPrompt?: (question: string) => string;
}

const AiTutor2UI: React.FunctionComponent<AiTutor2UIProps> = ({
  allowChat,
  type,
  question,
  getFullPrompt,
}) => {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Remember the last question asked to avoid asking it multiple times, especially
  // as UI is re-rendered.
  const lastQuestion = useRef<string | undefined>(undefined);

  // This UI component will instantiate and use a AITutorManager.
  const aiTutor2Manager = useRef<AiTutor2Manager | null>(null);
  if (aiTutor2Manager.current === null) {
    aiTutor2Manager.current = new AiTutor2Manager(
      currentLevelId,
      scriptId,
      channelId
    );
  }

  // Store the most recent response.  Later we might store a longer history.
  const [response, setResponse] = React.useState<string | null>(null);

  // Ask the LLM something and get a response.
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

  // If this UI's optional submit button is clicked, then ask the LLM.
  const handleSubmit = useCallback(
    (userMessage: string) => {
      askAiTutor2(userMessage);
    },
    [askAiTutor2]
  );

  return (
    <div className={moduleStyles.container}>
      {response && (
        <ChatMessage
          text={response?.trim()}
          role={Role.ASSISTANT}
          customStyles={moduleStyles}
        />
      )}
      {allowChat && (
        <div className={moduleStyles.userMessageContainer}>
          <UserMessageEditor
            onSubmit={handleSubmit}
            disabled={false}
            customPlaceholder="Ask A.I. a question..."
          />
        </div>
      )}
    </div>
  );
};

export default AiTutor2UI;
