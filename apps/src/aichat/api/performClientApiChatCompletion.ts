import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getTypedKeys} from '@cdo/apps/types/utils';
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

import {getClientApi} from './client';
import {createAichatRequest} from './client/helpers/aichatRequestHelpers';

const metricPrefix = 'AichatClientApi';

/**
 * Performs client-side chat completion submission flow, which involves creating a new AichatRequest record,
 * carrying out the actual chat completion action, and updating the AichatRequest record with the result.
 *
 * @returns an array of {@link CompletedChatMessage}s representing the updated user message and the assistant response.
 */
export async function performClientApiChatCompletion(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  aichatContext: AichatContext,
  buildAssetUrl: (asset: ChatAsset) => string,
  levelSystemPrompt?: string
): Promise<CompletedChatMessage[]> {
  // Create an AichatRequest row for this request. Needed only because the
  // AichatEvent model (which tracks chat history) has a foreign key to it, so
  // the row is created and never written to again. Remove if/when we can
  // decouple. The worker's signature, relayed on each message below, is what
  // dashboard checks this turn against.
  const requestId = await createAichatRequest(
    newMessage,
    storedMessages,
    modelParameters,
    aichatContext
  );

  const clientApi = await getClientApi();

  const metricsReporter = Lab2Registry.getInstance().getMetricsReporter();
  const startTime = Date.now();
  const metricDimensions = [
    {name: 'ModelId', value: modelParameters.selectedModelId},
  ];
  metricsReporter.incrementCounter(`${metricPrefix}.Start`, metricDimensions);

  const {response, assets, status, responseSignature} =
    await clientApi.generateChatResponse(
      newMessage,
      storedMessages,
      modelParameters,
      buildAssetUrl,
      levelSystemPrompt
    );

  metricsReporter.reportLoadTime(
    `${metricPrefix}.Latency`,
    Date.now() - startTime,
    metricDimensions
  );

  const statusName =
    getTypedKeys(AiRequestExecutionStatus).find(
      key => AiRequestExecutionStatus[key] === status
    ) || 'UNKNOWN';

  metricsReporter.incrementCounter(`${metricPrefix}.Finish`, [
    ...metricDimensions,
    {name: 'ExecutionStatus', value: statusName},
  ]);

  // The signature covers both halves of the turn, so the student's message
  // carries it too: log_chat_event checks that message against the prompt digest
  // and the reply against the response digest. Undefined when the model was
  // never called (input moderation), which log_chat_event carves out.
  const updatedUserMessage = {...newMessage, requestId, responseSignature};

  if (status === AiRequestExecutionStatus.USER_PROFANITY) {
    return [
      {...updatedUserMessage, status: AiInteractionStatus.PROFANITY_VIOLATION},
    ];
  }

  // Carried on the message so logChatEvent relays it to log_chat_event, which
  // is where the response is admitted to chat history. Stripped before the event
  // is stored -- it is proof of provenance, not part of the transcript.
  const assistantMessageBase = {
    requestId,
    chatMessageText: response,
    role: Role.ASSISTANT,
    timestamp: Date.now(),
    assets,
    responseSignature,
  };

  if (
    status === AiRequestExecutionStatus.MODEL_PROFANITY ||
    status === AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED
  ) {
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
