import {TurnstileManager} from '@cdo/apps/aiGateway/turnstile/manager';
import {TOKEN_MAX_AGE_MS} from '@cdo/apps/aiGateway/turnstile/constants';
import {
  fetchTurnstileTokenIfEnabled,
  turnstileHeaders,
} from '@cdo/apps/aiGateway/turnstile/util';
import experiments from '@cdo/apps/util/experiments';

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
  getToken: () => Promise<string>;
  runSerializedChallenge: () => Promise<string>;
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
    const m = TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;

    const freshToken = 'fresh-token';
    const freshChallenge = jest.fn().mockResolvedValue(freshToken);
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(freshChallenge);

    // Simulate a stale pre-fetched token that resolved TOKEN_MAX_AGE_MS + 1s ago.
    m.nextTokenPromise = Promise.resolve('stale-token');
    m.nextTokenResolvedAt = Date.now() - TOKEN_MAX_AGE_MS - 1000;

    const result = await m.getToken();

    expect(result).toBe(freshToken);
    expect(freshChallenge).toHaveBeenCalledTimes(1);
  });

  it('uses a pre-fetched token that is still within TOKEN_MAX_AGE_MS', async () => {
    const m = TurnstileManager.getInstance() as unknown as TurnstileManagerPrivates;

    const freshChallenge = jest.fn().mockResolvedValue('ignored');
    jest.spyOn(m, 'runSerializedChallenge').mockImplementation(freshChallenge);

    const validToken = 'valid-token';
    m.nextTokenPromise = Promise.resolve(validToken);
    m.nextTokenResolvedAt = Date.now() - 60_000; // 1 minute old — well within limit

    const result = await m.getToken();

    expect(result).toBe(validToken);
    // runSerializedChallenge called once for the scheduled pre-fetch, not to
    // replace the valid token.
    expect(freshChallenge).toHaveBeenCalledTimes(1);
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
