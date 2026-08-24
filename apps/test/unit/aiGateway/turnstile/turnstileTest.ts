jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: jest.fn((_options: unknown, callback: () => unknown) =>
    callback()
  ),
  metrics: {count: jest.fn(), distribution: jest.fn(), gauge: jest.fn()},
  logger: {error: jest.fn(), warn: jest.fn(), info: jest.fn()},
}));

import * as Observability from '@code-dot-org/core/plugins/observability';

import {TOKEN_MAX_AGE_MS} from '@cdo/apps/aiGateway/turnstile/constants';
import {TurnstileManager} from '@cdo/apps/aiGateway/turnstile/manager';
import {
  fetchTurnstileTokenIfEnabled,
  turnstileHeaders,
} from '@cdo/apps/aiGateway/turnstile/util';
import experiments from '@cdo/apps/util/experiments';

const startSpanMock = Observability.startSpan as jest.Mock;

// Reset the singleton between tests so each test starts clean.
afterEach(() => {
  (TurnstileManager as unknown as {instance: null}).instance = null;
  jest.restoreAllMocks();
});

describe('turnstileHeaders', () => {
  it('returns X-Turnstile-Token header when token is present', () => {
    expect(turnstileHeaders('abc123')).toEqual({'X-Turnstile-Token': 'abc123'});
  });

  it('returns empty object when token is null', () => {
    expect(turnstileHeaders(null)).toEqual({});
  });
});

describe('fetchTurnstileTokenIfEnabled', () => {
  it('resolves null without calling getInstance when experiment is off', async () => {
    jest
      .spyOn(experiments, 'isEnabledAllowingQueryString')
      .mockReturnValue(false);
    const getInstanceSpy = jest.spyOn(TurnstileManager, 'getInstance');

    const result = await fetchTurnstileTokenIfEnabled();

    expect(result).toBeNull();
    expect(getInstanceSpy).not.toHaveBeenCalled();
  });

  it('calls getInstance when experiment is on', async () => {
    jest
      .spyOn(experiments, 'isEnabledAllowingQueryString')
      .mockReturnValue(true);

    // Provide a minimal DOM environment so the constructor can run.
    document.body.innerHTML = '';
    const mockToken = 'test-token';
    const getTurnstileTokenMock = jest.fn().mockResolvedValue(mockToken);
    const getInstanceSpy = jest
      .spyOn(TurnstileManager, 'getInstance')
      .mockReturnValue({
        getTurnstileToken: getTurnstileTokenMock,
      } as unknown as TurnstileManager);

    const result = await fetchTurnstileTokenIfEnabled();

    expect(getInstanceSpy).toHaveBeenCalled();
    expect(result).toBe(mockToken);
  });
});

// Typed view of TurnstileManager's private internals used only in tests.
type TurnstileManagerPrivates = {
  nextTokenPromise: Promise<string> | null;
  nextTokenResolvedAt: number | null;
  startTokenAcquisition: () => {
    mode: 'pre-fetch' | 'on-demand';
    token: Promise<string>;
  };
  nextTokenOutcomeMode: {mode: 'pre-fetch' | 'on-demand'} | null;
  runSerializedChallenge: (outcomeMode: {
    mode: 'pre-fetch' | 'on-demand';
  }) => Promise<string>;
};

describe('TurnstileManager stale pre-fetch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('discards a pre-fetched token older than TOKEN_MAX_AGE_MS and runs a fresh challenge', async () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;

    const freshToken = 'fresh-token';
    const freshChallenge = jest.fn().mockResolvedValue(freshToken);
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(freshChallenge);

    // Simulate a stale pre-fetched token that resolved TOKEN_MAX_AGE_MS + 1s ago.
    m.nextTokenPromise = Promise.resolve('stale-token');
    m.nextTokenResolvedAt = Date.now() - TOKEN_MAX_AGE_MS - 1000;

    const {mode, token} = m.startTokenAcquisition();

    expect(await token).toBe(freshToken);
    expect(mode).toBe('on-demand');
    // call #1: fresh challenge replacing stale token; call #2: schedulePrefetch after delivery
    expect(freshChallenge).toHaveBeenCalledTimes(2);
  });

  it('uses a pre-fetched token that is still within TOKEN_MAX_AGE_MS', async () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;

    const freshChallenge = jest.fn().mockResolvedValue('ignored');
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(freshChallenge);

    const validToken = 'valid-token';
    m.nextTokenPromise = Promise.resolve(validToken);
    m.nextTokenResolvedAt = Date.now() - 60_000; // 1 minute old — well within limit

    const {mode, token} = m.startTokenAcquisition();

    expect(await token).toBe(validToken);
    expect(mode).toBe('pre-fetch');
    // runSerializedChallenge called once for the scheduled pre-fetch, not to
    // replace the valid token.
    expect(freshChallenge).toHaveBeenCalledTimes(1);
  });
});

