import React from 'react';
import styles from './aichat.module.scss';
import {openaiCompletion} from '@cdo/apps/util/openai';
import {ChatMessage} from '../redux/aichatRedux';

/**
 * Renders a simple AI chat.
 */

interface AichatProps {
  children: React.ReactNode;
}

const Aichat: React.FunctionComponent<AichatProps> = ({children}) => {
  const finalPrompt =
    'You are a chatbot for a middle school classroom where they can chat with a historical figure. You must answer only questions about the formation of America and the founding fathers. You will act as George Washington; every question you answer must be from his perspective. Wait for the student to ask a question before responding.';

  const messages: ChatMessage[] = [
    {
      content: 'Where were you born?',
      role: 'user',
    },
  ];

  const formatForOpenAI = (messages: ChatMessage[]) => {
    const payload = [{content: finalPrompt, role: 'system'}];
    messages.forEach(message => {
      payload.push(message);
    });
    return payload;
  };
  openaiCompletion(formatForOpenAI(messages));

  return (
    <div id="aichat-container" className={styles.container}>
      {children}
    </div>
  );
};

export default Aichat;
