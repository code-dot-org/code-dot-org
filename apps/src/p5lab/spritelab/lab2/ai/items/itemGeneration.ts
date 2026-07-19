import {generateText} from '@cdo/apps/aiGateway';
import {
  crispScaleFor,
  normalizePixelArtBlob,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {ASSUMED_BLOCK, getImageModel, MODEL_OUTPUT_PX} from './modelHelpers';
import {removeBackground} from './removeBackground';

// 'block' is a square platform tile: drawn full-bleed (no background removal)
// so copies butt seamlessly when laid out on the grid.
export type SpriteLab2ItemType = 'sprite' | 'background' | 'block';

// Visual style. 'pixel' yields crisp pixel art with hard edges (and a sharp,
// 1-bit background cut); 'smooth' yields a shaded illustration (and a feathered,
// anti-aliased cut). See removeBackground's MatteOptions.
export type SpriteLab2ItemStyle = 'smooth' | 'pixel';

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

/**
 * Generate an image from a text prompt using gemini-2.5-flash-image, straight
 * through the AI Gateway (which logs/attributes via AichatContextManager).
 * Sprites get a flat green background that is flood-filled to transparency.
 *
 * @returns the generated image as {filename, uint8Array, mediaType}.
 */
export async function generateImage(
  prompt: string,
  itemType: SpriteLab2ItemType = 'sprite',
  style: SpriteLab2ItemStyle = 'smooth'
): Promise<{
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  // Set when pixel-style output was normalized: physical px per art pixel.
  pixelGridSize?: number;
}> {
  const styleClause = STYLE_PROMPT[style];
  let fullPrompt = `${prompt}. ${styleClause}`;
  if (itemType === 'sprite') {
    fullPrompt = `${fullPrompt} Use a plain solid bright green (#00FF00) background that extends to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on a flat green background.`;
  } else if (itemType === 'block') {
    fullPrompt = `${fullPrompt} Draw a single square tile that fills the entire image edge-to-edge, designed so copies placed side by side tile seamlessly. No border, no background scene — just the tile texture.`;
  }

  const {files} = await generateText({
    model: getImageModel(),
    messages: [{role: 'user', content: fullPrompt}],
  });

  const imageFile = files.find(f => f.mediaType.startsWith('image/'));
  if (!imageFile) {
    throw new Error('No image was generated');
  }

  // One processing pipeline: sprites get the green background removed
  // (flood-fill from top-left; pixel art a sharp 1-bit cut, smooth art a
  // feathered matte), pixel style gets grid-normalized, and any processed
  // image comes back as PNG. A smooth background passes through as-is.
  if (itemType === 'sprite' || style === 'pixel') {
    let blob = new Blob(
      [new Uint8Array(imageFile.uint8Array).buffer as ArrayBuffer],
      {type: imageFile.mediaType}
    );
    if (itemType === 'sprite') {
      blob = await removeBackground(blob, {soft: style === 'smooth'});
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
    };
  }

  const ext = imageFile.mediaType === 'image/png' ? 'png' : 'jpg';
  return {
    filename: `generated-${createUuid()}.${ext}`,
    uint8Array: imageFile.uint8Array,
    mediaType: imageFile.mediaType,
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
