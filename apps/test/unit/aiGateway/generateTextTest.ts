import {AichatContext} from '@cdo/apps/aichat/types';
import generateTextThroughGateway from '@cdo/apps/aiGateway/generateText';
import {
  AI_GATEWAY_URL,
  clearAccessTokenCache,
} from '@cdo/apps/aiGateway/shared';
import {fetchTurnstileToken} from '@cdo/apps/aiGateway/turnstile';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: (_options: unknown, callback: () => unknown) => callback(),
  recordError: jest.fn(),
  metrics: {count: jest.fn()},
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
const mockFetchTurnstileToken = fetchTurnstileToken as jest.Mock;

const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.AI_TUTOR,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};

const generate = () =>
  generateTextThroughGateway(
    {model: 'gemini', prompt: 'hello'},
    {aichatContext, phase: 'generation'}
  );

const accessTokenRequests = () =>
  mockPost.mock.calls.filter(([url]) => url === '/ai_gateway/access_token');

describe('generateTextThroughGateway access tokens', () => {
  // Statuses the gateway answers with, one per request, before succeeding.
  let gatewayFailures: number[];
  let reusable: boolean;

  beforeEach(() => {
    jest.useFakeTimers();
    clearAccessTokenCache();
    gatewayFailures = [];
    reusable = true;
    let issued = 0;
    mockPost.mockImplementation(async (url: string) => {
      if (url === '/ai_gateway/access_token') {
        const token = `token-${++issued}`;
        return {
          json: async () => ({
            token,
            turnstileEnforcementMode: 'off',
            signingKey: 'legacy_shared_key',
            reusable,
          }),
        };
      }
      if (url === AI_GATEWAY_URL && gatewayFailures.length) {
        const status = gatewayFailures.shift();
        throw new NetworkError(`${status}`, {status} as Response);
      }
      return {json: async () => ({text: 'hi'})};
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const sentAccessTokens = () =>
    mockPost.mock.calls
      .filter(([url]) => url === AI_GATEWAY_URL)
      .map(([, body]) => JSON.parse(body).token);

  // Stands in for a challenge that runs past the access token's reuse window.
  const slowTurnstileOnce = () =>
    mockFetchTurnstileToken.mockImplementationOnce(async () => {
      jest.advanceTimersByTime(50_000);
      return undefined;
    });

  it('fetches a fresh access token when a Turnstile challenge outlasts the reuse window', async () => {
    await generate();
    slowTurnstileOnce();
    await generate();

    expect(accessTokenRequests()).toHaveLength(2);
    expect(sentAccessTokens()).toEqual(['token-1', 'token-2']);
  });

  it('does not re-check the access token when the server disallows reuse', async () => {
    reusable = false;
    slowTurnstileOnce();
    await generate();

    expect(accessTokenRequests()).toHaveLength(1);
    expect(sentAccessTokens()).toEqual(['token-1']);
  });

  it('fetches one access token for consecutive gateway requests', async () => {
    await generate();
    await generate();
    await generate();

    expect(accessTokenRequests()).toHaveLength(1);
    expect(new Set(sentAccessTokens()).size).toBe(1);
  });

  it('resends with a fresh access token after the gateway rejects one with 401', async () => {
    gatewayFailures = [401];

    await generate();

    expect(accessTokenRequests()).toHaveLength(2);
    expect(sentAccessTokens()).toEqual(['token-1', 'token-2']);
  });

  it('keeps the access token after a gateway error other than 401', async () => {
    gatewayFailures = [429];
    await expect(generate()).rejects.toBeInstanceOf(NetworkError);

    await generate();

    expect(accessTokenRequests()).toHaveLength(1);
  });
});
