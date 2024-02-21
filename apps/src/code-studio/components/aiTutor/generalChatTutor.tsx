import React from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';

// AI Tutor feature that allows students to ask general questions about the curriculum.
const GeneralChatTutor: React.FunctionComponent = () => {
  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace generalChat={true} />
    </div>
  );
};

export default GeneralChatTutor;
