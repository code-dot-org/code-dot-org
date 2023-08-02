import React from 'react';
// import ChatWorkspace from './ChatWorkspace';
import moduleStyles from './aichat.module.scss';
import classNames from 'classnames';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import aichatI18n from '../locale';
import ChatWorkspace from './ChatWorkspace';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <ChatWorkspace />
    </div>
  );
};

export default AichatView;
