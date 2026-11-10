import {afterEach, describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../transports/types';
import {
  aiGatewayUrl,
  createAiGatewayApi,
  DEFAULT_AI_GATEWAY_URL,
  parseTurnstileEnforcementMode,
} from '../aiGateway.api';

function mockTransport(
  token: object,
  reply: unknown = {text: 'hi', finishReason: 'stop'},
) {
  return {
    request: vi.fn().mockResolvedValueOnce(token).mockResolvedValueOnce(reply),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  } satisfies Transport;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('parseTurnstileEnforcementMode', () => {
  it('takes the three modes and makes anything else disabled', () => {
    expect(parseTurnstileEnforcementMode('enforce')).toBe('enforce');
    expect(parseTurnstileEnforcementMode('monitor')).toBe('monitor');
    expect(parseTurnstileEnforcementMode(false)).toBe('disabled');
    expect(parseTurnstileEnforcementMode(undefined)).toBe('disabled');
  });
});

describe('aiGatewayUrl', () => {
  it('is the production gateway unless the environment names another', () => {
    expect(aiGatewayUrl()).toBe(DEFAULT_AI_GATEWAY_URL);
    vi.stubEnv('VITE_AI_GATEWAY_URL', 'https://gateway.example.org');
    expect(aiGatewayUrl()).toBe('https://gateway.example.org');
  });

  it("puts a path on the page's own server", () => {
    vi.stubEnv('VITE_AI_GATEWAY_URL', '/__ai-gateway');
    vi.stubGlobal('location', {origin: 'http://localhost:3036'});
    expect(aiGatewayUrl()).toBe('http://localhost:3036/__ai-gateway');
  });
});

describe('createAiGatewayApi', () => {
  it('POSTs a fresh token and the options to the gateway', async () => {
    const transport = mockTransport({token: 'jwt'});
    const result = await createAiGatewayApi(transport).generateText(
      {model: 'gemini-x', prompt: 'hello'},
      {phase: 'generation', aichatContext: {level: 1}},
    );
    expect(transport.request).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/ai_gateway/access_token',
      body: {aichatContext: {level: 1}},
    });
    expect(transport.request).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: DEFAULT_AI_GATEWAY_URL,
      headers: {
        'X-AI-Gateway-Schema-Version': '2',
        'x-ai-gateway-phase': 'generation',
      },
      body: {model: 'gemini-x', prompt: 'hello', token: 'jwt'},
    });
    expect(result).toMatchObject({text: 'hi', finishReason: 'stop', files: []});
  });

  it('decodes returned files', async () => {
    const transport = mockTransport(
      {token: 'jwt'},
      {finishReason: 'stop', files: [{mediaType: 'image/png', base64: 'AQID'}]},
    );
    const {text, files} = await createAiGatewayApi(transport).generateText({
      model: 'gemini-x',
    });
    expect(text).toBe('');
    expect(Array.from(files[0].uint8Array)).toEqual([1, 2, 3]);
  });

  it('refuses a call the gateway would reject for want of Turnstile', async () => {
    const transport = mockTransport({
      token: 'jwt',
      turnstileEnforcementMode: 'enforce',
    });
    await expect(
      createAiGatewayApi(transport).generateText({model: 'gemini-x'}),
    ).rejects.toThrow(/Turnstile/);
    expect(transport.request).toHaveBeenCalledTimes(1);
  });

  it('rejects a reply outside the contract', async () => {
    const transport = mockTransport({token: 'jwt'}, {text: 'no finishReason'});
    await expect(
      createAiGatewayApi(transport).generateText({model: 'gemini-x'}),
    ).rejects.toThrow();
  });
});
