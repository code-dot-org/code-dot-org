import {
  experimental_transcribe as transcribe,
  Experimental_TranscriptionResult as TranscriptionResult,
} from 'ai';

import HttpClient from '../util/HttpClient';

import {GatewayTranscribeResponseV1Schema} from './gatewaySchemas';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';

type TranscribeOptions = Parameters<typeof transcribe>[0];

/**
 * Fulfills the AI SDK transcription API through the AI Gateway.
 */
async function transcribeThroughGateway(
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  const {model, audio, ...restOptions} = options;

  const token = await fetchAccessToken();

  const formData = new FormData();
  formData.append('token', token);
  const audioBlob = await audioToBlob(audio);
  formData.append('audio', audioBlob, 'audio');
  formData.append('model', getModelString(model));

  for (const [key, value] of Object.entries(restOptions)) {
    formData.append(key, String(value));
  }

  const response = await HttpClient.post(
    `${AI_GATEWAY_URL}/transcribe`,
    formData
  );

  const wire = GatewayTranscribeResponseV1Schema.parse(await response.json());

  // The SDK's TranscriptionResult requires `warnings` to be an array;
  // default to empty if the gateway omits it.
  return {
    ...wire,
    warnings: (wire.warnings ?? []) as TranscriptionResult['warnings'],
  } as unknown as TranscriptionResult;
}

async function audioToBlob(audio: TranscribeOptions['audio']): Promise<Blob> {
  if (audio instanceof Blob) {
    return audio;
  } else if (audio instanceof URL) {
    return await fetch(audio).then(r => r.blob());
  } else {
    return new Blob([audio as ArrayBuffer]);
  }
}

export default transcribeThroughGateway;
