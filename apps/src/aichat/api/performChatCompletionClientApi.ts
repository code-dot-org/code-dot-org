import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {
  AichatContext,
  ChatAsset,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '../types';

import {
  createAichatRequest,
  updateAichatRequest,
} from './client/helpers/aichatRequestHelpers';

/**
 * Performs client-side chat completion submission flow, which involves creating a new AichatRequest record,
 * carrying out the actual chat completion action, and updating the AichatRequest record with the result.
 *
 * @returns an array of {@link CompletedChatMessage}s representing the updated user message and the assistant response.
 */
export async function performChatCompletionClientApi(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  aichatContext: AichatContext,
  buildAssetUrl: (asset: ChatAsset) => string,
  levelSystemPrompt?: string
): Promise<CompletedChatMessage[]> {
  // Create a new AichatRequest record for this request. This is only needed because the AichatEvent model
  // (which tracks chat history) has a foreign key dependency on it. Remove if/when we are able to decouple.
  const requestId = await createAichatRequest(
    newMessage,
    storedMessages,
    modelParameters,
    aichatContext
  );

  const {generateChatResponse} = await import(
    /* webpackChunkName: "aichat-client-api" */ './client/index.js'
  );

  const {response, assets, status} = await generateChatResponse(
    newMessage,
    storedMessages,
    modelParameters,
    buildAssetUrl,
    levelSystemPrompt
  );

  await updateAichatRequest(requestId, status, response);

  const updatedUserMessage = {...newMessage, requestId};

  if (status === AiRequestExecutionStatus.USER_PROFANITY) {
    return [
      {...updatedUserMessage, status: AiInteractionStatus.PROFANITY_VIOLATION},
    ];
  }

  const assistantMessageBase = {
    requestId,
    chatMessageText: response,
    role: Role.ASSISTANT,
    timestamp: Date.now(),
    assets,
  };

  if (status === AiRequestExecutionStatus.MODEL_PROFANITY) {
    return [
      {...updatedUserMessage, status: AiInteractionStatus.ERROR},
      {
        ...assistantMessageBase,
        status: AiInteractionStatus.PROFANITY_VIOLATION,
      },
    ];
  }

  if (response === undefined || status !== AiRequestExecutionStatus.SUCCESS) {
    throw new Error(`Invalid state: no response or invalid status: ${status}`);
  }

  return [
    {...updatedUserMessage, status: AiInteractionStatus.OK},
    {
      ...assistantMessageBase,
      status: AiInteractionStatus.OK,
    },
  ];
}
