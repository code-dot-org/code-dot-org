import AichatContextManager from '../aichat/aichatContextManager';
import HttpClient, {isNetworkError} from '../util/HttpClient';

export const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

export async function fetchAccessToken() {
  try {
    const response = await HttpClient.post(
      '/ai_gateway/access_token',
      JSON.stringify({
        aichatContext: AichatContextManager.getContext(),
      }),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
    const value = (await response.json()) as {token: string};
    return value.token;
  } catch (error) {
    // Surface the server's specific reason (e.g. a denied safety-checks
    // bypass request) instead of a generic "403 Forbidden". Clone before
    // reading: reportGatewayError() further up the call chain also reads
    // this same response body, and a body can only be consumed once
    // without cloning first.
    if (isNetworkError(error)) {
      const body = await error.response
        .clone()
        .json()
        .catch(() => null);
      if (body?.message) {
        error.message = body.message;
      }
    }
    throw error;
  }
}

export function getModelString(model: unknown) {
  let modelString: string;

  if (typeof model === 'string') {
    modelString = model;
  } else {
    const safeModel = model as unknown as Record<string, unknown>;
    if (
      safeModel !== null &&
      typeof safeModel === 'object' &&
      typeof safeModel.modelId === 'string'
    ) {
      modelString = safeModel.modelId;
    } else {
      throw new Error('Invalid model provided to Gateway.');
    }
  }
  return modelString;
}
