import {type GeneratedFile, type ModelMessage} from 'ai';

import {generateText} from '@cdo/apps/aiGateway';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';
import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  AssetSource,
  ChatAsset,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '../../types';

import {
  formatChatMessage,
  formatSystemMessages,
} from './helpers/messageHelpers';
import {getModel} from './helpers/modelHelpers';
import {getImageModerationStatus, isTextSafe} from './helpers/safetyHelpers';

// Converts any browser-renderable image to PNG via canvas.
// Used with model-generated images since Vercel AI SDK doesn't currently expose output format configuration.
// Vercel AI SDK does not always report media type accurately (seen from HomeyBadger errors).
const convertToPng = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('canvas.toBlob returned null'));
          return;
        }
        resolve(new File([blob], file.name, {type: 'image/png'}));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image failed to load'));
    };
    img.src = url;
  });

// Converts a model-generated image to a PNG File via canvas.
// Always converts regardless of reported mediaType since Vercel AI SDK
// does not guarantee the reported type matches the actual image bytes.
const toPngFile = async (file: GeneratedFile): Promise<File> => {
  const sourceFile = new File(
    [file.uint8Array.buffer as ArrayBuffer],
    'generated',
    {
      type: file.mediaType,
    }
  );
  return convertToPng(sourceFile);
};

// Uploads a PNG File to the user's project assets and returns the ChatAsset.
const uploadImageAsAsset = async (
  file: File,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<ChatAsset> => {
  const asset: ChatAsset = {
    filename: `generated-file-${createUuid()}.png`,
    source: AssetSource.PROJECT,
  };
  await HttpClient.put(buildAssetUrl(asset), file, true, {
    'Content-Type': 'image/png',
  });
  return asset;
};

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
    if (!file.mediaType.startsWith('image/')) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          `Skipping unsupported generated file type: ${file.mediaType}`
        );
      continue;
    }

    if (file.uint8Array.length === 0) {
      return {response: text, status: AiRequestExecutionStatus.FAILURE};
    }

    // HEIC/HEIF cannot be reliably decoded by browser canvas across all browsers.
    // If Gemini starts returning these formats, convert images to PNG in the backend.
    if (['image/heic', 'image/heif'].includes(file.mediaType)) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(`Unsupported generated image format: ${file.mediaType}`);
      return {response: text, status: AiRequestExecutionStatus.FAILURE};
    }

    // Convert to PNG before saving and moderating. The Gemini API output format
    // is not configurable, so we normalize to PNG for consistent asset storage.
    let toSaveFile: File;
    try {
      toSaveFile = await toPngFile(file);
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Failed to convert generated image to PNG', error as Error);
      return {response: text, status: AiRequestExecutionStatus.FAILURE};
    }

    let asset: ChatAsset;
    try {
      asset = await uploadImageAsAsset(toSaveFile, buildAssetUrl);
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Failed to upload generated image asset', error as Error);
      return {response: text, status: AiRequestExecutionStatus.FAILURE};
    }
    assets.push(asset);

    sendLab2AnalyticsEvent(EVENTS.MODEL_OUTPUT_IMAGE_CREATED);

    const imageModerationStatus = await getImageModerationStatus(
      toSaveFile,
      buildAssetUrl(asset)
    );
    if (imageModerationStatus === 'flagged') {
      return {
        response: text,
        status: AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED,
      };
    } else if (imageModerationStatus === 'error') {
      return {
        response: text,
        status: AiRequestExecutionStatus.FAILURE,
      };
    }
  }

  // Check model text output for safety.
  const modelOutputSafe = await isTextSafe(text);
  if (!modelOutputSafe) {
    return {response: text, status: AiRequestExecutionStatus.MODEL_PROFANITY};
  }

  return {response: text, assets, status: AiRequestExecutionStatus.SUCCESS};
}
