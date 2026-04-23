import {
  experimental_transcribe as transcribe,
  Experimental_TranscriptionResult as TranscriptionResult,
} from 'ai';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

import {getErrorLogData} from './logHelper';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';
import {TurnstileManager} from './turnstile';

type TranscribeOptions = Parameters<typeof transcribe>[0];

/**
 * Fulfills the AI SDK transcription API through the AI Gateway.
 */
async function transcribeThroughGateway(
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  try {
    const {model, audio, ...restOptions} = options;

    const [token, turnstileToken] = await Promise.all([
      fetchAccessToken(),
      experiments.isEnabledAllowingQueryString('useTurnstile')
        ? TurnstileManager.getInstance().getTurnstileToken()
        : Promise.resolve(null),
    ]);

    const formData = new FormData();
    formData.append('token', token);
    const audioBlob = await audioToBlob(audio);
    formData.append('audio', audioBlob, 'audio');
    formData.append('model', getModelString(model));

    for (const [key, value] of Object.entries(restOptions)) {
      formData.append(key, String(value));
    }

    const headers: Record<string, string> = {};
    if (turnstileToken) headers['X-Turnstile-Token'] = turnstileToken;

    const response = await HttpClient.post(
      `${AI_GATEWAY_URL}/transcribe`,
      formData,
      false,
      headers
    );

    return await response.json();
  } catch (error) {
    const logData = getErrorLogData(error);
    console.error('Fetch error in transcribeThroughGateway:', logData);
    throw error;
  }
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
