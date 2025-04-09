import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(asset: ExperienceAsset | undefined) {
  const relativeImageUrl = getRelativeImageUrl(asset);

  return relativeImageUrl ? `https:${relativeImageUrl}` : undefined;
}
