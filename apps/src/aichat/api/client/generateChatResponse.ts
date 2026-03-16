import {type ModelMessage} from 'ai';

import {ACCEPTED_IMAGE_MEDIA_TYPES} from '@cdo/apps/aichat/api/client/helpers/fileHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  ChatAsset,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '../../types';

import {generatedFileToAsset} from './helpers/fileHelpers';
import {
  formatChatMessage,
  formatSystemMessages,
} from './helpers/messageHelpers';
import {getModel} from './helpers/modelHelpers';
import {isTextSafe, isImageSafe} from './helpers/safetyHelpers';

/**
 * Performs all the steps necessary to generate a chat response:
 * - Checks user input for safety
 * - Formats messages and system prompt for the model
 * - Calls the model to generate a response
 * - Checks model output for safety
 * - Uploads any generated files to the user's project and formats them as ChatAssets
 *
 * @returns the final status of the request execution, generated response text, and any generated assets.
 * If profanity was detected in the user input, only the status will be returned as the model is never invoked.
 */
export async function generateChatResponse(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  buildAssetUrl: (asset: ChatAsset) => string,
  levelSystemPrompt?: string
) {
  // Check input for safety.
  const userInputSafe = await isTextSafe(newMessage.chatMessageText);
  if (!userInputSafe) {
    return {status: AiRequestExecutionStatus.USER_PROFANITY};
  }

  // Convert messages to model format.
  const messages: ModelMessage[] = formatSystemMessages(
    modelParameters,
    newMessage.hiddenContext,
    levelSystemPrompt
  );

  for (const message of [...storedMessages, newMessage]) {
    messages.push(await formatChatMessage(message, buildAssetUrl));
  }

  // Generate a response with the model.
  const {text, files, finishReason, response} = await generateText({
    model: getModel(modelParameters.selectedModelId),
    messages,
    temperature: modelParameters.temperature,
  });

  if (['content-filter', 'other'].includes(finishReason)) {
    // Gemini stores moderation information in a non-standard place so we need to dig into the raw HTTP body.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidate = (response.body as any)?.candidates?.[0];

    return {
      response: `Blocked reason: ${candidate?.finishReason}. ${candidate?.finishMessage}`,
      status: AiRequestExecutionStatus.MODEL_PROFANITY,
    };
  }

  if (finishReason !== 'stop') {
    return {
      response: `Unexpected finish reason: ${finishReason}`,
      status: AiRequestExecutionStatus.FAILURE,
    };
  }

  // Upload generated assets, if any.
  const assets: ChatAsset[] = [];
  for (const file of files) {
    let asset: ChatAsset;
    try {
      asset = await generatedFileToAsset(
        file,
        buildAssetUrl,
        ACCEPTED_IMAGE_MEDIA_TYPES // Currently only image files are supported.
      );
    } catch (error) {
      // Log and skip files with unsupported or unrecognized media types so the
      // text response is still returned to the user. The error is surfaced in
      // the console locally and tracked in production monitoring.
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Skipping unsupported generated file type', error as Error);
      continue;
    }
    assets.push(asset);
    if (file.mediaType.startsWith('image/')) {
      sendLab2AnalyticsEvent(EVENTS.MODEL_OUTPUT_IMAGE_CREATED);
      // Check generated images for safety.
      const imageSafe = await isImageSafe(file);
      if (!imageSafe) {
        return {
          response: text,
          status: AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED,
        };
      }
    }
  }

  // Check model text output for safety.
  const modelOutputSafe = await isTextSafe(text);
  if (!modelOutputSafe) {
    return {response: text, status: AiRequestExecutionStatus.MODEL_PROFANITY};
  }

  return {response: text, assets, status: AiRequestExecutionStatus.SUCCESS};
}
