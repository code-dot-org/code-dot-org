import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {ValueOf} from '../types/utils';

import {MAX_NAME_LENGTH, modelDescriptions} from './constants';
import {ChatAsset} from './types';

export const getShortName = (studentName: string): string => {
  // If the student name contains a first and last name separated by whitespace, only use the first name.
  const first = studentName.split(/\s/)[0];
  // If the first name is longer than 10 characters, only use the first 10 characters.
  return first.length > 10 ? first.slice(0, MAX_NAME_LENGTH) : first;
};

/**
 * Generates a URL for the given asset.
 */
export function getAssetUrl(
  asset: ChatAsset,
  channelId?: string,
  levelName?: string
) {
  if (asset.source === 'project' && channelId) {
    return `/v3/assets/${channelId}/${encodeURIComponent(asset.filename)}`;
  }

  if (asset.source === 'level' && levelName) {
    return `/level_starter_assets/${levelName}/${encodeURIComponent(
      asset.filename
    )}`;
  }

  if (asset.source === 'level_uuid' && levelName) {
    return `/level_starter_assets/${levelName}/uuid/${encodeURIComponent(
      asset.filename
    )}`;
  }

  throw new Error(
    'Either channel ID or level name must be provided for asset URL generation.'
  );
}

// Returns a string representation of a line reference when a user selects
// lines from a text file to add to the user-added selection context.
export const getLineReferenceText = (lineReference: {
  start: number;
  end: number;
}) => {
  return lineReference.start === lineReference.end
    ? `(${lineReference.start})`
    : `(${lineReference.start}-${lineReference.end})`;
};

/**
 * Returns a list of allowed file types to upload for the given model ID.
 * If the model does not support multimodal input, returns an empty list.
 */
export const getAllowedFileTypes = (
  modelId: ValueOf<typeof AiChatModelIds>
) => {
  const model = modelDescriptions.find(model => model.id === modelId);
  if (!model || !model.multimodal) {
    return [];
  }
  // Currently, our system only supports moderating images files. For the
  // Gemini 2.5 Flash Image model, we have stricter input criteria so only
  // safe image uploads are allowed. For other multimodal models, we don't
  // do any input moderation, and allow both image and PDF uploads.
  const images = ['.jpg', '.jpeg', '.png'];
  return modelId === AiChatModelIds.GEMINI_2_5_FLASH_IMAGE
    ? images
    : [...images, '.pdf'];
};
