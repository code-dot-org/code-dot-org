import * as Observability from '@code-dot-org/core/plugins/observability';
import {jsonSchema, Output, type ModelMessage} from 'ai';

import {generateText} from '@cdo/apps/aiGateway';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {
  AiRequestExecutionStatus,
  SafeAndSupportedImageTypes,
} from '@cdo/generated-scripts/sharedConstants';

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
import {
  isTextSafe,
  isImageSafe,
  getImageModerationStatus,
  isOutputImageLlmSafetyJudgeEnabled,
} from './helpers/safetyHelpers';

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
  const userInputSafe = await isTextSafe(
    newMessage.chatMessageText,
    'input_filter'
  );
  Observability.metrics.count('ai-chat.text_moderation', 1, {
    phase: 'input_filter',
    result: userInputSafe ? 'ok' : 'flagged',
  });
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

  // Structured-output schema, when the caller (e.g. weblab2/pythonlab AI
  // Tutor) requested one via modelParameters.responseJsonSchema. jsonSchema()
  // adapts the raw JSON Schema document into the shape Output.object expects,
  // matching the pattern used by isTextSafe() and the levelbuilder generators.
  const outputSchema = modelParameters.responseJsonSchema
    ? Output.object({schema: jsonSchema(modelParameters.responseJsonSchema)})
    : undefined;

  // Generate a response with the model.
  const {text, files, finishReason, response, output, outputJson, attestation} =
    await generateText(
      {
        model: getModel(modelParameters.selectedModelId),
        messages,
        temperature: modelParameters.temperature,
        ...(outputSchema && {output: outputSchema}),
      },
      {phase: 'generation'}
    );

  // chatMessageText has to stay a string: rendering, storage and non-schema
  // messages all depend on that, even when a schema was used.
  //
  // For the schema case prefer the worker's own serialization (outputJson): the
  // signature covers a digest of exactly those bytes, and JSON.stringify()
  // guarantees no key order, so re-serializing here could produce a different
  // string and fail verification on a perfectly good response. The fallback is
  // only for a worker predating outputJson, which sends no signature anyway.
  const responseText = outputSchema
    ? outputJson ?? JSON.stringify(output)
    : text;

  if (['content-filter', 'other'].includes(finishReason)) {
    // Gemini stores moderation information in a non-standard place so we need to dig into the raw HTTP body.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidate = (response.body as any)?.candidates?.[0];

    return {
      response: `Blocked reason: ${candidate?.finishReason}. ${candidate?.finishMessage}`,
      status: AiRequestExecutionStatus.MODEL_CONTENT_FILTERED,
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
    if (file.uint8Array.length === 0) {
      return {response: responseText, status: AiRequestExecutionStatus.FAILURE};
    }
    let asset: ChatAsset;
    try {
      asset = await generatedFileToAsset(
        file,
        buildAssetUrl,
        SafeAndSupportedImageTypes // Currently only image files are supported.
      );
    } catch (error) {
      // Log and skip files with unsupported or unrecognized media types so the
      // text response is still returned to the user.
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Skipping unsupported generated file type', error as Error);
      continue;
    }
    assets.push(asset);
    if (file.mediaType.startsWith('image/')) {
      sendLab2AnalyticsEvent(EVENTS.MODEL_OUTPUT_IMAGE_CREATED);
      const assetUrl = buildAssetUrl(asset);

      Observability.logger.info('ai-chat.image_generated', {
        assetUrl,
        mediaType: file.mediaType,
        model: modelParameters.selectedModelId,
      });

      // Check generated images for safety.
      const imageSafetyChecks: [
        ReturnType<typeof getImageModerationStatus>,
        ReturnType<typeof isImageSafe>?
      ] = [getImageModerationStatus(file, assetUrl)];
      if (isOutputImageLlmSafetyJudgeEnabled()) {
        imageSafetyChecks.push(isImageSafe(file));
      }
      const [imageModerationResult, imageSafetyResult] =
        await Promise.allSettled(imageSafetyChecks);
      const imageModerationStatus =
        imageModerationResult.status === 'fulfilled'
          ? imageModerationResult.value
          : 'error';
      let imageSafe: boolean | undefined = true;
      if (imageSafetyResult !== undefined) {
        imageSafe =
          imageSafetyResult.status === 'fulfilled'
            ? imageSafetyResult.value
            : undefined;
      }
      Observability.metrics.count('ai-chat.image_moderation', 1, {
        result: imageModerationStatus,
        mediaType: file.mediaType,
        model: modelParameters.selectedModelId,
      });
      if (imageSafetyResult !== undefined) {
        let imageSafetyJudgeStatus: 'ok' | 'flagged' | 'error' = 'error';
        if (imageSafe !== undefined) {
          imageSafetyJudgeStatus = imageSafe ? 'ok' : 'flagged';
        }
        Observability.metrics.count('ai-chat.image_llm_safety_judge', 1, {
          result: imageSafetyJudgeStatus,
          mediaType: file.mediaType,
          // Note: This is the model that generated the image, not the model that judged it.
          model: modelParameters.selectedModelId,
        });
      }
      if (imageModerationStatus === 'flagged') {
        return {
          response: responseText,
          attestation,
          status: AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED,
        };
      }
      if (imageSafe === false) {
        return {
          response: responseText,
          attestation,
          status: AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED,
        };
      }
      if (imageModerationStatus === 'error' || imageSafe === undefined) {
        return {
          response: responseText,
          attestation,
          status: AiRequestExecutionStatus.FAILURE,
        };
      }
    }
  }

  // Check model text output for safety.
  const modelOutputSafe = await isTextSafe(responseText, 'output_filter');
  Observability.metrics.count('ai-chat.text_moderation', 1, {
    phase: 'output_filter',
    result: modelOutputSafe ? 'ok' : 'flagged',
  });
  if (!modelOutputSafe) {
    return {
      response: responseText,
      attestation,
      status: AiRequestExecutionStatus.MODEL_PROFANITY,
    };
  }

  return {
    response: responseText,
    attestation,
    assets,
    status: AiRequestExecutionStatus.SUCCESS,
  };
}
