import HttpClient from '../util/HttpClient';

export const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

export async function fetchAccessToken() {
  const {value} = await HttpClient.fetchJson<{token: string}>(
    '/ai_gateway/access_token',
    {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
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
