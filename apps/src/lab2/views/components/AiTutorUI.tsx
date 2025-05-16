import React, {useCallback, useEffect, useRef} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import AiTutorManager from '@cdo/apps/lab2/ai/AiTutorManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './AiTutorUI.module.scss';

interface AiTutorUIProps {
  allowChat?: boolean;
  type: 'user' | 'hint';
  question?: string;
  getFullQuestionFromQuestion?: (
    question: string,
    type: 'user' | 'hint'
  ) => string;
}

const AiTutorUI: React.FunctionComponent<AiTutorUIProps> = ({
  allowChat,
  type,
  question,
  getFullQuestionFromQuestion,
}) => {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Remember the last question asked to avoid asking it multiple times, especially
  // as UI is re-rendered.
  const lastQuestion = useRef<string | undefined>(undefined);

  // This UI component will instantiate and use a AITutorManager.
  const aiTutorManager = useRef<AiTutorManager | null>(null);
  if (aiTutorManager.current === null) {
    aiTutorManager.current = new AiTutorManager(
      currentLevelId,
      scriptId,
      channelId
    );
  }

  // Store the most recent response.  Later we might store a longer history.
  const [response, setResponse] = React.useState<string | null>(null);

  // Ask the LLM something and get a response.
  const askAiTutor = useCallback(
    async (message: string) => {
      const fullQuestion = getFullQuestionFromQuestion
        ? getFullQuestionFromQuestion(message, type)
        : message;

      if (message !== lastQuestion.current) {
        console.log('🤖: starting chat request', question, type);
        lastQuestion.current = message;
        setResponse(null);

        const messages = await aiTutorManager.current?.askAiTutor(
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
    [getFullQuestionFromQuestion, question, type]
  );

  // If the incoming question changes, then ask it.
  useEffect(() => {
    if (question) {
      askAiTutor(question);
    } else {
      lastQuestion.current = question;
    }
  }, [question, askAiTutor]);

  // If this UI's optional submit button is clicked, then ask the LLM.
  const handleSubmit = useCallback(
    (userMessage: string) => {
      askAiTutor(userMessage);
    },
    [askAiTutor]
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

export default AiTutorUI;
