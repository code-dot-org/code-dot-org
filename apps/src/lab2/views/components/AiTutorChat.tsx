import {Button} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {
  ChatButtonClickHandler,
  ChatButtonData,
  ResponseSchemaSettings,
} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {useAiTutorModelParameters} from '@cdo/apps/aiTutor/hooks/useAiTutorModelParameters';
import {defaultPrompts, levelPrompts} from '@cdo/apps/aiTutor/suggestedPrompts';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './AiTutorChat.module.scss';

// Some pre-canned chat buttons.
const defaultChatButtonData: ChatButtonData[] = [
  ...levelPrompts,
  ...defaultPrompts,
] as const;

interface AiTutorChatProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPromptName?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
}

// A free chat with lab-supplied context added to each question.
const AiTutorChat: React.FunctionComponent<AiTutorChatProps> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled = false,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPromptName,
  aiTutorResponseSchemaSettings,
}) => {
  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPromptName,
    aiTutorJsonSchema: aiTutorResponseSchemaSettings?.jsonSchema,
  });

  const chatButtons = useMemo(() => {
    const chatButtonDataToUse = aiTutorChatButtonData || defaultChatButtonData;
    return chatButtonDataToUse.map(button => ({
      ChatButton: ({onClick}: {onClick: ChatButtonClickHandler}) => (
        <Button
          className={moduleStyles.chatButton}
          aria-label={button.label}
          iconLeft={
            {
              ...button.icon,
              className: classNames({
                [moduleStyles['icon']]: true,
                [moduleStyles[`icon-${button.icon?.iconName}`]]: button.icon,
              }),
            } as FontAwesomeV6IconProps
          }
          onClick={() => onClick(button.value, button.analyticsProperties)}
          text={button.label}
          size="s"
          type="secondary"
          color="black"
        />
      ),
      key: button.label,
    }));
  }, [aiTutorChatButtonData]);

  if (loading || !modelParameters) {
    return (
      <div className={moduleStyles.loading}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={moduleStyles.container}>
      <ChatWorkspace
        clientType={AiChatClientTypes.AI_TUTOR}
        modelParameters={modelParameters}
        chatButtons={chatButtons}
        hiddenContextCallback={hiddenContextCallback}
        multimodalEnabled={aiTutorMultimodalEnabled}
        levelName={levelName}
        channelId={channelId}
        hideModelChangeMessage={true}
        responseCallback={aiTutorResponseSchemaSettings?.responseCallback}
      />
    </div>
  );
};

export default AiTutorChat;
