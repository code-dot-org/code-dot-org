import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {
  PendingChatMessage,
  AichatContext,
  ChatAsset,
} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

export default async function askAi(
  message: string,
  currentLevelId: number | null,
  scriptId: number | null,
  channelId: string,
  assets?: ChatAsset[]
) {
  const newUserMessage: PendingChatMessage = {
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: message,
    timestamp: Date.now(),
    assets,
  };

  const aichatContext: AichatContext = {
    currentLevelId,
    scriptId,
    channelId,
  };

  const aiCustomizations = {
    ...EMPTY_AI_CUSTOMIZATIONS,
    selectedModelId: AiChatModelIds.CHATGPT,
    systemPrompt: '',
  };

  const messages = await postAichatCompletionMessage(
    newUserMessage,
    [],
    aiCustomizations,
    aichatContext
  );

  return messages;
}
