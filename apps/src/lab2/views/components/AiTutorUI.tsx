import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import moduleStyles from './AiTutorUI.module.scss';
interface AiTutorUIProps {
  response?: string;
}

const AiTutorUI: React.FunctionComponent<AiTutorUIProps> = ({response}) => {
  if (!response) {
    return null;
  }

  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.botIconContainer}>
        <img
          src={aiBotOutlineIcon}
          alt={commonI18n.aiChatBotIconAlt()}
          className={moduleStyles.botIcon}
        />
      </div>
      <div className={moduleStyles.bubble}>{response.trim()}</div>
    </div>
  );
};

export default AiTutorUI;
