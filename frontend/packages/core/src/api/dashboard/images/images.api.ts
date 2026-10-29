// Image moderation: dashboard hands an image to Azure AI Content Safety and
// returns its severity per category; the verdict is judged here, against
// thresholds a caller may tighten or loosen per category (apps'
// util/moderateImage).

import type {Transport} from '../../transports/types';

export type ModerationCategory = 'Hate' | 'SelfHarm' | 'Sexual' | 'Violence';
export type SeverityThresholds = Partial<Record<ModerationCategory, number>>;

export interface ImageModerationResult {
  categoriesAnalysis?: {category: ModerationCategory; severity: number}[];
}

// The severity at which each category blocks an image.
const BLOCKED_AT: Record<ModerationCategory, number> = {
  Hate: 2,
  SelfHarm: 2,
  Sexual: 2,
  Violence: 4,
};

/** 'safe' when every category is below its threshold. */
export function imageModerationVerdict(
  result: ImageModerationResult | null,
  thresholds?: SeverityThresholds,
): 'safe' | 'flagged' {
  const blockedAt = {...BLOCKED_AT, ...thresholds};
  const safe = result?.categoriesAnalysis?.every(
    ({category, severity}) => severity < blockedAt[category],
  );
  return safe ? 'safe' : 'flagged';
}

export function createImagesApi(transport: Transport) {
  return {
    /** POST /v3/images/moderate with the image's bytes. */
    async moderate(params: {image: Blob}): Promise<ImageModerationResult> {
      const {image} = params;
      const result = await transport.request<ImageModerationResult | null>({
        method: 'POST',
        url: '/v3/images/moderate',
        headers: {'Content-Type': image.type || 'application/octet-stream'},
        body: image,
      });
      if (!result) {
        throw new Error('Image moderation returned no result');
      }
      return result;
    },
  };
}
