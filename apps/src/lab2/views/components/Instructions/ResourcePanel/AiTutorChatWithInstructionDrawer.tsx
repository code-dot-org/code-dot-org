import React from 'react';

import {ChatButtonData, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';

interface AiTutorChatWithInstructionDrawerProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPromptName?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
}
const AiTutorChatWithInstructionDrawer: React.FunctionComponent<
  AiTutorChatWithInstructionDrawerProps
> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPromptName,
  aiTutorResponseSchemaSettings,
}) => {
  return (
    <div>
      <p>This is where instructions drawer will be displayed.</p>
      <AiTutorChat
        hiddenContextCallback={hiddenContextCallback}
        aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
        levelName={levelName}
        channelId={channelId}
        aiTutorChatButtonData={aiTutorChatButtonData}
        aiTutorSystemPromptName={aiTutorSystemPromptName}
        aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
      />
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
