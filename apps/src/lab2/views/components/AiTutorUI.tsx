//import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';

import moduleStyles from './AiTutorUI.module.scss';

interface AiTutorUIProps {
  response?: string;
  askAiTutor?: (question: string, questionType: 'user' | 'hint') => void;
}

const AiTutorUI: React.FunctionComponent<AiTutorUIProps> = ({
  response,
  askAiTutor,
}) => {
  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (askAiTutor) {
        askAiTutor(userMessage, 'user');
      }
    },
    [askAiTutor]
  );

  return (
    <div>
      {response && (
        <ChatMessage
          text={response?.trim()}
          role={Role.ASSISTANT}
          customStyles={moduleStyles}
        />
      )}
      <UserMessageEditor
        onSubmit={handleSubmit}
        disabled={false}
        customPlaceholder="Ask A.I. a question..."
      />
    </div>
  );
};

export default AiTutorUI;
