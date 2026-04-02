import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {
  ChatButtonClickHandler,
  ChatButtonData,
  ResponseSchemaSettings,
} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import AiTutorVersionActions from '@cdo/apps/aiComponentLibrary/aiTutorVersionActions/AiTutorVersionActions';
import {useAiTutorModelParameters} from '@cdo/apps/aiTutor/hooks/useAiTutorModelParameters';
import {defaultPrompts, levelPrompts} from '@cdo/apps/aiTutor/suggestedPrompts';
import {isViewingAiTutorVersionFileUpdates} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
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
  aiTutorSystemPrompt?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  hasInstructionsDrawer?: boolean;
}

// A free chat with lab-supplied context added to each question.
const AiTutorChat: React.FunctionComponent<AiTutorChatProps> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled = false,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPrompt,
  aiTutorResponseSchemaSettings,
  hasInstructionsDrawer,
}) => {
  const viewingAiTutorVersionFileUpdates = useAppSelector(
    isViewingAiTutorVersionFileUpdates
  );
  const versionFiles = useAppSelector(
    state => state.lab2Project.aiTutorVersionFiles
  );

  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPrompt,
    aiTutorJsonSchema: aiTutorResponseSchemaSettings?.jsonSchema,
  });

  const chatButtons = useMemo(() => {
    const chatButtonDataToUse = aiTutorChatButtonData || defaultChatButtonData;
    return chatButtonDataToUse.map(button => ({
      ChatButton: ({onClick}: {onClick: ChatButtonClickHandler}) => (
        <MuiButton
          variant="outlined"
          color="secondary"
          size="small"
          className={moduleStyles.chatButton}
          onClick={() => onClick(button.value, button.analyticsProperties)}
          aria-label={button.label}
          startIcon={
            button.icon ? (
              <FontAwesomeV6Icon
                {...(button.icon as FontAwesomeV6IconProps)}
                className={classNames({
                  [moduleStyles['icon']]: true,
                  [moduleStyles[`icon-${button.icon.iconName}`]]: true,
                })}
              />
            ) : undefined
          }
          type="button"
        >
          {button.label}
        </MuiButton>
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

  const lastMessagePostText =
    viewingAiTutorVersionFileUpdates && versionFiles ? (
      <AiTutorVersionActions files={versionFiles} />
    ) : undefined;

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
        hasInstructionsDrawer={hasInstructionsDrawer}
        lastMessagePostText={lastMessagePostText}
      />
    </div>
  );
};

export default AiTutorChat;
