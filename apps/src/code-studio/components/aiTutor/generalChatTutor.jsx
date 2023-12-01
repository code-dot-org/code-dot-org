import React from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';
// import AichatView from '@cdo/apps/aichat/views/AichatView';

// AI Tutor feature that allows students to ask general questions about the curriculum.
const GeneralChatTutor = () => {
  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace />
    </div>
  );
};

export default GeneralChatTutor;