describe('TurnstileManager challenge acquisition mode', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('labels a challenge started for a waiting caller as on-demand', () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;
    const challenge = jest.fn().mockResolvedValue('token');
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(challenge);

    m.startTokenAcquisition();

    expect(challenge).toHaveBeenCalledWith({mode: 'on-demand'});
  });

  it('labels the speculative follow-up challenge as pre-fetch', async () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;
    const challenge = jest.fn().mockResolvedValue('token');
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(challenge);

    const {token} = m.startTokenAcquisition();
    await token;

    expect(challenge).toHaveBeenNthCalledWith(1, {mode: 'on-demand'});
    expect(challenge).toHaveBeenNthCalledWith(2, {mode: 'pre-fetch'});
  });

  it('promotes a still-running pre-fetch to on-demand when a caller adopts it', () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;
    jest
      .spyOn(m, 'runSerializedChallenge')
      .mockResolvedValue('replacement-token');

    const outcomeMode: {mode: 'pre-fetch' | 'on-demand'} = {mode: 'pre-fetch'};
    m.nextTokenPromise = new Promise(() => {}); // never settles
    m.nextTokenResolvedAt = null;
    m.nextTokenOutcomeMode = outcomeMode;

    m.startTokenAcquisition();

    expect(outcomeMode.mode).toBe('on-demand');
  });

  it('leaves an already-resolved pre-fetch labelled pre-fetch', () => {
    const m =
      TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;
    jest.spyOn(m, 'runSerializedChallenge').mockResolvedValue('ignored');

    const outcomeMode: {mode: 'pre-fetch' | 'on-demand'} = {mode: 'pre-fetch'};
    m.nextTokenPromise = Promise.resolve('prefetched-token');
    m.nextTokenResolvedAt = Date.now();
    m.nextTokenOutcomeMode = outcomeMode;

    m.startTokenAcquisition();

    expect(outcomeMode.mode).toBe('pre-fetch');
  });
});

describe('TurnstileManager token acquisition span', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    startSpanMock.mockClear();
  });

  const getTokenWithSpan = async (
    prepare: (m: TurnstileManagerPrivates) => void
  ) => {
    const manager = TurnstileManager.getInstance();
    prepare(manager as unknown as TurnstileManagerPrivates);
    return manager.getTurnstileToken();
  };

  it('wraps an on-demand challenge in an ai-gateway.turnstile span', async () => {
    const token = await getTokenWithSpan(m => {
      jest.spyOn(m, 'runSerializedChallenge').mockResolvedValue('fresh-token');
    });

    expect(token).toBe('fresh-token');
    expect(startSpanMock).toHaveBeenCalledWith(
      {
        name: 'ai-gateway.turnstile',
        op: 'ai.turnstile',
        attributes: {'turnstile.mode': 'on-demand', feature: 'ai-gateway'},
      },
      expect.any(Function)
    );
  });

  it('reports pre-fetch mode when a pre-fetched token is consumed', async () => {
    const token = await getTokenWithSpan(m => {
      jest.spyOn(m, 'runSerializedChallenge').mockResolvedValue('ignored');
      m.nextTokenPromise = Promise.resolve('prefetched-token');
      m.nextTokenResolvedAt = Date.now();
    });

    expect(token).toBe('prefetched-token');
    expect(startSpanMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: {'turnstile.mode': 'pre-fetch', feature: 'ai-gateway'},
      }),
      expect.any(Function)
    );
  });

  it('opens the span even when the challenge fails', async () => {
    const failure = new Error('challenge failed');

    await expect(
      getTokenWithSpan(m => {
        jest.spyOn(m, 'runSerializedChallenge').mockRejectedValue(failure);
      })
    ).rejects.toBe(failure);

    expect(startSpanMock).toHaveBeenCalledTimes(1);
  });
});

describe('TurnstileManager.getInstance', () => {
  beforeEach(() => {
    // Provide a minimal DOM environment for the constructor.
    document.body.innerHTML = '';
  });

  it('returns the same instance on repeated calls', () => {
    const first = TurnstileManager.getInstance();
    const second = TurnstileManager.getInstance();
    expect(first).toBe(second);
  });

  it('appends a container div to document.body on first call', () => {
    expect(document.getElementById('turnstile-container')).toBeNull();
    TurnstileManager.getInstance();
    expect(document.getElementById('turnstile-container')).not.toBeNull();
  });

  it('does not create a second container on repeated calls', () => {
    TurnstileManager.getInstance();
    TurnstileManager.getInstance();
    expect(document.querySelectorAll('#turnstile-container').length).toBe(1);
  });
});
