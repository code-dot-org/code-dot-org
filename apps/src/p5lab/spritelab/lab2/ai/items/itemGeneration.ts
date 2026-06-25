import {generateText} from '@cdo/apps/aiGateway';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';
import {
  AiChatClientTypes,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {getImageModel} from './modelHelpers';
import {removeBackground} from './removeBackground';

// Adapted from Game2 (origin/game2-initial). SpriteLab2 only generates sprites
// (costumes) and backgrounds; the Game2 'block' platformer type is dropped.
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

const AICHAT_REQUESTS_URL = '/aichat_requests';

/**
 * Create an AichatRequest tracking record so the request goes through the
 * standard logging/authorization path the backend expects.
 */
async function createAichatRequest(
  prompt: string,
  channelId?: string
): Promise<number> {
  const payload = {
    newMessage: {chatMessageText: prompt, role: 'user', timestamp: Date.now()},
    storedMessages: [],
    modelParameters: {
      selectedModelId: 'gemini-2.5-flash-image',
      temperature: 1,
    },
    aichatContext: {
      // FLOW_LAB is a trusted chat client (see User#trust_chat_client?), so
      // students can generate without section-level aichat access.
      clientType: AiChatClientTypes.FLOW_LAB,
      currentLevelId: null,
      scriptId: null,
      channelId,
    },
  };

  const response = await HttpClient.post(
    AICHAT_REQUESTS_URL,
    JSON.stringify(payload),
    true,
    {'Content-Type': 'application/json; charset=UTF-8'}
  );

  const {requestId} = (await response.json()) as {requestId: number};
  return requestId;
}

/** Update the AichatRequest record with the final status. */
async function updateAichatRequest(
  requestId: number,
  status: number,
  response?: string
) {
  await HttpClient.put(
    `${AICHAT_REQUESTS_URL}/${requestId}`,
    JSON.stringify({execution_status: status, response}),
    true,
    {'Content-Type': 'application/json; charset=UTF-8'}
  );
}

/**
 * Generate an image from a text prompt using gemini-2.5-flash-image.
 * Follows the same create-request → generate → update-request pattern as aichat.
 * Sprites get a flat green background that is flood-filled to transparency.
 *
 * @returns the generated image as {filename, uint8Array, mediaType}.
 */
export async function generateImage(
  prompt: string,
  channelId?: string,
  itemType: SpriteLab2ItemType = 'sprite',
  style: SpriteLab2ItemStyle = 'smooth'
): Promise<{filename: string; uint8Array: Uint8Array; mediaType: string}> {
  const styleClause = STYLE_PROMPT[style];
  let fullPrompt = `${prompt}. ${styleClause}`;
  if (itemType === 'sprite') {
    fullPrompt = `${fullPrompt} Use a plain solid bright green (#00FF00) background that extends to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on a flat green background.`;
  }

  const requestId = await createAichatRequest(fullPrompt, channelId);

  try {
    const {files} = await generateText({
      model: getImageModel(),
      messages: [{role: 'user', content: fullPrompt}],
    });

    const imageFile = files.find(f => f.mediaType.startsWith('image/'));
    if (!imageFile) {
      await updateAichatRequest(
        requestId,
        AiRequestExecutionStatus.FAILURE,
        'No image generated'
      );
      throw new Error('No image was generated');
    }

    await updateAichatRequest(
      requestId,
      AiRequestExecutionStatus.SUCCESS,
      'Image generated'
    );

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
  } catch (error) {
    await updateAichatRequest(
      requestId,
      AiRequestExecutionStatus.FAILURE,
      String(error)
    ).catch(() => {});
    throw error;
  }
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
