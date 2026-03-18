import {generateText} from '@cdo/apps/aiGateway';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';
import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {getImageModel} from './modelHelpers';
import {removeBackground} from './removeBackground';

const AICHAT_REQUESTS_URL = '/aichat_requests';

/**
 * Create an AichatRequest tracking record so the request goes through the
 * standard logging/authorization path that the backend expects.
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
      clientType: 'aichat',
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

/**
 * Update the AichatRequest record with the final status.
 */
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
 *
 * Follows the same create-request → generate → update-request pattern as aichat.
 *
 * @returns the generated image file as a {filename, uint8Array, mediaType} object.
 */
export async function generateImage(
  prompt: string,
  channelId?: string
): Promise<{filename: string; uint8Array: Uint8Array; mediaType: string}> {
  const requestId = await createAichatRequest(prompt, channelId);

  try {
    const {files} = await generateText({
      model: getImageModel(),
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
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

    // Remove background (flood-fill from top-left corner) and output as PNG.
    const rawBlob = new Blob(
      [new Uint8Array(imageFile.uint8Array).buffer as ArrayBuffer],
      {type: imageFile.mediaType}
    );
    const transparentBlob = await removeBackground(rawBlob);
    const transparentBuffer = await transparentBlob.arrayBuffer();

    const filename = `generated-${createUuid()}.png`;

    return {
      filename,
      uint8Array: new Uint8Array(transparentBuffer),
      mediaType: 'image/png',
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
 *
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
 * List existing asset filenames for a project.
 */
export async function listProjectAssets(
  channelId: string
): Promise<{filename: string}[]> {
  const response = await fetch(`/v3/assets/${channelId}/`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}
