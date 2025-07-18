import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getAbsoluteImageUrl(
  asset: ExperienceAsset | string | undefined,
  additionalParams?: ConstructorParameters<typeof URLSearchParams>[0],
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

    // Append additional parameters if provided
    if (additionalParams) {
      const params = new URLSearchParams(additionalParams);
      params.forEach((value, key) => {
        absoluteImgUrl.searchParams.set(key, value);
      });
    }

    return absoluteImgUrl.toString();
  } catch (e) {
    console.error(e);
    return imgUrl;
  }
}
