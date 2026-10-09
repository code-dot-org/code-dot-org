// Pre-generated images for the explore layout's sentences, served from S3
// beside the music and dancer files Mix and Move used. A cached image is
// the model's raw output, not a finished asset: the same local pipeline
// (background removal, crop, pixel normalization, strip assembly) runs on
// it as on a live result, so improvements to that pipeline reach cached
// images on their next use.
//
// Layout, one folder per filled sentence, one per style inside it:
//
//   <base>/<version>/<sentenceId>/<word-ids>/<style>/<NN>.json      sidecar
//   <base>/<version>/<sentenceId>/<word-ids>/<style>/<NN>.png       single
//   <base>/<version>/<sentenceId>/<word-ids>/<style>/<NN>-base.png  set frames
//   <base>/<version>/<sentenceId>/<word-ids>/<style>/<NN>-walking.png ...
//
// <word-ids> are the chosen word ids (single words, see exploreSentences.ts)
// in the order the sentence reads its slots, joined by '-', with
// EMPTY_WORD_ID for an optional slot left empty. A generator writes this tree offline, VARIANT_COUNT variants per
// filling; there is no index of what exists. A filling the tree lacks, or
// a variant review deleted, is found by its sidecar being missing.
//
// The sidecar does not record the prompt: a version of the tree is drawn
// with the prompt builders of its day, and the two move together, so the
// lab's own builders describe a cached picture.

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
    are kebab-case, so it cannot be one. */
export const EMPTY_WORD_ID = '_';

/** How many variants the generator draws per filling, numbered from 00. */
export const VARIANT_COUNT = 3;

/** A character set's frames by pose label, 'base' first; a single image is
    'single'. */
export type CachedFrame = 'single' | 'base' | string;

/** What the generator recorded beside one variant's files: only what the
    lab's pipeline needs to finish them. Other keys are ignored. */
export interface CachedSidecar {
  /** The five pose files are there; absent on a single picture. */
  characterSet?: boolean;
  /** The flat colour a set was drawn on (a KEY_COLORS name). A single
      picture is keyed from its corner and names none. */
  keyColor?: string;
  /** The logical grid a pixel-style picture was asked for. */
  pixelGrid?: number;
}

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
  sidecar(): Promise<CachedSidecar>;
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
  return `${sentenceId}/${wordIds.join('-')}/${style}`;
}

// One sidecar fetch per page per URL, hit or miss: Generate again asks
// about the same variants, and a filling the tree lacks stays absent.
const sidecars = new Map<string, Promise<CachedSidecar | undefined>>();

async function fetchSidecar(url: string): Promise<CachedSidecar | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as CachedSidecar;
  } catch {
    return undefined;
  }
}

function loadSidecar(url: string): Promise<CachedSidecar | undefined> {
  let pending = sidecars.get(url);
  if (!pending) {
    pending = fetchSidecar(url);
    sidecars.set(url, pending);
  }
  return pending;
}

/** Tests: drop remembered sidecars. */
export function resetSidecarCache() {
  sidecars.clear();
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
  /** The variant shown last time; another is preferred when one exists. */
  avoidVariant?: number;
  /** Override for tests and QA; defaults to the published tree. */
  baseUrl?: string;
  version?: string;
}

/**
 * A variant of the filled sentence the cache holds, chosen at random among
 * the ones whose sidecar is there, or undefined when none is: the sentence
 * was not drawn with those words in that style, or review deleted every
 * variant. The variant shown last is passed over while another exists.
 */
export async function findCachedImage(
  params: FindCachedImageParams
): Promise<CachedImage | undefined> {
  const {
    sentenceId,
    wordIds,
    style,
    avoidVariant,
    baseUrl = IMAGE_CACHE_BASE_URL,
    version = IMAGE_CACHE_VERSION,
  } = params;
  const path = sentencePath(sentenceId, wordIds, style);
  const folder = `${baseUrl}${version}/${path}`;
  const variants = [...Array(VARIANT_COUNT).keys()];
  // Random order, the last shown at the end: the first sidecar found wins.
  const order = [
    ...shuffle(variants.filter(v => v !== avoidVariant)),
    ...variants.filter(v => v === avoidVariant),
  ];
  for (const variant of order) {
    const sidecar = await loadSidecar(`${folder}/${variantName(variant)}.json`);
    if (!sidecar) {
      continue;
    }
    const characterSet = !!sidecar.characterSet;
    return {
      variant,
      characterSet,
      sidecar: async () => sidecar,
      async raw(frame) {
        const wanted = characterSet && frame === 'single' ? 'base' : frame;
        return fetchRaw(
          `${folder}/${frameFileName(variant, wanted, characterSet)}`
        );
      },
    };
  }
  return undefined;
}
