import {
  generateImage as gatewayGenerateImage,
  generateText,
} from '@cdo/apps/aiGateway';
import {AnimationPoses} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  crispScaleFor,
  normalizePixelArtBlob,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {
  ASSUMED_BLOCK,
  DEFAULT_IMAGE_MODEL_ID,
  ImageSize,
  MODEL_OUTPUT_PX,
  SINGLE_IMAGE_SIZE,
  getImageModel,
  getImageModelSpec,
  imageProviderOptions,
  type ImageModelSpec,
} from './modelHelpers';
import {
  cropToContent,
  flattenOntoGround,
  removeBackground,
} from './removeBackground';
import {ImageGenerationMetadata, ImageStyle, ImageType} from './types';

// The logical canvas the prompt asks for: model output size over block size.
const PROMPT_LOGICAL_GRID = MODEL_OUTPUT_PX / ASSUMED_BLOCK;

// Tacked onto the prompt so the generated image matches the chosen style.
// Kept here (not inline) so the sprite and background prompts stay in sync.
// The pixel prompt requests the same block size detection falls back to
// (ASSUMED_BLOCK), so an undetectable grid still matches what was asked for.
const STYLE_PROMPT: Record<ImageStyle, string> = {
  pixel:
    'Render as crisp pixel art with a small, limited color palette and ' +
    'hard-edged pixels — no anti-aliasing, gradients, or soft shading. ' +
    `Draw on a strict ${PROMPT_LOGICAL_GRID}x${PROMPT_LOGICAL_GRID} pixel ` +
    `grid: every logical pixel is a uniform ${ASSUMED_BLOCK}x` +
    `${ASSUMED_BLOCK} block, perfectly aligned to the image edges.`,
  smooth: 'Render as a smooth, cleanly-shaded illustration.',
};

export function styleClause(style: ImageStyle): string {
  return STYLE_PROMPT[style];
}

// Asks for the flat key color a costume is keyed out against afterwards
// (removeBackground flood-fills it from the corners). The character-set
// generator asks for a NAMED key color in its own prompts instead.
const SPRITE_PROMPT_CLAUSE =
  'Use a plain solid background of one single flat color that contrasts strongly with the subject and appears nowhere on the subject, extending to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on that flat background.';

// Name no drawable object here ("block", "tile") — the model adds it to the
// picture. Describe only the square-and-margin layout.
const BLOCK_PROMPT_CLAUSE =
  'Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly. Leave a clear margin around all four sides of that square in one plain solid flat color that contrasts strongly with the artwork and appears nowhere in it, extending to the image edges. No background scene — just the artwork on that flat color.';

// The same two compositions asked of a model that emits a real alpha
// channel. Transparency is a request parameter there, so the prompt must not
// also ask for the flat color the keyed path floods out afterwards.
const SPRITE_TRANSPARENT_CLAUSE =
  'Place the subject on a fully transparent background. Do not include any scenery, ground, sky, or other background elements — only the subject.';

const BLOCK_TRANSPARENT_CLAUSE =
  'Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly. Leave a clear fully transparent margin around all four sides of that square. No background scene — just the artwork.';

/** How the subject sits in the frame, per image type and per model. */
function compositionClause(
  imageType: ImageType,
  nativeTransparency: boolean
): string {
  if (imageType === 'sprite') {
    return nativeTransparency
      ? SPRITE_TRANSPARENT_CLAUSE
      : SPRITE_PROMPT_CLAUSE;
  }
  if (imageType === 'block') {
    return nativeTransparency ? BLOCK_TRANSPARENT_CLAUSE : BLOCK_PROMPT_CLAUSE;
  }
  return '';
}

// A data URI carries its media type in the prefix; the generateImage wire
// format wants the two apart.
function splitDataURI(dataURI: string): {base64: string; mediaType: string} {
  const match = /^data:([^;,]+)[^,]*,([\s\S]*)$/.exec(dataURI);
  if (!match) {
    throw new Error('Not a base64 data URI');
  }
  return {mediaType: match[1], base64: match[2]};
}

/**
 * Pixel-style output depicts pixel art at ~1024x1024 with one art pixel per
 * ~10-20px block (the model can't emit small canvases). Normalize: detect the
 * block grid, downsample to true logical resolution, and re-upscale
 * nearest-neighbor — uniform, edge-aligned blocks that the pixel editor can
 * edit at art-pixel granularity. Left unchanged (no grid size) when no grid
 * is detected. The returned pixelGridSize (physical pixels per art pixel) is
 * recorded on the animation so the editor never has to re-detect.
 */
async function normalizeIfPixelArt(
  blob: Blob,
  {squareGrid = false} = {}
): Promise<{blob: Blob; pixelGridSize?: number}> {
  try {
    // A background must stay square and full-frame (it letterboxes over the
    // stage otherwise), so its grid is pinned square to the frame instead of
    // following a detected offset.
    const normalized = await normalizePixelArtBlob(blob, ASSUMED_BLOCK, {
      squareGrid,
    });
    if (
      !normalized ||
      (squareGrid && normalized.logicalWidth !== normalized.logicalHeight)
    ) {
      return {blob};
    }
    return {
      blob: normalized.blob,
      pixelGridSize: crispScaleFor(
        normalized.logicalWidth,
        normalized.logicalHeight
      ),
    };
  } catch {
    return {blob};
  }
}

