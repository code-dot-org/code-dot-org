// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static; the image cache (imageCache.ts) publishes its own
// copy beside the images it holds, built from this one.

import type {
  AdlibChoices,
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import manifest from '@cdo/static/spritelab_lab2/imageAdlibManifest.json';

import {ImageType} from './types';

/** Which combo set a level offers. simple and expanded are the defaults
    for image levels and freeplay; the rest are named by the hoai2026-dev
    image levels, one per image role, so each role gets its own words and
    its own cached images. */
export const IMAGE_ADLIB_SETS = [
  'simple',
  'expanded',
  'treasure',
  'hero',
  'friend',
  'story',
  'platform',
] as const;

export type ImageAdlibSet = (typeof IMAGE_ADLIB_SETS)[number];

export function isImageAdlibSet(value: unknown): value is ImageAdlibSet {
  return IMAGE_ADLIB_SETS.includes(value as ImageAdlibSet);
}

const adlibs = (manifest as {adlibs: AdlibsType}).adlibs;

export function imageAdlibId(imageType: ImageType, set: ImageAdlibSet): string {
  return `${imageType}-${set}`;
}

export function imageAdlibFor(
  imageType: ImageType,
  set: ImageAdlibSet
): AdlibType | undefined {
  return adlibs[imageAdlibId(imageType, set)];
}

/** Every combo id the bundled manifest knows. */
export function imageAdlibIds(): string[] {
  return Object.keys(adlibs);
}

export function imageAdlibById(adlibId: string): AdlibType | undefined {
  return adlibs[adlibId];
}

/** The template's slot names in the order the sentence reads them. */
export function adlibSlots(adlib: AdlibType): string[] {
  return [...adlib.template.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
}

/**
 * The chosen option ids in slot order, which is how a combo is named
 * everywhere outside the dialog (analytics, the cache's paths). Undefined
 * when a slot has no choice yet.
 */
export function adlibChoiceIds(
  adlib: AdlibType,
  choices: AdlibChoices
): string[] | undefined {
  const ids = adlibSlots(adlib).map(slot => choices[slot]);
  return ids.every(Boolean) ? ids : undefined;
}

/**
 * The sentence the choices spell, as the Adlib component fills it in:
 * each slot replaced by its chosen option's text. The cache generator
 * prompts with this so a cached image was asked for in the student's
 * words.
 */
export function adlibText(adlib: AdlibType, choices: AdlibChoices): string {
  return adlibSlots(adlib).reduce((text, slot) => {
    const chosen = adlib.options[slot]?.find(o => o.id === choices[slot]);
    return chosen ? text.replace(`{${slot}}`, chosen.text) : text;
  }, adlib.template);
}
