import {type ModelMessage} from 'ai';

import {generateText} from '@cdo/apps/aiGateway/generateTextThroughProxyOrGateway';
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
  const {text, files} = await generateText({
    model: getModel(modelParameters.selectedModelId),
    messages,
    temperature: modelParameters.temperature,
  });

  for (const file of files) {
    if (file.mediaType.startsWith('image/')) {
      const ext = file.mediaType.split('/')[1];
      const arrayBuffer = file.uint8Array.buffer.slice(
        file.uint8Array.byteOffset,
        file.uint8Array.byteOffset + file.uint8Array.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], {type: file.mediaType});
      const imageFile = new File([blob], `image.${ext}`, {
        type: file.mediaType,
      });
      const modelImageSafe = await isImageSafe(imageFile, ext);
      if (!modelImageSafe) {
        return {
          response: text,
          status: AiRequestExecutionStatus.MODEL_PROFANITY,
        };
      }
    }
  }

  // Check model text output for safety.
  const modelOutputSafe = await isTextSafe(text);
  if (!modelOutputSafe) {
    return {response: text, status: AiRequestExecutionStatus.MODEL_PROFANITY};
  }

  // Upload generated assets, if any.
  const assets: ChatAsset[] = [];
  for (const file of files) {
    const asset = await generatedFileToAsset(file, buildAssetUrl);
    assets.push(asset);
  }

  return {response: text, assets, status: AiRequestExecutionStatus.SUCCESS};
}
