// Pre-generated images for the explore layout's sentences, served from S3
// beside the music and dancer files Mix and Move used. A cached image is
// the model's raw output, not a finished asset: the same local pipeline
// (background removal, crop, pixel normalization, strip assembly) runs on
// it as on a live result, so improvements to that pipeline reach cached
// images on their next use.
//
// Layout: one folder per word, in the order the sentence reads its slots,
// then one per style:
//
//   <base>/<version>/<sentenceId>/<word>/<word>/<word>/<style>/<NN>.png          single
//   <base>/<version>/<sentenceId>/<word>/<word>/<word>/<style>/<NN>-base.png     set frames
//   <base>/<version>/<sentenceId>/<word>/<word>/<word>/<style>/<NN>-walking.png  ...
//
// An optional slot left empty is EMPTY_WORD_ID. A generator writes this
// tree offline, VARIANT_COUNT variants per filling, and nothing describes
// it: whether a filling is a set or one picture, its grid and its key
// colour follow from the level and the prompt, the same way they do for a
// live picture. A variant is there when its first frame is; a filling the
// tree lacks, or a variant review deleted, is found by that file missing.
//
// A version of the tree is drawn with the prompt builders of its day, and
// the two move together, so the lab's own builders describe a cached
// picture.

import type {GeneratedFile} from 'ai';
import {shuffle} from 'lodash';

import {bytesToBase64} from './encoding';
import {ImageStyle} from './types';

/** Where a level's pictures come from: the model, or the tree, which is
    assumed complete. A picture the tree lacks is an error, not a fallback. */
export const IMAGE_SOURCES = ['live', 'cached'] as const;
export type ImageSource = (typeof IMAGE_SOURCES)[number];

export function isImageSource(value: unknown): value is ImageSource {
  return IMAGE_SOURCES.includes(value as ImageSource);
}

// The path the hoai2026 image-gen script publishes to, in the cdo-curriculum
// bucket beside media/musiclab. curriculum.code.org needs no media proxy
// (assetPrefix.js exempts it).
export const IMAGE_CACHE_BASE_URL =
  'https://curriculum.code.org/media/spritelab/generate/images/';

// Bumped with the word lists or the prompts: a version's files were made
// from its own words, and a browser may still hold the old ones.
export const IMAGE_CACHE_VERSION = 'v1';

/** Stands in a path for an optional slot the student left empty. Word ids
    are words, so it cannot be one. */
export const EMPTY_WORD_ID = '_';

/** How many variants the generator draws per filling, numbered from 00. */
export const VARIANT_COUNT = 3;

/** A character set's frames by pose label, 'base' first; a single image is
    'single'. */
export type CachedFrame = 'single' | 'base' | string;

/** Thrown when a file the variant should have is not there. */
export class ImageCacheMissError extends Error {
  constructor(url: string, status?: number) {
    super(`Cached image missing: ${url}${status ? ` (${status})` : ''}`);
    this.name = 'ImageCacheMissError';
  }
}

/** One variant of one filled sentence, ready to stand in for the model. */
export interface CachedImage {
  variant: number;
  characterSet: boolean;
  /** The model's raw output for one frame. A set's 'single' is its base. */
  raw(frame: CachedFrame): Promise<GeneratedFile>;
}

export function variantName(variant: number): string {
  return String(variant).padStart(2, '0');
}

/** The file a frame's bytes live in: `<NN>.png` for a single picture,
    `<NN>-<frame>.png` for a set's frame. */
export function frameFileName(
  variant: number,
  frame: string,
  characterSet: boolean
): string {
  return `${variantName(variant)}${characterSet ? `-${frame}` : ''}.png`;
}

export function sentencePath(
  sentenceId: string,
  wordIds: string[],
  style: ImageStyle
): string {
  return `${sentenceId}/${wordIds.join('/')}/${style}`;
}

// A frame found missing stays missing for the page: Generate again asks
// about the same variants, and a filling the tree lacks stays absent.
const missing = new Set<string>();

/** Tests: forget which frames were missing. */
export function resetMissingFrames() {
  missing.clear();
}

async function fetchRaw(url: string): Promise<GeneratedFile> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ImageCacheMissError(url, response.status);
  }
  const uint8Array = new Uint8Array(await response.arrayBuffer());
  const mediaType =
    response.headers.get('content-type')?.split(';')[0] || 'image/png';
  return {
    uint8Array,
    mediaType,
    get base64() {
      return bytesToBase64(uint8Array);
    },
  };
}

export interface FindCachedImageParams {
  sentenceId: string;
  /** Word ids in the sentence's slot order (sentenceWordIds). */
  wordIds: string[];
  style: ImageStyle;
  /** Five pose files rather than one picture. */
  characterSet: boolean;
  /** The variant shown last time; another is preferred when one exists. */
  avoidVariant?: number;
  /** Override for tests and QA; defaults to the published tree. */
  baseUrl?: string;
  version?: string;
}

/**
 * A variant of the filled sentence the cache holds, chosen at random among
 * the ones whose first frame is there, or undefined when none is: the
 * sentence was not drawn with those words in that style, or review deleted
 * every variant. The variant shown last is passed over while another
 * exists. The first frame is fetched to find the variant and kept, so
 * asking for it again costs nothing.
 */
export async function findCachedImage(
  params: FindCachedImageParams
): Promise<CachedImage | undefined> {
  const {
    sentenceId,
    wordIds,
    style,
    characterSet,
    avoidVariant,
    baseUrl = IMAGE_CACHE_BASE_URL,
    version = IMAGE_CACHE_VERSION,
  } = params;
  const folder = `${baseUrl}${version}/${sentencePath(
    sentenceId,
    wordIds,
    style
  )}`;
  const fileUrl = (variant: number, frame: string) =>
    `${folder}/${frameFileName(variant, frame, characterSet)}`;
  const firstFrame = characterSet ? 'base' : 'single';
  const variants = [...Array(VARIANT_COUNT).keys()];
  // Random order, the last shown at the end: the first frame found wins.
  const order = [
    ...shuffle(variants.filter(v => v !== avoidVariant)),
    ...variants.filter(v => v === avoidVariant),
  ];
  for (const variant of order) {
    const url = fileUrl(variant, firstFrame);
    if (missing.has(url)) {
      continue;
    }
    let first: GeneratedFile;
    try {
      first = await fetchRaw(url);
    } catch {
      missing.add(url);
      continue;
    }
    return {
      variant,
      characterSet,
      async raw(frame) {
        const wanted = characterSet && frame === 'single' ? 'base' : frame;
        return wanted === firstFrame
          ? first
          : fetchRaw(fileUrl(variant, wanted));
      },
    };
  }
  return undefined;
}
