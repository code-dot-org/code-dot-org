import {AichatContext} from '@cdo/apps/aichat/types';
import generateTextThroughGateway from '@cdo/apps/aiGateway/generateText';
import {
  AI_GATEWAY_URL,
  clearAccessTokenCache,
} from '@cdo/apps/aiGateway/shared';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: (_options: unknown, callback: () => unknown) => callback(),
}));

jest.mock('@cdo/apps/aiGateway/logHelper', () => ({
  reportGatewayError: jest.fn(),
}));

jest.mock('@cdo/apps/aiGateway/turnstile', () => ({
  fetchTurnstileToken: jest.fn(async () => undefined),
  turnstileErrorTags: jest.fn(() => ({})),
  turnstileHeaders: jest.fn(() => ({})),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  __esModule: true,
  default: {post: jest.fn()},
}));

const mockPost = HttpClient.post as jest.Mock;

const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.AI_TUTOR,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};

const base64url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeJwt = (id: number) => {
  const now = Math.floor(Date.now() / 1000);
  return [
    base64url(JSON.stringify({alg: 'RS256'})),
    base64url(
      JSON.stringify({
        issued_at_time: now - 5,
        expiration_time: now + 60,
        token_id: `id-${id}`,
      })
    ),
    'signature',
  ].join('.');
};

const generate = () =>
  generateTextThroughGateway(
    {model: 'gemini', prompt: 'hello'},
    {aichatContext, phase: 'generation'}
  );

const tokenRequests = () =>
  mockPost.mock.calls.filter(([url]) => url === '/ai_gateway/access_token');

describe('generateTextThroughGateway access tokens', () => {
  let gatewayStatus: number;

  beforeEach(() => {
    clearAccessTokenCache();
    gatewayStatus = 200;
    let issued = 0;
    mockPost.mockImplementation(async (url: string) => {
      if (url === '/ai_gateway/access_token') {
        const token = makeJwt(++issued);
        return {json: async () => ({token, turnstileEnforcementMode: 'off'})};
      }
      if (url === AI_GATEWAY_URL && gatewayStatus !== 200) {
        throw new NetworkError(`${gatewayStatus}`, {
          status: gatewayStatus,
        } as Response);
      }
      return {json: async () => ({text: 'hi'})};
    });
  });

  it('fetches one token for consecutive gateway requests', async () => {
    await generate();
    await generate();
    await generate();

    expect(tokenRequests()).toHaveLength(1);
    const sentTokens = mockPost.mock.calls
      .filter(([url]) => url === AI_GATEWAY_URL)
      .map(([, body]) => JSON.parse(body).token);
    expect(new Set(sentTokens).size).toBe(1);
  });

  it('fetches a new token after the gateway rejects one with 401', async () => {
    gatewayStatus = 401;
    await expect(generate()).rejects.toBeInstanceOf(NetworkError);

    gatewayStatus = 200;
    await generate();

    expect(tokenRequests()).toHaveLength(2);
  });

  it('keeps the token after a gateway error other than 401', async () => {
    gatewayStatus = 429;
    await expect(generate()).rejects.toBeInstanceOf(NetworkError);

    gatewayStatus = 200;
    await generate();

    expect(tokenRequests()).toHaveLength(1);
  });
});
