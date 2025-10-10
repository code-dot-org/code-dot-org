import {Button} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {ChatButtonClickHandler, ChatButtonData} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {useAiTutorModelParameters} from '@cdo/apps/aiTutor/hooks/useAiTutorModelParameters';
import {defaultPrompts, levelPrompts} from '@cdo/apps/aiTutor/suggestedPrompts';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './AiTutor2Chat.module.scss';

// Some pre-canned chat buttons.
const defaultChatButtonData: ChatButtonData[] = [
  ...levelPrompts,
  ...defaultPrompts,
] as const;

interface AiTutor2ChatProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPromptName?: string;
}

// A free chat with lab-supplied context added to each question.
const AiTutor2Chat: React.FunctionComponent<AiTutor2ChatProps> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled = false,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPromptName,
}) => {
  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPromptName,
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
      />
    </div>
  );
};

export default AiTutor2Chat;
