import {AichatContext} from '@cdo/apps/aichat/types';
import {fetchChallengeToken} from '@cdo/apps/aiGateway/challengeToken';
import {sendGatewayRequest} from '@cdo/apps/aiGateway/gatewayRequest';
import {clearAccessTokenCache} from '@cdo/apps/aiGateway/shared';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: jest.fn(),
  metrics: {count: jest.fn()},
}));

const challengeToken = {provider: 'turnstile', token: 'turnstile-token'};

jest.mock('@cdo/apps/aiGateway/challengeToken', () => ({
  fetchChallengeToken: jest.fn(async () => challengeToken),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  __esModule: true,
  default: {post: jest.fn()},
}));

const mockPost = HttpClient.post as jest.Mock;
const mockFetchChallengeToken = fetchChallengeToken as jest.Mock;

const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.AI_TUTOR,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};

const unauthorized = (body?: Record<string, unknown>) =>
  new NetworkError('401', {
    status: 401,
    clone: () => ({json: async () => body ?? {}}),
  } as unknown as Response);

describe('sendGatewayRequest', () => {
  let reusable: boolean;
  let send: jest.Mock;

  beforeEach(() => {
    clearAccessTokenCache();
    reusable = true;
    let issued = 0;
    mockPost.mockImplementation(async () => ({
      json: async () => ({
        token: `token-${++issued}`,
        turnstileEnforcementMode: 'enforce',
        signingKey: 'environment_key',
        reusable,
      }),
    }));
    send = jest.fn(async () => ({ok: true} as Response));
  });

  const sentAccessTokens = () =>
    send.mock.calls.map(([accessToken]) => accessToken);

  it('sends the issued access token with the Turnstile token for its mode', async () => {
    const response = await sendGatewayRequest(aichatContext, send);

    expect(response).toEqual({ok: true});
    expect(send).toHaveBeenCalledWith(
      'token-1',
      challengeToken,
      expect.any(AbortSignal)
    );
    expect(mockFetchChallengeToken).toHaveBeenCalledWith('enforce');
  });

  it('resends once with a fresh access token and challenge after a rejected reusable one', async () => {
    send.mockRejectedValueOnce(unauthorized());

    await sendGatewayRequest(aichatContext, send);

    expect(sentAccessTokens()).toEqual(['token-1', 'token-2']);
    expect(mockFetchChallengeToken).toHaveBeenCalledTimes(2);
  });

  it('gives up after one retry', async () => {
    const error = unauthorized();
    send.mockRejectedValue(error);

    await expect(sendGatewayRequest(aichatContext, send)).rejects.toBe(error);
    expect(sentAccessTokens()).toEqual(['token-1', 'token-2']);
  });

  it('does not retry when the server disallows reuse', async () => {
    reusable = false;
    const error = unauthorized();
    send.mockRejectedValueOnce(error);

    await expect(sendGatewayRequest(aichatContext, send)).rejects.toBe(error);
    expect(sentAccessTokens()).toEqual(['token-1']);
  });

  it('does not retry a Turnstile rejection', async () => {
    const error = unauthorized({reason: 'turnstile'});
    send.mockRejectedValueOnce(error);

    await expect(sendGatewayRequest(aichatContext, send)).rejects.toBe(error);
    expect(sentAccessTokens()).toEqual(['token-1']);
  });

  it('does not retry an error other than 401', async () => {
    const error = new NetworkError('429', {status: 429} as Response);
    send.mockRejectedValueOnce(error);

    await expect(sendGatewayRequest(aichatContext, send)).rejects.toBe(error);
    expect(sentAccessTokens()).toEqual(['token-1']);
  });

  it('drops the rejected access token so the next request fetches a new one', async () => {
    reusable = false;
    send.mockRejectedValueOnce(unauthorized());
    await expect(sendGatewayRequest(aichatContext, send)).rejects.toBeTruthy();

    reusable = true;
    await sendGatewayRequest(aichatContext, send);
    await sendGatewayRequest(aichatContext, send);

    expect(sentAccessTokens()).toEqual(['token-1', 'token-2', 'token-2']);
  });

  describe('timeout', () => {
    const after = <T>(ms: number, value: T) =>
      new Promise<T>(resolve => setTimeout(() => resolve(value), ms));
    const ok = {ok: true} as Response;

    beforeEach(() => {
      jest.useFakeTimers();
      mockFetchChallengeToken.mockImplementation(() =>
        after(20_000, challengeToken)
      );
    });

    afterEach(() => {
      mockFetchChallengeToken.mockImplementation(async () => challengeToken);
      jest.useRealTimers();
    });

    it('counts the challenge against the timeout by default, as the AI SDK does', async () => {
      send.mockImplementation(() => after(15_000, ok));

      const pending = sendGatewayRequest(aichatContext, send, {
        timeoutMs: 30_000,
      });
      const assertion = expect(pending).rejects.toMatchObject({
        name: 'TimeoutError',
      });
      await jest.advanceTimersByTimeAsync(30_000);
      await assertion;
    });

    it('starts the timer once the challenge token is in hand when the challenge is excluded', async () => {
      send.mockImplementation(() => after(15_000, ok));

      const pending = sendGatewayRequest(aichatContext, send, {
        timeoutMs: 30_000,
        excludeChallengeFromTimeout: true,
      });
      await jest.advanceTimersByTimeAsync(35_000);
      await expect(pending).resolves.toBe(ok);
    });

    it('still times out, and aborts, a slow request when the challenge is excluded', async () => {
      let sentSignal: AbortSignal | undefined;
      send.mockImplementation((_accessToken, _challengeToken, signal) => {
        sentSignal = signal;
        return new Promise(() => {});
      });

      const pending = sendGatewayRequest(aichatContext, send, {
        timeoutMs: 30_000,
        excludeChallengeFromTimeout: true,
      });
      const assertion = expect(pending).rejects.toMatchObject({
        name: 'TimeoutError',
      });
      await jest.advanceTimersByTimeAsync(20_000 + 30_000);
      await assertion;
      expect(sentSignal?.aborted).toBe(true);
    });

    it("rejects with the caller's abort reason", async () => {
      const controller = new AbortController();
      const reason = new Error('left the page');
      send.mockImplementation(() => new Promise(() => {}));

      const pending = sendGatewayRequest(aichatContext, send, {
        abortSignal: controller.signal,
      });
      const assertion = expect(pending).rejects.toBe(reason);
      await jest.advanceTimersByTimeAsync(20_000);
      controller.abort(reason);
      await assertion;
    });
  });
});
