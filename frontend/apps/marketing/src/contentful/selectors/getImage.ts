import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  if (asset === undefined) {
    return undefined;
  }

  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(asset: ExperienceAsset | undefined) {
  if (asset === undefined) {
    return undefined;
  }

  const relativeImageUrl = getRelativeImageUrl(asset);

  return relativeImageUrl ? `https:${relativeImageUrl}` : undefined;
}
