import {transcribe} from '@cdo/apps/aiGateway';

import {getTranscriptionModel} from './helpers/modelHelpers';

/**
 * Transcribes the given audio Blob into text using the Whisper model.
 */
export async function transcribeAudio(audio: Blob): Promise<string> {
  const buffer = await audio.arrayBuffer();
  const result = await transcribe({
    model: getTranscriptionModel(),
    audio: buffer,
  });
  return result.text;
}
