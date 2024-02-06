import React from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';

// AI Tutor feature that allows students to ask general questions about the curriculum.
const GeneralChatTutor: React.FunctionComponent<GeneralChatTutorProps> = ({
  levelId,
  isProjectBacked,
  scriptId,
}) => {
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

interface GeneralChatTutorProps {
  levelId: number;
  isProjectBacked: boolean;
  scriptId: number;
}

export default GeneralChatTutor;
