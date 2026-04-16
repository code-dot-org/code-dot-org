import AichatContextManager from '../aichat/aichatContextManager';
import HttpClient from '../util/HttpClient';

export const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

export async function fetchAccessToken() {
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
