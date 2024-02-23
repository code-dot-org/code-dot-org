import React from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';

// AI Tutor feature that allows students to ask for help with compilation errors, 
// test failures or general questions about the curriculum.

const AITutor: React.FunctionComponent = () => { 
  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace />
    </div>
  );
};

export default AITutor;
