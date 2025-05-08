import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import moduleStyles from './AiTutorUI.module.scss';

interface AiTutorUIProps {
  response?: string;
}

const AiTutorUI: React.FunctionComponent<AiTutorUIProps> = ({response}) => {
  if (!response) {
    return null;
  }

  return (
    <ChatMessage
      text={response.trim()}
      role={Role.ASSISTANT}
      customStyles={moduleStyles}
    />
  );
};

export default AiTutorUI;
