import {
  generateImage as gatewayGenerateImage,
  generateText,
} from '@cdo/apps/aiGateway';
import {
  crispScaleFor,
  normalizePixelArtBlob,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {
  ASSUMED_BLOCK,
  DEFAULT_IMAGE_MODEL_ID,
  getImageModel,
  getImageModelSpec,
  MODEL_OUTPUT_PX,
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

// How the subject is placed in the frame, per image type. A sprite and a
// block both need their surroundings cut away; the two clauses differ only in
// how the cut is made. A model that emits real alpha is asked for
// transparency; one that cannot is asked for a flat key color that
// removeBackground() floods out afterwards. Naming no drawable object here
// ("block", "tile") matters — the model draws whatever it is told about.
const TILE_LAYOUT =
  'Compose the artwork to completely fill one large centered square region, ' +
  'edge to edge, so that copies placed side by side connect seamlessly.';

function compositionClause(
  imageType: ImageType,
  nativeTransparency: boolean
): string {
  if (imageType === 'sprite') {
    return nativeTransparency
      ? 'Place the subject on a fully transparent background. Do not include ' +
          'any scenery, ground, sky, or other background elements — only the ' +
          'subject.'
      : 'Use a plain solid background of one single flat color that contrasts ' +
          'strongly with the subject and appears nowhere on the subject, ' +
          'extending to all edges. Do not include any scenery, ground, sky, or ' +
          'other background elements — only the subject on that flat background.';
  }
  if (imageType === 'block') {
    return nativeTransparency
      ? `${TILE_LAYOUT} Leave a clear fully transparent margin around all four ` +
          'sides of that square. No background scene — just the artwork.'
      : `${TILE_LAYOUT} Leave a clear margin around all four sides of that ` +
          'square in one plain solid flat color that contrasts strongly with ' +
          'the artwork and appears nowhere in it, extending to the image edges. ' +
          'No background scene — just the artwork on that flat color.';
  }
  return '';
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

/** The bytes a model produced, however it was reached. */
interface RawGeneratedImage {
  uint8Array: Uint8Array;
  mediaType: string;
}

/**
 * A language model that emits image parts (Gemini 2.5 Flash Image). The
 * image arrives as a file attached to a text response, and the model takes
 * a seed and a temperature like any other chat model.
 */
async function requestViaGenerateText(
  spec: ImageModelSpec,
  fullPrompt: string,
  options: GenerateImageOptions,
  seed?: number
): Promise<RawGeneratedImage> {
  const {files} = await generateText({
    model: getImageModel(spec.id),
    messages: [
      {
        role: 'user',
        content: options.inputImageDataURI
          ? [
              {type: 'image', image: options.inputImageDataURI},
              {type: 'text', text: `Modify the provided image: ${fullPrompt}`},
            ]
          : fullPrompt,
      },
    ],
    ...(seed !== undefined && {seed}),
    ...(options.temperature !== undefined &&
      spec.supportsTemperature && {temperature: options.temperature}),
  });

  const imageFile = files.find(f => f.mediaType.startsWith('image/'));
  if (!imageFile) {
    throw new Error('No image was generated');
  }
  return {uint8Array: imageFile.uint8Array, mediaType: imageFile.mediaType};
}

/**
 * A true image model (gpt-image-1). Sending input images turns the call into
 * an edit. Transparency is a request parameter here rather than something
 * the prompt asks for and the canvas fixes up afterwards, so backgrounds —
 * the one type that must stay opaque — ask for opaque explicitly.
 */
async function requestViaGenerateImage(
  spec: ImageModelSpec,
  fullPrompt: string,
  options: GenerateImageOptions,
  imageType: ImageType
): Promise<RawGeneratedImage> {
  const {image} = await gatewayGenerateImage({
    model: spec.id,
    prompt: options.inputImageDataURI
      ? `Modify the provided image: ${fullPrompt}`
      : fullPrompt,
    ...(options.inputImageDataURI && {
      images: [splitDataURI(options.inputImageDataURI)],
    }),
    size: `${spec.outputPx}x${spec.outputPx}`,
    providerOptions: {
      openai: {
        background: imageType === 'background' ? 'opaque' : 'transparent',
        output_format: 'png',
      },
    },
  });
  return {uint8Array: image.uint8Array, mediaType: image.mediaType};
}

/**
 * Generate an image from a text prompt via the AI Gateway (which
 * logs/attributes via AichatContextManager). Which model, and so which
 * gateway route, comes from options.model; see modelHelpers for what each
 * one can do. Sprites and blocks come back with their surroundings cut
 * away — natively where the model can, by flood-filling a flat key color
 * where it cannot.
 */
export async function generateImage(
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<GeneratedImageResult> {
  const {imageType = 'sprite', style = 'smooth'} = options;
  const model = options.model ?? DEFAULT_IMAGE_MODEL_ID;
  const spec = getImageModelSpec(model);
  // Always choose the seed ourselves: the service doesn't report the one it
  // rolls, and an unrecorded roll can never be replayed. A model that cannot
  // seed gets none, and records none — an unreplayable seed on the animation
  // would offer the dialog a "same seed" it could not honor.
  const seed = spec.supportsSeed
    ? options.seed ?? Math.floor(Math.random() * 2 ** 31)
    : undefined;
  const composition = compositionClause(imageType, spec.nativeTransparency);
  const fullPrompt = [`${prompt}. ${STYLE_PROMPT[style]}`, composition]
    .filter(Boolean)
    .join(' ');

  const imageFile =
    spec.transport === 'generateImage'
      ? await requestViaGenerateImage(spec, fullPrompt, options, imageType)
      : await requestViaGenerateText(spec, fullPrompt, options, seed);

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
    imageFile.mediaType === 'image/jpeg'
  ) {
    return {
      filename: `generated-${createUuid()}.jpg`,
      uint8Array: imageFile.uint8Array,
      mediaType: imageFile.mediaType,
      generation,
    };
  }

  // Sprites and blocks get the key-color background removed the same way
  // (both prompts keep the corner as background); blocks are then cropped to
  // content so grid-placed copies tile seamlessly. Backgrounds are flattened
  // opaque; pixel style gets grid-normalized.
  let blob = new Blob(
    [new Uint8Array(imageFile.uint8Array).buffer as ArrayBuffer],
    {type: imageFile.mediaType}
  );
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
