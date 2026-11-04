import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AichatContext} from '@cdo/apps/aichat/types';
import {
  ACCESS_TOKEN_REUSE_MARGIN_MS,
  clearAccessTokenCache,
  fetchAccessToken,
  getAccessToken,
  invalidateAccessToken,
} from '@cdo/apps/aiGateway/shared';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {
  AiChatClientTypes,
  AiGatewayAccessTokenLifetimeSeconds,
} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn()},
  recordError: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  __esModule: true,
  default: {post: jest.fn()},
}));

const mockPost = HttpClient.post as jest.Mock;

const tutorContext: AichatContext = {
  clientType: AiChatClientTypes.AI_TUTOR,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};

describe('fetchAccessToken', () => {
  beforeEach(() => {
    mockPost.mockResolvedValue({
      json: async () => ({token: 'jwt', turnstileEnforcementMode: 'disabled'}),
    });
    AichatContextManager.setContext(tutorContext);
  });

  it('sends the chat workspace context by default', async () => {
    const result = await fetchAccessToken();

    expect(JSON.parse(mockPost.mock.calls[0][1])).toEqual({
      aichatContext: tutorContext,
    });
    expect(result).toEqual({
      token: 'jwt',
      turnstileEnforcementMode: 'disabled',
      reusable: false,
      signingKey: undefined,
    });
  });

  it('reports the token reusable only for a literal true', async () => {
    const cases: [unknown, boolean][] = [
      [true, true],
      ['true', false],
      [1, false],
    ];
    for (const [reusable, expected] of cases) {
      mockPost.mockResolvedValue({
        json: async () => ({token: 'jwt', reusable}),
      });

      expect((await fetchAccessToken()).reusable).toBe(expected);
    }
  });

  it('returns the signing key Rails reports', async () => {
    mockPost.mockResolvedValue({
      json: async () => ({
        token: 'jwt',
        turnstileEnforcementMode: 'disabled',
        signingKey: 'environment_key',
      }),
    });

    const result = await fetchAccessToken();

    expect(result.signingKey).toBe('environment_key');
  });

  it('throws when the response has no token', async () => {
    mockPost.mockResolvedValue({
      json: async () => ({turnstileEnforcementMode: 'disabled'}),
    });

    await expect(fetchAccessToken()).rejects.toThrow(
      'AI Gateway token response has no token'
    );
  });

  it('sends the given context instead when a caller passes one', async () => {
    const shellContext: AichatContext = {
      clientType: AiChatClientTypes.ADAPTIVE,
      currentLevelId: 7,
      scriptId: 2,
      channelId: undefined,
    };

    await fetchAccessToken(shellContext);

    expect(JSON.parse(mockPost.mock.calls[0][1])).toEqual({
      aichatContext: shellContext,
    });
  });
});

const tokenResponse = (token: string, reusable = true) => ({
  json: async () => ({token, turnstileEnforcementMode: 'disabled', reusable}),
});

describe('getAccessToken', () => {
  let issued: number;

  beforeEach(() => {
    jest.useFakeTimers();
    clearAccessTokenCache();
    issued = 0;
    mockPost.mockImplementation(async () => tokenResponse(`token-${++issued}`));
    AichatContextManager.setContext(tutorContext);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reuses the token for a second call with the same context', async () => {
    const first = await getAccessToken(tutorContext);
    const second = await getAccessToken({...tutorContext});

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
    expect(second.turnstileEnforcementMode).toBe('disabled');
  });

  it('treats the default context as the same key as an explicit one', async () => {
    await getAccessToken();
    await getAccessToken(tutorContext);

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('ignores key order in the context', async () => {
    await getAccessToken(tutorContext);
    await getAccessToken({
      channelId: undefined,
      scriptId: null,
      currentLevelId: 1,
      clientType: AiChatClientTypes.AI_TUTOR,
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('fetches every time while the server disallows reuse', async () => {
    mockPost.mockImplementation(async () =>
      tokenResponse(`token-${++issued}`, false)
    );

    await getAccessToken(tutorContext);
    await getAccessToken(tutorContext);

    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('stops sharing fetches among concurrent callers once the server disallows reuse', async () => {
    mockPost.mockImplementation(async () =>
      tokenResponse(`token-${++issued}`, false)
    );
    await getAccessToken(tutorContext);

    const results = await Promise.all([
      getAccessToken(tutorContext),
      getAccessToken(tutorContext),
      getAccessToken(tutorContext),
    ]);

    expect(mockPost).toHaveBeenCalledTimes(4);
    expect(new Set(results.map(result => result.token)).size).toBe(3);

    // Sharing resumes once the server allows reuse again.
    mockPost.mockImplementation(async () => tokenResponse(`token-${++issued}`));
    await getAccessToken(tutorContext);
    await Promise.all([
      getAccessToken(tutorContext),
      getAccessToken(tutorContext),
    ]);

    expect(mockPost).toHaveBeenCalledTimes(5);
  });

  it('fetches a new token for a different context', async () => {
    const first = await getAccessToken(tutorContext);
    const second = await getAccessToken({...tutorContext, currentLevelId: 2});

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(second.token).not.toEqual(first.token);
    expect(JSON.parse(mockPost.mock.calls[1][1]).aichatContext).toEqual({
      ...tutorContext,
      currentLevelId: 2,
    });
  });

  it('fetches a new token once the reuse margin is reached', async () => {
    const reuseMs =
      AiGatewayAccessTokenLifetimeSeconds * 1000 - ACCESS_TOKEN_REUSE_MARGIN_MS;
    await getAccessToken(tutorContext);

    jest.advanceTimersByTime(reuseMs - 1);
    await getAccessToken(tutorContext);
    expect(mockPost).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    await getAccessToken(tutorContext);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('shares one fetch among concurrent callers', async () => {
    const results = await Promise.all([
      getAccessToken(tutorContext),
      getAccessToken(tutorContext),
      getAccessToken(tutorContext),
    ]);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(new Set(results.map(result => result.token)).size).toBe(1);
  });

  it('does not cache a 403, nor share the rejected fetch afterwards', async () => {
    const forbidden = new NetworkError('403 Forbidden', {
      status: 403,
    } as Response);
    mockPost.mockRejectedValueOnce(forbidden);

    await expect(
      Promise.all([getAccessToken(tutorContext), getAccessToken(tutorContext)])
    ).rejects.toBe(forbidden);
    expect(mockPost).toHaveBeenCalledTimes(1);

    await expect(getAccessToken(tutorContext)).resolves.toMatchObject({
      token: 'token-1',
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('drops the cached token when it is invalidated', async () => {
    const {token} = await getAccessToken(tutorContext);
    invalidateAccessToken(tutorContext, token);
    await getAccessToken(tutorContext);

    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('keeps a newer cached token when an older one is invalidated', async () => {
    const {token: stale} = await getAccessToken(tutorContext);
    invalidateAccessToken(tutorContext, stale);
    await getAccessToken(tutorContext);
    invalidateAccessToken(tutorContext, stale);
    await getAccessToken(tutorContext);

    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});
