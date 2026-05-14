// Generates an illustration for a Panels checkpoint slide via Gemini's
// image model through the AI Gateway, then uploads the result to the AI
// Lessons controller for local storage alongside the lesson JSON.  The
// returned URL is a hosted path served by Rails.
//
// Requires that the lesson has already been saved (so we have a lessonId
// to scope the image directory under).

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH_IMAGE;

const STYLE_PROMPT_PREFIX = `Generate a friendly, colorful illustration for
a slide in a K-12 computer science lesson.  Flat illustration style, light
background, no embedded text.  Subject:`;

interface UploadResponse {
  url?: string;
  message?: string;
}

function extensionFromMediaType(mediaType: string): string {
  if (mediaType.includes('png')) return 'png';
  if (mediaType.includes('webp')) return 'webp';
  if (mediaType.includes('gif')) return 'gif';
  return 'jpg';
}

/**
 * Generates an image for the given panel caption and stores it alongside
 * the lesson.  Returns the served URL on success.
 */
export async function generatePanelImage(
  lessonId: string,
  caption: string
): Promise<string> {
  initAiLessonsGatewayContext();

  const subject = caption.trim();
  if (!subject) {
    throw new Error('Need a non-empty caption to generate an image.');
  }
  if (!lessonId) {
    throw new Error('Save the lesson first so the image can be stored.');
  }

  const response = await generateText({
    model: getModel(MODEL_ID),
    prompt: `${STYLE_PROMPT_PREFIX} ${subject}`,
  });

  const file = response.files?.[0];
  if (!file) {
    throw new Error('The image model did not return an image.');
  }

  const ext = extensionFromMediaType(file.mediaType);
  const blob = new Blob([new Uint8Array(file.uint8Array)], {
    type: file.mediaType,
  });
  const formData = new FormData();
  formData.append('file', blob, `panel-${Date.now()}.${ext}`);

  // Use HttpClient so we get the codebase's CSRF token handling (which
  // falls back to /get_token if the meta tag is stale).  Passing FormData
  // as the body lets the browser set the multipart boundary automatically.
  const uploadResponse = await HttpClient.post(
    `/ai_lessons/${encodeURIComponent(lessonId)}/images`,
    formData,
    true
  );

  const result = (await uploadResponse.json()) as UploadResponse;
  if (!result.url) {
    throw new Error(
      `Image upload returned no URL${
        result.message ? `: ${result.message}` : ''
      }`
    );
  }
  return result.url;
}
