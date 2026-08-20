// Gallery presentation logic for the Images tab.

import {ImageType} from './ai/images/types';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from './types';

/** The image kind an animation's categories record. */
export function imageTypeFromCategories(categories?: string[]): ImageType {
  if (categories?.includes(BACKGROUNDS_CATEGORY)) {
    return 'background';
  }
  if (categories?.includes(BLOCKS_CATEGORY)) {
    return 'block';
  }
  return 'sprite';
}

/** The categories that record an image kind — imageTypeFromCategories' inverse. */
export function categoriesForType(imageType: ImageType): string[] {
  if (imageType === 'background') {
    return [BACKGROUNDS_CATEGORY];
  }
  if (imageType === 'block') {
    return [BLOCKS_CATEGORY];
  }
  return [];
}

const GROUP_ORDER: Record<ImageType, number> = {
  background: 0,
  sprite: 1,
  block: 2,
};

/**
 * Display order for the gallery: backgrounds, then sprites, then blocks,
 * keeping the stored order within each group.
 */
export function galleryOrder<T>(
  images: readonly T[],
  typeOf: (image: T) => ImageType
): T[] {
  // Array.prototype.sort is stable, which is what keeps the stored order
  // within a group.
  return [...images].sort(
    (a, b) => GROUP_ORDER[typeOf(a)] - GROUP_ORDER[typeOf(b)]
  );
}