/** What to generate; every omitted field falls back to a default. */
export type GenerateImageOptions = Partial<
  Pick<
    ImageGenerationMetadata,
    'imageType' | 'style' | 'seed' | 'temperature' | 'model'
  >
> & {
  /**
   * Modify this image per the prompt instead of drawing from scratch. A
   * data URI, not raw bytes: the request body is JSON.
   */
  inputImageDataURI?: string;
};

export interface GeneratedImageResult {
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  /** Set when pixel-style output was normalized: physical px per art pixel. */
  pixelGridSize?: number;
  /** How this image was made, to record on its animation. */
  generation: ImageGenerationMetadata;
  /**
   * Set on a sprite sheet: its frame grid (cells row by row, wrapping at the
   * image width) and playback; `poses` names the ranges of a character set.
   */
  frames?: {
    frameSize: {x: number; y: number};
    frameCount: number;
    frameDelay: number;
    looping: boolean;
    poses?: AnimationPoses;
  };
}

/** The model's own output for one request, before any processing. */
export interface RawImage {
  uint8Array: Uint8Array;
  mediaType: string;
}

export interface ImageRequest {
  /** Absent for a model that does not take one; see ImageModelSpec. */
  seed?: number;
  temperature?: number;
  /** Reference images as data URIs, sent ahead of the text in this order. */
  references?: string[];
  /** Output size; single images take SINGLE_IMAGE_SIZE. */
  imageSize?: ImageSize;
  /**
   * Which model to ask, by id. Decides the transport: an id whose spec says
   * generateImage goes to the gateway's image route instead of generateText.
   * Absent means the default single-image model.
   */
  modelId?: string;
  /**
   * An already-resolved model object for the generateText path. Character
   * sets pass their own; ignored when modelId names an image-model
   * transport, which takes a bare id rather than an SDK model.
   */
  model?: ReturnType<typeof getImageModel>;
  /**
   * Ask a model with native transparency for an alpha channel. Meaningless
   * on the generateText path, where transparency is prompted for and keyed
   * out locally instead.
   */
  transparentBackground?: boolean;
}

/**
 * A true image model (gpt-image-1 and its successors). Reference images turn
 * the call into an edit. Transparency is a request parameter here rather
 * than something the prompt asks for and the canvas fixes up afterwards.
 */
async function requestImageModel(
  text: string,
  request: ImageRequest,
  spec: ImageModelSpec
): Promise<RawImage> {
  const references = request.references || [];
  const {image} = await gatewayGenerateImage({
    model: spec.id,
    prompt: text,
    ...(references.length && {images: references.map(splitDataURI)}),
    size: `${spec.outputPx}x${spec.outputPx}`,
    providerOptions: {
      openai: {
        background: request.transparentBackground ? 'transparent' : 'opaque',
        output_format: 'png',
      },
    },
  });
  return {uint8Array: image.uint8Array, mediaType: image.mediaType};
}

/**
 * One image request through the AI Gateway (which logs/attributes via
 * AichatContextManager). Returns the finished image: a thinking image model
 * emits interim drafts as image files ahead of the final render, so the
 * last image file is the one to keep.
 */
export async function requestImage(
  text: string,
  request: ImageRequest
): Promise<RawImage> {
  const spec = getImageModelSpec(request.modelId);
  if (spec.transport === 'generateImage') {
    return requestImageModel(text, request, spec);
  }

  const references = request.references || [];
  const {files} = await generateText({
    model: request.model || getImageModel(request.modelId),
    messages: [
      {
        role: 'user',
        content: references.length
          ? [
              ...references.map(image => ({type: 'image' as const, image})),
              {type: 'text' as const, text},
            ]
          : text,
      },
    ],
    seed: request.seed,
    ...(request.temperature !== undefined && {
      temperature: request.temperature,
    }),
    providerOptions: imageProviderOptions(
      request.imageSize || SINGLE_IMAGE_SIZE
    ),
  });

  const images = files.filter(f => f.mediaType.startsWith('image/'));
  const imageFile = images[images.length - 1];
  if (!imageFile) {
    throw new Error('No image was generated');
  }
  return {uint8Array: imageFile.uint8Array, mediaType: imageFile.mediaType};
}

export function rawImageToBlob(raw: RawImage): Blob {
  return new Blob([new Uint8Array(raw.uint8Array).buffer as ArrayBuffer], {
    type: raw.mediaType,
  });
}

export function bytesToDataURI(bytes: Uint8Array, mediaType: string): string {
  let binary = '';
  // Chunked: spreading a megabyte-scale array overflows the argument limit.
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return `data:${mediaType};base64,${btoa(binary)}`;
}

