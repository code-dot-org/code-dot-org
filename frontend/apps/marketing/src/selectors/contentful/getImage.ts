import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export function getRelativeImageUrl(asset: ExperienceAsset | undefined) {
  return asset?.fields?.file?.url;
}

export function getOptimizedImageFormat(imgUrl: string) {
  // Extract file extension from a URL, handling various URL formats:
  // /\.(\w+)(?=[?#]|$)/i
  //   \.          - Matches the literal dot before the extension
  //   (\w+)       - Captures one or more word chars (a-z, A-Z, 0-9, _) as the extension
  //   (?=[?#]|$)  - Positive lookahead ensuring extension ends at ?, #, or end of string
  //               - This prevents matching partial extensions (e.g., "file.png?size=100")
  //   /i          - Case-insensitive flag to match extensions like .JPG or .Png
  // Returns the image format in lowercase (e.g., "png", "jpg", "webp")
  const imgExt = imgUrl.match(/\.(\w+)(?=[?#]|$)/i)?.[1]?.toLowerCase();

  switch (imgExt) {
    case undefined:
    case 'avif':
    case 'webp':
      return undefined;
    case 'gif': // GIFs converted to AVIF do not display transparent backgrounds in WebKit
      return 'webp';
    default:
      return 'avif';
  }
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

    // Force image format conversion for optimization
    const imgFormat = getOptimizedImageFormat(imgUrl);
    if (imgFormat) absoluteImgUrl.searchParams.set('fm', imgFormat);

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
