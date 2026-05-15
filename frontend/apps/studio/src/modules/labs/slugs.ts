import {AVAILABLE_LABS} from '@/modules/labs/config/labs';
import type {Lab} from '@/modules/labs/types/lab';

// Catalog slugs are the user-visible identifier on tiles and in URLs
// (e.g. /lab/ai-for-oceans). Each slug maps to one lab module from
// `AVAILABLE_LABS`. Slugs without an entry here are recognized as "we
// know the course but don't have a playable bundle for it yet" — the
// MobileLabHost renders a graceful "not on this device" screen rather
// than navigating away.
const SLUG_TO_LAB: Record<string, Lab> = {
  'ai-for-oceans': 'oceans',
  oceans: 'oceans',
  music: 'music',
};

/** Resolve a catalog slug to a lab module type. */
export function labTypeForSlug(slug: string): Lab | undefined {
  return SLUG_TO_LAB[slug];
}

/** Re-export of available lab types for convenience. */
export {AVAILABLE_LABS};
