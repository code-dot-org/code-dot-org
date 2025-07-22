import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {
  PendingChatMessage,
  AichatContext,
  ChatAsset,
} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';
// This type is the union of all the valid AI Model IDs.
export type AiChatModelIdType = ValueOf<typeof AiChatModelIds>;

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
    clientType: AiChatClientTypes.FLOW_LAB,
    currentLevelId,
    scriptId,
    channelId,
  };

  const modelQueryParam = queryParams('ai-model');
  const aiTutorModelId = Object.values(AiChatModelIds).includes(
    modelQueryParam as AiChatModelIdType
  )
    ? (modelQueryParam as AiChatModelIdType)
    : AiChatModelIds.GEMINI_2_5_FLASH;

  const aiCustomizations = {
    ...EMPTY_AI_CUSTOMIZATIONS,
    selectedModelId: aiTutorModelId,
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
