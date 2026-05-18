import {
  experimental_transcribe as transcribe,
  Experimental_TranscriptionResult as TranscriptionResult,
} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  GatewayTranscribeResponseV1Schema,
  type GatewayTranscribeResponseV1,
} from './gatewaySchemas';
import {getErrorLogData} from './logHelper';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';
import {
  fetchTurnstileTokenIfEnabled,
  turnstileHeaders,
} from './turnstile';
import {LOG} from './turnstile/constants';

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
      fetchTurnstileTokenIfEnabled(),
    ]);

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
      formData,
      false,
      turnstileHeaders(turnstileToken)
    );

    const rawResponse = await response.json();
    const parseResult = GatewayTranscribeResponseV1Schema.safeParse(rawResponse);
    if (!parseResult.success) {
      console.error(
        `${LOG} transcribe response schema mismatch:`,
        parseResult.error.errors
      );
      if (process.env.NODE_ENV === 'development') {
        throw parseResult.error;
      }
    }
    const wire = parseResult.success
      ? parseResult.data
      : (rawResponse as GatewayTranscribeResponseV1);

    return {
      ...wire,
      warnings: (wire.warnings ?? []) as TranscriptionResult['warnings'],
    } as unknown as TranscriptionResult;
  } catch (error) {
    const logData = await getErrorLogData(error);
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
