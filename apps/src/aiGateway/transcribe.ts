import * as Observability from '@code-dot-org/core/plugins/observability';
import {
  experimental_transcribe as transcribe,
  Experimental_TranscriptionResult as TranscriptionResult,
} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

import AichatContextManager from '../aichat/aichatContextManager';

import {
  CURRENT_SCHEMA_VERSION,
  CurrentGatewayTranscribeResponseSchema,
  type CurrentGatewayTranscribeResponse,
} from './contract/gatewaySchemas';
import {reportGatewayError} from './logHelper';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';
import {
  fetchTurnstileToken,
  turnstileErrorTags,
  turnstileHeaders,
} from './turnstile';

type TranscribeOptions = Parameters<typeof transcribe>[0];

/**
 * Fulfills the AI SDK transcription API through the AI Gateway.
 */
async function transcribeThroughGateway(
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  const {model, audio, ...restOptions} = options;
  const modelString = getModelString(model);
  const clientType = AichatContextManager.getContext().clientType;

  let schemaErrorReported = false;
  const execute = async (): Promise<TranscriptionResult> => {
    try {
      // Serialized, not parallel: the access token response carries the
      // Turnstile mode that decides whether a challenge is needed at all.
      const {token, turnstileEnforcementMode} = await fetchAccessToken();
      const turnstileToken = await fetchTurnstileToken(
        turnstileEnforcementMode
      );

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
        {
          'X-AI-Gateway-Schema-Version': CURRENT_SCHEMA_VERSION,
          'x-ai-gateway-phase': 'transcription',
          ...turnstileHeaders(turnstileToken),
        }
      );

      const rawResponse = await response.json();
      const parseResult =
        CurrentGatewayTranscribeResponseSchema.safeParse(rawResponse);
      if (!parseResult.success) {
        await reportGatewayError(
          parseResult.error,
          'transcribeThroughGateway',
          modelString,
          {'error.category': 'schema-mismatch'}
        );
        schemaErrorReported = true;
        if (process.env.NODE_ENV === 'development') {
          throw parseResult.error;
        }
      }
      const wire = parseResult.success
        ? parseResult.data
        : (rawResponse as CurrentGatewayTranscribeResponse);

      return {
        ...wire,
        warnings: (wire.warnings ?? []) as TranscriptionResult['warnings'],
      } as unknown as TranscriptionResult;
    } catch (error) {
      if (!schemaErrorReported) {
        await reportGatewayError(
          error,
          'transcribeThroughGateway',
          modelString,
          turnstileErrorTags(error)
        );
      }
      throw error;
    }
  };
  // Start a Sentry span around the entire gateway call for better observability.
  return Observability.startSpan(
    {
      name: 'ai-gateway.transcribe',
      op: 'ai.transcribe',
      attributes: {
        'ai.model': modelString,
        'ai.client_type': clientType,
        feature: 'ai-gateway',
      },
    },
    execute
  );
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
