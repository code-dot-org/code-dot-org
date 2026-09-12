// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static today; an S3-hosted copy is the plan, slotting in
// behind imageAdlibFor with the bundled file as the fetch-failure fallback.

import {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import manifest from '@cdo/static/spritelab_lab2/imageAdlibManifest.json';

import {ImageType} from './types';

/** Which combo tier a level offers; expanded is the freeplay set. */
export type ImageAdlibSet = 'simple' | 'expanded';

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