/**
 * Generate an image from a text prompt. Sprites and blocks get a flat key
 * color the model picks to contrast with the subject, flood-filled to
 * transparency.
 */
export async function generateImage(
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<GeneratedImageResult> {
  const {imageType = 'sprite', style = 'smooth'} = options;
  const spec = getImageModelSpec(options.model ?? DEFAULT_IMAGE_MODEL_ID);
  // Always choose the seed ourselves: the service doesn't report the one it
  // rolls, and an unrecorded roll can never be replayed. A model that cannot
  // seed gets none, and records none — an unreplayable seed on the animation
  // would offer the dialog a "same seed" it could not honor.
  const seed = spec.supportsSeed
    ? options.seed ?? Math.floor(Math.random() * 2 ** 31)
    : undefined;
  const composition = compositionClause(imageType, spec.nativeTransparency);
  const fullPrompt = [`${prompt}. ${styleClause(style)}`, composition]
    .filter(Boolean)
    .join(' ');

  const raw = await requestImage(
    options.inputImageDataURI
      ? `Modify the provided image: ${fullPrompt}`
      : fullPrompt,
    {
      seed,
      modelId: spec.id,
      ...(spec.supportsTemperature && {temperature: options.temperature}),
      references: options.inputImageDataURI ? [options.inputImageDataURI] : [],
      transparentBackground: imageType !== 'background',
    }
  );

  const generation: ImageGenerationMetadata = {
    prompt,
    imageType,
    style,
    model: spec.id,
    ...(seed !== undefined && {seed}),
    ...(options.temperature !== undefined &&
      spec.supportsTemperature && {temperature: options.temperature}),
    ...(options.inputImageDataURI && {editedPrevious: true}),
  };

  // A smooth background delivered as JPEG passes through as-is — JPEG has
  // no alpha to flatten, and re-encoding a photographic image to PNG would
  // balloon it. Every other output goes through the canvas pipeline below.
  if (
    imageType === 'background' &&
    style !== 'pixel' &&
    raw.mediaType === 'image/jpeg'
  ) {
    return {
      filename: `generated-${createUuid()}.jpg`,
      uint8Array: raw.uint8Array,
      mediaType: raw.mediaType,
      generation,
    };
  }

  // Sprites and blocks get the key-color background removed the same way
  // (both prompts keep the corner as background); blocks are then cropped to
  // content so grid-placed copies tile seamlessly. Backgrounds are flattened
  // opaque; pixel style gets grid-normalized.
  let blob = rawImageToBlob(raw);
  // Keying a model that already returned alpha would sample a transparent
  // corner and cut nothing, at best; cropToContent below reads the same
  // alpha either way.
  if (
    (imageType === 'sprite' || imageType === 'block') &&
    !spec.nativeTransparency
  ) {
    blob = await removeBackground(blob, {soft: style === 'smooth'});
  }
  if (imageType === 'block') {
    blob = await cropToContent(blob);
  }
  if (imageType === 'background') {
    blob = await flattenOntoGround(blob);
  }
  let pixelGridSize: number | undefined;
  if (style === 'pixel') {
    const normalized = await normalizeIfPixelArt(blob, {
      squareGrid: imageType === 'background',
    });
    blob = normalized.blob;
    pixelGridSize = normalized.pixelGridSize;
  }
  return {
    filename: `generated-${createUuid()}.png`,
    uint8Array: new Uint8Array(await blob.arrayBuffer()),
    mediaType: 'image/png',
    pixelGridSize,
    generation,
  };
}

/**
 * Upload a generated image to the project's asset bucket.
 * @returns the URL of the uploaded asset.
 */
export async function uploadAssetToProject(
  channelId: string,
  filename: string,
  data: Uint8Array,
  mediaType: string
): Promise<string> {
  const url = `/v3/assets/${channelId}/${encodeURIComponent(filename)}`;
  const buffer = new Uint8Array(data).buffer as ArrayBuffer;
  await HttpClient.put(url, new Blob([buffer], {type: mediaType}), true, {
    'Content-Type': mediaType,
  });
  return url;
}

/**
 * Upload a generated image to the level's starter assets.
 * @returns the URL of the uploaded asset.
 */
export async function uploadAssetToLevel(
  levelName: string,
  filename: string,
  data: Uint8Array,
  mediaType: string
): Promise<string> {
  const extension = filename.split('.').pop() || 'png';
  const uuidName = `${createUuid()}.${extension}`;
  const url = `/level_starter_assets/${encodeURIComponent(
    levelName
  )}/uuid/${uuidName}`;
  const buffer = new Uint8Array(data).buffer as ArrayBuffer;
  const bodyData = new FormData();
  bodyData.append('files[]', new File([buffer], uuidName, {type: mediaType}));
  await HttpClient.post(url, bodyData, true);
  return url;
}

/**
 * Uploads an image to wherever the current context persists images.
 * @returns the URL of the uploaded asset.
 */
export type UploadImageFunction = (
  filename: string,
  data: Uint8Array,
  mediaType: string
) => Promise<string>;
