import {MAX_NAME_LENGTH} from './constants';
import {AiCustomizations, ChatAsset, ToxicityCheckedField} from './types';
import {FIELDS_CHECKED_FOR_TOXICITY} from './views/modelCustomization/constants';

export const getShortName = (studentName: string): string => {
  // If the student name contains a first and last name separated by whitespace, only use the first name.
  const first = studentName.split(/\s/)[0];
  // If the first name is longer than 10 characters, only use the first 10 characters.
  return first.length > 10 ? first.slice(0, MAX_NAME_LENGTH) : first;
};

/**
 * Extracts fields from AiCustomizations that need to be checked for toxicity.
 */
export const extractFieldsToCheckForToxicity = (
  customizations: AiCustomizations
) => {
  return FIELDS_CHECKED_FOR_TOXICITY.reduce((acc, field) => {
    if (customizations[field]) {
      acc[field] = customizations[field];
    }
    return acc;
  }, {} as {[key in ToxicityCheckedField]: string | string[]});
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

  throw new Error(
    'Either channel ID or level name must be provided for asset URL generation.'
  );
}
