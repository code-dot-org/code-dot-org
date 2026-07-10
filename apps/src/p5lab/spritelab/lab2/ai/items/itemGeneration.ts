import {generateText} from '@cdo/apps/aiGateway';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

import {getImageModel} from './modelHelpers';
import {removeBackground} from './removeBackground';

export type SpriteLab2ItemType = 'sprite' | 'background';

// Visual style. 'pixel' yields crisp pixel art with hard edges (and a sharp,
// 1-bit background cut); 'smooth' yields a shaded illustration (and a feathered,
// anti-aliased cut). See removeBackground's MatteOptions.
export type SpriteLab2ItemStyle = 'smooth' | 'pixel';

// Tacked onto the prompt so the generated image matches the chosen style. Kept
// here (not inline) so the sprite and background prompts stay in sync.
const STYLE_PROMPT: Record<SpriteLab2ItemStyle, string> = {
  pixel:
    'Render as crisp pixel art with a small, limited color palette and ' +
    'hard-edged pixels — no anti-aliasing, gradients, or soft shading.',
  smooth: 'Render as a smooth, cleanly-shaded illustration.',
};

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
): Promise<{filename: string; uint8Array: Uint8Array; mediaType: string}> {
  const styleClause = STYLE_PROMPT[style];
  let fullPrompt = `${prompt}. ${styleClause}`;
  if (itemType === 'sprite') {
    fullPrompt = `${fullPrompt} Use a plain solid bright green (#00FF00) background that extends to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on a flat green background.`;
  }

  const {files} = await generateText({
    model: getImageModel(),
    messages: [{role: 'user', content: fullPrompt}],
  });

  const imageFile = files.find(f => f.mediaType.startsWith('image/'));
  if (!imageFile) {
    throw new Error('No image was generated');
  }

  if (itemType === 'sprite') {
    // Remove the green background (flood-fill from top-left) and output PNG.
    // Pixel art gets a sharp 1-bit cut; smooth art gets a feathered matte.
    const rawBlob = new Blob(
      [new Uint8Array(imageFile.uint8Array).buffer as ArrayBuffer],
      {type: imageFile.mediaType}
    );
    const transparentBlob = await removeBackground(rawBlob, {
      soft: style === 'smooth',
    });
    const transparentBuffer = await transparentBlob.arrayBuffer();
    return {
      filename: `generated-${createUuid()}.png`,
      uint8Array: new Uint8Array(transparentBuffer),
      mediaType: 'image/png',
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
