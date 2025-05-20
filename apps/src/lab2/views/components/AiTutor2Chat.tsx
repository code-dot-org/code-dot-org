import React, {useCallback} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';

import AiTutor2Response from './AiTutor2Response';

import moduleStyles from './AiTutor2Chat.module.scss';

interface AiTutor2ChatProps {
  type: 'user' | 'hint';
  getFullPrompt?: (question: string) => string;
}

// A free chat with user-initiated input and subsequent response from AITutor2.
const AiTutor2Chat: React.FunctionComponent<AiTutor2ChatProps> = ({
  type,
  getFullPrompt,
}) => {
  const [question, setQuestion] = React.useState<string | undefined>(undefined);

  // If the submit button is clicked, then ask AITutor2.
  const handleSubmit = useCallback((userMessage: string) => {
    setQuestion(userMessage);
  }, []);

  return (
    <div className={moduleStyles.container}>
      <AiTutor2Response
        type={type}
        question={question}
        getFullPrompt={getFullPrompt}
        shrink={true}
      />
      <div className={moduleStyles.userMessageContainer}>
        <UserMessageEditor
          onSubmit={handleSubmit}
          disabled={false}
          customPlaceholder="Ask A.I. a question..."
        />
      </div>
    </div>
  );
};

export default AiTutor2Chat;
