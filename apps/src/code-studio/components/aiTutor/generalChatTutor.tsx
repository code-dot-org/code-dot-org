import React from 'react';
import PropTypes from 'prop-types';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';

// AI Tutor feature that allows students to ask general questions about the curriculum.
const GeneralChatTutor = ({levelId, isProjectBacked, scriptId}) => {
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

GeneralChatTutor.propTypes = {
  levelId: PropTypes.number,
  scriptId: PropTypes.number,
  isProjectBacked: PropTypes.bool,
};
