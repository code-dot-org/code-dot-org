// Pre-generated images for adlib combos, served from S3 beside the music and
// dancer files Mix and Move used. A cached image is the model's raw output,
// not a finished asset: the same local pipeline (background removal, crop,
// pixel normalization, strip assembly) runs on it as on a live result, so
// improvements to that pipeline reach cached images on their next use.
//
// Layout, one folder per combo, one per style inside it:
//
//   <base>/<version>/manifest.json
//   <base>/<version>/<adlibId>/<choice-ids>/<style>/<NN>.json      sidecar
//   <base>/<version>/<adlibId>/<choice-ids>/<style>/<NN>.png       single
//   <base>/<version>/<adlibId>/<choice-ids>/<style>/<NN>-base.png  set frames
//   <base>/<version>/<adlibId>/<choice-ids>/<style>/<NN>-walking.png ...
//
// The generator (apps/script/spritelabCachedImages) writes this tree; the
// manifest names what exists and which variants review rejected.

import type {GeneratedFile} from 'ai';

import {bytesToBase64} from './encoding';
import {POSED_FRAMES} from './prompts';
import {ImageStyle, ImageType} from './types';

/** Where a level's combo images come from. cached-then-live falls back to
    the model when the cache has no image for the combo. */
export const IMAGE_SOURCES = ['live', 'cached', 'cached-then-live'] as const;
export type ImageSource = (typeof IMAGE_SOURCES)[number];

export function isImageSource(value: unknown): value is ImageSource {
  return IMAGE_SOURCES.includes(value as ImageSource);
}

// A new peer of media/musiclab; the bucket is cdo-curriculum. curriculum.
// code.org needs no media proxy (assetPrefix.js exempts it).
export const IMAGE_CACHE_BASE_URL =
  'https://curriculum.code.org/media/spritelab2/generate/';

// Bumped with the word lists or the prompts: a version's files were made
// from its own manifest, and a browser may still hold the old one.
export const IMAGE_CACHE_VERSION = 'v1';

/** A character set's frames, the base first; a single image is 'single'. */
export type CachedFrame = 'single' | 'base' | string;
export const CHARACTER_SET_FRAMES: string[] = [
  'base',
  ...POSED_FRAMES.map(f => f.label),
];

/** One combo set as the published manifest describes it. */
export interface CachedAdlibEntry {
  /** Slot names in template order: the order choice ids join in a path. */
  slots: string[];
  /** Sprites cached as five-frame character sets, not single pictures. */
  characterSet: boolean;
  /** Variants drawn per combo, keyed `<choice-ids>/<style>`: numbered from
      00 without gaps. A combo not listed has none. */
  variants: Record<string, number>;
}

export interface ImageCacheManifest {
  version: string;
  adlibs: Record<string, CachedAdlibEntry>;
  /** Variants review rejected, as `<choice-ids>/<style>/<NN>` per combo set. */
  blockList: Record<string, string[]>;
}

/** What the generator recorded beside one variant's files. */
export interface CachedSidecar {
  adlibId: string;
  choices: Record<string, string>;
  /** The student sentence, as the dialog would have sent it. */
  prompt: string;
  imageType: ImageType;
  style: ImageStyle;
  characterSet: boolean;
  seed: number;
  temperature?: number;
  pixelGrid?: number;
  /** The key colour the set was drawn on (keyColor.ts KEY_COLORS name). */
  keyColor?: string;
  model: string;
  generatedAt: string;
  /** Per frame: the model's media type (which fixes the file's extension,
      see frameFileName) and the full prompt it was sent. */
  frames: Record<string, {mediaType: string; prompt: string}>;
}

/** Thrown when a file the manifest promised is not there. */
export class ImageCacheMissError extends Error {
  constructor(url: string, status?: number) {
    super(`Cached image missing: ${url}${status ? ` (${status})` : ''}`);
    this.name = 'ImageCacheMissError';
  }
}

