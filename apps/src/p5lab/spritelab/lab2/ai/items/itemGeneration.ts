import {generateText} from '@cdo/apps/aiGateway';
import {
  crispScaleFor,
  normalizePixelArtBlob,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {
  ImageGenerationMetadata,
  SpriteLab2ItemStyle,
  SpriteLab2ItemType,
} from '../../types';

import {ASSUMED_BLOCK, getImageModel, MODEL_OUTPUT_PX} from './modelHelpers';
import {cropToContent, removeBackground} from './removeBackground';

export type {SpriteLab2ItemStyle, SpriteLab2ItemType};

// The logical canvas the prompt asks for: model output size over block size.
const PROMPT_LOGICAL_GRID = MODEL_OUTPUT_PX / ASSUMED_BLOCK;

// Tacked onto the prompt so the generated image matches the chosen style.
// Kept here (not inline) so the sprite and background prompts stay in sync.
// The pixel prompt requests the same block size detection falls back to
// (ASSUMED_BLOCK), so an undetectable grid still matches what was asked for.
const STYLE_PROMPT: Record<SpriteLab2ItemStyle, string> = {
  pixel:
    'Render as crisp pixel art with a small, limited color palette and ' +
    'hard-edged pixels — no anti-aliasing, gradients, or soft shading. ' +
    `Draw on a strict ${PROMPT_LOGICAL_GRID}x${PROMPT_LOGICAL_GRID} pixel ` +
    `grid: every logical pixel is a uniform ${ASSUMED_BLOCK}x` +
    `${ASSUMED_BLOCK} block, perfectly aligned to the image edges.`,
  smooth: 'Render as a smooth, cleanly-shaded illustration.',
};

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
  blob: Blob
): Promise<{blob: Blob; pixelGridSize?: number}> {
  try {
    const normalized = await normalizePixelArtBlob(blob, ASSUMED_BLOCK);
    if (!normalized) {
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

export interface GenerateImageOptions {
  itemType?: SpriteLab2ItemType;
  style?: SpriteLab2ItemStyle;
  // Sampling wildness, 0 (tame) to 2 (wild); omitted = the service default.
  temperature?: number;
  // Replay a specific roll of the randomness; omitted = a fresh roll. The
  // roll actually used is returned in the generation metadata either way.
  seed?: number;
  // When set, the service modifies this image per the prompt instead of
  // drawing from scratch. A data URI (not raw bytes) because the request
  // body is JSON.
  inputImageDataURI?: string;
}

/**
 * Generate an image from a text prompt via the AI Gateway (which
 * logs/attributes via AichatContextManager). Sprites and blocks get a flat
 * key color the model picks to contrast with the subject, flood-filled to
 * transparency.
 *
 * @returns the generated image as {filename, uint8Array, mediaType}, plus
 * the generation metadata to record on its animation.
 */
export async function generateImage(
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<{
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  // Set when pixel-style output was normalized: physical px per art pixel.
  pixelGridSize?: number;
  generation: ImageGenerationMetadata;
}> {
  const {itemType = 'sprite', style = 'smooth'} = options;
  // Always choose the seed ourselves: the service doesn't report the one it
  // rolls, and an unrecorded roll can never be replayed.
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const styleClause = STYLE_PROMPT[style];
  let fullPrompt = `${prompt}. ${styleClause}`;
  if (itemType === 'sprite') {
    fullPrompt = `${fullPrompt} Use a plain solid background of one single flat color that contrasts strongly with the subject and appears nowhere on the subject, extending to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on that flat background.`;
  } else if (itemType === 'block') {
    // Name no drawable object here ("block", "tile") — the model adds it
    // to the picture. Describe only the square-and-margin layout.
    fullPrompt = `${fullPrompt} Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly. Leave a clear margin around all four sides of that square in one plain solid flat color that contrasts strongly with the artwork and appears nowhere in it, extending to the image edges. No background scene — just the artwork on that flat color.`;
  }

  const {files} = await generateText({
    model: getImageModel(),
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
    seed,
    ...(options.temperature !== undefined && {
      temperature: options.temperature,
    }),
  });

  const generation: ImageGenerationMetadata = {
    prompt,
    itemType,
    style,
    seed,
    ...(options.temperature !== undefined && {
      temperature: options.temperature,
    }),
    ...(options.inputImageDataURI && {editedPrevious: true}),
  };

  const imageFile = files.find(f => f.mediaType.startsWith('image/'));
  if (!imageFile) {
    throw new Error('No image was generated');
  }

  // Sprites and blocks get the key-color background removed the same way
  // (both prompts keep the corner as background); blocks are then cropped to
  // content so grid-placed copies tile seamlessly. Pixel style gets
  // grid-normalized; a smooth background passes through as-is.
  if (itemType !== 'background' || style === 'pixel') {
    let blob = new Blob(
      [new Uint8Array(imageFile.uint8Array).buffer as ArrayBuffer],
      {type: imageFile.mediaType}
    );
    if (itemType === 'sprite' || itemType === 'block') {
      blob = await removeBackground(blob, {soft: style === 'smooth'});
    }
    if (itemType === 'block') {
      blob = await cropToContent(blob);
    }
    let pixelGridSize: number | undefined;
    if (style === 'pixel') {
      const normalized = await normalizeIfPixelArt(blob);
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

  const ext = imageFile.mediaType === 'image/png' ? 'png' : 'jpg';
  return {
    filename: `generated-${createUuid()}.${ext}`,
    uint8Array: imageFile.uint8Array,
    mediaType: imageFile.mediaType,
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
