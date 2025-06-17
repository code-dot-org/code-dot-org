import Button from '@code-dot-org/component-library/button';
import React, {useCallback} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {AiTutor2MessageType} from '@cdo/apps/lab2/ai/AiTutor2Manager';

import {useAiTutor2} from './aiTutor2/useAiTutor2';

import moduleStyles from './AiTutor2Chat.module.scss';

interface AiTutor2ChatProps {
  type: AiTutor2MessageType;
  getFullPrompt: (question: string) => string;
}

// A free chat with user-initiated input and subsequent response from AITutor2.
const AiTutor2Chat: React.FunctionComponent<AiTutor2ChatProps> = ({
  type,
  getFullPrompt,
}) => {
  const [askAiTutor, AiTutorResponseView] = useAiTutor2(
    true,
    getFullPrompt,
    type,
    true
  );

  const buttons = [
    {
      text: 'example',
      question: 'Can you give me an example?',
    },
    {
      text: 'hint',
      question: 'Can you give me a hint?',
    },
    {
      text: 'doc',
      question: 'Can you give me some documentation?',
    },
  ];

  // If the submit button is clicked, then ask the LLM.
  const handleSubmit = useCallback(
    (userMessage: string) => {
      askAiTutor(userMessage);
    },
    [askAiTutor]
  );

  return (
    <div className={moduleStyles.container}>
      {AiTutorResponseView}
      <div className={moduleStyles.userMessageContainer}>
        <div className={moduleStyles.buttonsContainer}>
          {buttons.map(button => (
            <Button
              key={button.text}
              aria-label={button.text}
              id="button-hint"
              onClick={() => handleSubmit(button.question)}
              text={button.text}
              size="s"
              color="white"
            />
          ))}
        </div>
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
