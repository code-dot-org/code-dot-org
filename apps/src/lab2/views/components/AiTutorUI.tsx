import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useRef, useEffect, useState, useCallback} from 'react';

import AiTutorManager from '@cdo/apps/lab2/ai/AiTutorManager';
import {commonI18n} from '@cdo/apps/types/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import moduleStyles from './AiTutorUI.module.scss';
interface AiTutorUIProps {
  response?: string;
}

const AiTutorUI: React.FunctionComponent<AiTutorUIProps> = ({response}) => {
  /*const aiTutor = useRef<AiTutorManager | null>(null);

  const [response, setResponse] = useState<string | undefined>(undefined);
  */

  /*
  if (aiTutor.current === null) {
    aiTutor.current = new AiTutorManager();
    //CodebridgeRegistry.getInstance().setAiTutor(aiTutor.current);
  }

  const onMount = useCallback(async () => {
    const messages = await aiTutor.current?.askAiTutor(
      'hi there, are you there?'
    );
    if (messages && messages.length > 1) {
      setResponse(messages[1].chatMessageText);
    }
  }, [aiTutor]);

  useEffect(() => {
    onMount();
  }, [onMount]);
  */

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