/** One variant of one combo, ready to stand in for the model. */
export interface CachedImage {
  /** `<adlibId>/<choice-ids>/<style>/<NN>`, for logs and analytics. */
  key: string;
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
    `<NN>-<frame>.png` for a set's frame, the extension following what the
    model returned. */
export function frameFileName(
  variant: number,
  frame: string,
  mediaType: string,
  characterSet: boolean
): string {
  const extension =
    mediaType === 'image/jpeg' ? 'jpg' : mediaType.split('/')[1] || 'bin';
  return `${variantName(variant)}${
    characterSet ? `-${frame}` : ''
  }.${extension}`;
}

export function comboPath(
  adlibId: string,
  choiceIds: string[],
  style: ImageStyle
): string {
  return `${adlibId}/${choiceIds.join('-')}/${style}`;
}

// One manifest fetch per page per base URL; a failure is remembered as
// "no cache" rather than retried on every Generate.
const manifests = new Map<string, Promise<ImageCacheManifest | undefined>>();

async function fetchManifest(
  versionUrl: string
): Promise<ImageCacheManifest | undefined> {
  try {
    const response = await fetch(`${versionUrl}/manifest.json`);
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as ImageCacheManifest;
  } catch {
    return undefined;
  }
}

export function loadManifest(
  versionUrl: string
): Promise<ImageCacheManifest | undefined> {
  let pending = manifests.get(versionUrl);
  if (!pending) {
    pending = fetchManifest(versionUrl);
    manifests.set(versionUrl, pending);
  }
  return pending;
}

/** Tests: drop remembered manifests. */
export function resetManifestCache() {
  manifests.clear();
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
  adlibId: string;
  /** Option ids in slot order (adlibChoiceIds). */
  choiceIds: string[];
  style: ImageStyle;
  /** The variant shown last time; another is preferred when one exists. */
  avoidVariant?: number;
  /** Override for tests and QA; defaults to the published tree. */
  baseUrl?: string;
  version?: string;
}

/**
 * A variant of the combo the cache holds, chosen at random among those
 * review kept, or undefined when the cache has nothing for it: no manifest,
 * the combo not drawn in that style, or every variant blocked.
 */
export async function findCachedImage(
  params: FindCachedImageParams
): Promise<CachedImage | undefined> {
  const {
    adlibId,
    choiceIds,
    style,
    avoidVariant,
    baseUrl = IMAGE_CACHE_BASE_URL,
    version = IMAGE_CACHE_VERSION,
  } = params;
  const versionUrl = `${baseUrl}${version}`;
  const manifest = await loadManifest(versionUrl);
  const entry = manifest?.adlibs[adlibId];
  const path = comboPath(adlibId, choiceIds, style);
  // The manifest keys combos and blocked variants within their set: the
  // path minus its head.
  const relative = path.slice(adlibId.length + 1);
  const variantCount = entry?.variants[relative] ?? 0;
  if (!manifest || !entry) {
    return undefined;
  }
  const blocked = new Set(manifest.blockList[adlibId] || []);
  let candidates = [...Array(variantCount).keys()].filter(
    v => !blocked.has(`${relative}/${variantName(v)}`)
  );
  if (candidates.length === 0) {
    return undefined;
  }
  if (candidates.length > 1 && avoidVariant !== undefined) {
    candidates = candidates.filter(v => v !== avoidVariant);
  }
  const variant = candidates[Math.floor(Math.random() * candidates.length)];
  const folder = `${versionUrl}/${path}`;
  let sidecar: Promise<CachedSidecar> | undefined;
  const loadSidecar = () => {
    if (!sidecar) {
      sidecar = fetch(`${folder}/${variantName(variant)}.json`).then(
        response => {
          if (!response.ok) {
            throw new ImageCacheMissError(response.url, response.status);
          }
          return response.json() as Promise<CachedSidecar>;
        }
      );
    }
    return sidecar;
  };
  return {
    key: `${path}/${variantName(variant)}`,
    variant,
    characterSet: entry.characterSet,
    sidecar: loadSidecar,
    async raw(frame) {
      const frames = (await loadSidecar()).frames;
      const wanted = entry.characterSet && frame === 'single' ? 'base' : frame;
      const recorded = frames[wanted];
      if (!recorded) {
        throw new ImageCacheMissError(`${folder}/<${wanted}>`);
      }
      return fetchRaw(
        `${folder}/${frameFileName(
          variant,
          wanted,
          recorded.mediaType,
          entry.characterSet
        )}`
      );
    },
  };
}
