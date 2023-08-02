import React from 'react';
import moduleStyles from './aichat.module.scss';
import ChatWorkspace from './ChatWorkspace';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <ChatWorkspace />
    </div>
  );
};

export default AichatView;
