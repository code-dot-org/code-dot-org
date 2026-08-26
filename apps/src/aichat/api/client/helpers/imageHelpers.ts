import {type GeneratedFile} from 'ai';

import {ModelParameters} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {getModel} from './modelHelpers';

const IMAGE_MODEL_IDS: string[] = [AiChatModelIds.GEMINI_2_5_FLASH_IMAGE];

export function isImageModel(modelParameters: ModelParameters): boolean {
  return IMAGE_MODEL_IDS.includes(modelParameters.selectedModelId);
}

/**
 * A missing image announces itself. The model writes the text that would have
 * introduced the image and stops mid-thought, so the reply ends in whitespace;
 * turns that are legitimately text-only end on sentence punctuation.
 */
export function announcedImageIsMissing(
  modelParameters: ModelParameters,
  files: GeneratedFile[],
  text: string
): boolean {
  return (
    isImageModel(modelParameters) && files.length === 0 && /\s$/.test(text)
  );
}

/**
 * Redraws without conversation history, so a transcript in which the model has
 * already claimed to produce the image cannot talk it out of drawing one.
 */
export async function redrawAnnouncedImage(
  modelParameters: ModelParameters,
  announcement: string,
  userMessageText: string
): Promise<GeneratedFile[]> {
  const {files} = await generateText(
    {
      model: getModel(modelParameters.selectedModelId),
      prompt: `Generate this image: ${announcement.trim()}\n\nIt was requested with: ${userMessageText}`,
      temperature: modelParameters.temperature,
    },
    {phase: 'generation'}
  );

  return files ?? [];
}
