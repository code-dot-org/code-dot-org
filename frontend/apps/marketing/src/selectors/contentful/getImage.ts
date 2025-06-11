import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(
  asset: ExperienceAsset | string | undefined,
) {
  const imgUrl =
    typeof asset === 'string' ? asset : getRelativeImageUrl(asset) || undefined;

  if (!imgUrl) return undefined;

  try {
    const absoluteImgUrl = new URL(
      imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl,
    );
    // Force AVIF format conversion for the image
    absoluteImgUrl.searchParams.set('fm', 'avif');
    return absoluteImgUrl.toString();
  } catch (e) {
    console.error(e);
    return imgUrl;
  }
}
