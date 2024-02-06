import React from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';

// AI Tutor feature that allows students to ask general questions about the curriculum.
const GeneralChatTutor = (
  levelId: number,
  isProjectBacked: boolean,
  scriptId: number
) => {
  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace
        levelId={levelId}
        isProjectBacked={isProjectBacked}
        scriptId={scriptId}
      />
    </div>
  );
};

export default GeneralChatTutor;
