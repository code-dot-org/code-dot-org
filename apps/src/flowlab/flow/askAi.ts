import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

export default async function askAi(message: string) {
  const newUserMessage: PendingChatMessage = {
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: message,
    assets: undefined,
    timestamp: Date.now(),
  };

  const aichatContext: AichatContext = {
    currentLevelId: null, // this.currentLevelId ? parseInt(this.currentLevelId) : null,
    scriptId: null, // this.scriptId || null,
    channelId: undefined, // this.channelId,
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
