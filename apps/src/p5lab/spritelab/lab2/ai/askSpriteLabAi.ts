import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {AichatContext, PendingChatMessage} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichatLab/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {buildPrompt} from '../blockly/generateContent';

/**
 * Ask the AI to turn a natural-language request into Sprite Lab pseudocode.
 * Modeled on Music Lab's askAi: FLOW_LAB client type (trusted + longer
 * timeouts) and Gemini 2.5 Flash. Returns the generated pseudocode text.
 */
export default async function askSpriteLabAi(
  userPrompt: string
): Promise<string> {
  const newUserMessage: PendingChatMessage = {
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: buildPrompt(userPrompt),
    assets: undefined,
    timestamp: Date.now(),
  };

  const aichatContext: AichatContext = {
    clientType: AiChatClientTypes.FLOW_LAB,
    currentLevelId: null,
    scriptId: null,
    channelId: undefined,
  };

  const aiCustomizations = {
    ...EMPTY_AI_CUSTOMIZATIONS,
    selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
    systemPrompt: '',
  };

  const messages = await postAichatCompletionMessage(
    newUserMessage,
    [],
    aiCustomizations,
    aichatContext
  );

  // The model's reply is the last non-user message.
  const reply = [...messages]
    .reverse()
    .find(message => message.role !== Role.USER);
  return reply?.chatMessageText ?? '';
}
