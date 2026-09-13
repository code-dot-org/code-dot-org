import {type GeneratedFile} from 'ai';

import {generateText} from '@cdo/apps/aiGateway';
import {AnimationPoses} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  crispScaleFor,
  normalizePixelArtBlob,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {checkImageSafety, checkPromptSafety, markHandled} from './imageSafety';
import {
  ASSUMED_BLOCK,
  ImageSize,
  MODEL_OUTPUT_PX,
  SINGLE_IMAGE_SIZE,
  STORED_MAX_PX,
  getImageModel,
  imageProviderOptions,
} from './modelHelpers';
import {
  cropToContent,
  flattenOntoGround,
  removeBackground,
} from './removeBackground';
import {ImageGenerationMetadata, ImageStyle} from './types';

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
  Pick<ImageGenerationMetadata, 'imageType' | 'style' | 'seed' | 'temperature'>
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
  /** The image is already cropped to content: load-time trimming skips it. */
  trimmed?: boolean;
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

// The model's own output for one request, before any processing. The SDK
// file carries the gateway's bytes and base64 as lazy views of each other,
// so consumers pay only for the form they read.
export type RawImage = GeneratedFile;

export interface ImageRequest {
  seed: number;
  temperature?: number;
  /** Reference images as data URIs, sent ahead of the text in this order. */
  references?: string[];
  /** Output size; single images take SINGLE_IMAGE_SIZE. */
  imageSize?: ImageSize;
  /** The model to ask; single images take getImageModel(). */
  model?: ReturnType<typeof getImageModel>;
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
  const references = request.references || [];
  const {files} = await generateText(
    {
      model: request.model || getImageModel(),
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
    },
    {phase: 'generation'}
  );

  const images = files.filter(f => f.mediaType.startsWith('image/'));
  const imageFile = images[images.length - 1];
  if (!imageFile) {
    throw new Error('No image was generated');
  }
  return imageFile;
}

export function rawImageToBlob(raw: RawImage): Blob {
  return new Blob([new Uint8Array(raw.uint8Array).buffer as ArrayBuffer], {
    type: raw.mediaType,
  });
}

/**
 * Downscale so the longest side fits maxPx; returns the input unchanged when
 * it already does. High-quality filter: downscaling the model's 1K render is
 * what anti-aliases the stored image.
 */
async function downscaleToFit(blob: Blob, maxPx: number): Promise<Blob> {
  try {
    const probe = await createImageBitmap(blob);
    const scale = maxPx / Math.max(probe.width, probe.height);
    if (scale >= 1) {
      probe.close();
      return blob;
    }
    const width = Math.max(1, Math.round(probe.width * scale));
    const height = Math.max(1, Math.round(probe.height * scale));
    probe.close();
    const resized = await createImageBitmap(blob, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(resized, 0, 0);
    resized.close();
    const out = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png')
    );
    return out || blob;
  } catch {
    // e.g. a browser without createImageBitmap resize options: store the
    // full-size image, exactly the pre-downscale behavior.
    return blob;
  }
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
  // Always choose the seed ourselves: the service doesn't report the one it
  // rolls, and an unrecorded roll can never be replayed.
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  // Read the prompt as a sentence before the clauses, without doubling the
  // punctuation a prompt may already end with.
  const sentence = /[.!?]$/.test(prompt) ? prompt : `${prompt}.`;
  let fullPrompt = `${sentence} ${styleClause(style)}`;
  if (imageType === 'sprite') {
    fullPrompt = `${fullPrompt} ${SPRITE_PROMPT_CLAUSE}`;
  } else if (imageType === 'block') {
    fullPrompt = `${fullPrompt} ${BLOCK_PROMPT_CLAUSE}`;
  }

  // The prompt judge and the image model run concurrently — generation is
  // the slow leg, so a safe prompt pays nothing. A flagged prompt outranks
  // a generation failure, and its image is discarded unseen.
  const [promptVerdict, rawResult] = await Promise.allSettled([
    checkPromptSafety(prompt),
    requestImage(
      options.inputImageDataURI
        ? `Modify the provided image: ${fullPrompt}`
        : fullPrompt,
      {
        seed,
        temperature: options.temperature,
        references: options.inputImageDataURI
          ? [options.inputImageDataURI]
          : [],
      }
    ),
  ]);
  if (promptVerdict.status === 'rejected') {
    throw promptVerdict.reason;
  }
  if (rawResult.status === 'rejected') {
    throw rawResult.reason;
  }
  const raw = rawResult.value;
  // Judge the pixels while the local pipeline crops and downscales them.
  const imageVerdict = markHandled(checkImageSafety(raw));

  const generation: ImageGenerationMetadata = {
    prompt,
    imageType,
    style,
    seed,
    ...(options.temperature !== undefined && {
      temperature: options.temperature,
    }),
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
    await imageVerdict;
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
  if (imageType === 'sprite' || imageType === 'block') {
    blob = await removeBackground(blob, {soft: style === 'smooth'});
  }
  // Smooth sprites are cropped like blocks always were, so the stored image
  // is what the runtime trim pass would have made anyway (pixel sprites
  // keep their edge-aligned grid; cropping would shift it).
  let trimmed = false;
  if (imageType === 'block' || (imageType === 'sprite' && style !== 'pixel')) {
    blob = await cropToContent(blob);
    trimmed = true;
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
  } else {
    const maxPx = STORED_MAX_PX[imageType];
    if (maxPx) {
      blob = await downscaleToFit(blob, maxPx);
    }
  }
  await imageVerdict;
  return {
    filename: `generated-${createUuid()}.png`,
    uint8Array: new Uint8Array(await blob.arrayBuffer()),
    mediaType: 'image/png',
    pixelGridSize,
    trimmed,
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
