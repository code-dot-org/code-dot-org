jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: jest.fn((_options: unknown, callback: () => unknown) =>
    callback()
  ),
  metrics: {count: jest.fn(), distribution: jest.fn(), gauge: jest.fn()},
  logger: {error: jest.fn(), warn: jest.fn(), info: jest.fn()},
}));
jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
jest.mock('@cdo/apps/aiGateway/recaptcha', () => ({
  getRecaptchaToken: jest.fn(),
}));

import {
  challengeHeaders,
  fetchChallengeToken,
} from '@cdo/apps/aiGateway/challengeToken';
import {getRecaptchaToken} from '@cdo/apps/aiGateway/recaptcha';
import {type TurnstileEnforcementMode} from '@cdo/apps/aiGateway/turnstile/enforcementMode';
import {TurnstileManager} from '@cdo/apps/aiGateway/turnstile/manager';
import {TurnstileChallengeError} from '@cdo/apps/aiGateway/turnstile/types';
import DCDO from '@cdo/apps/dcdo';

const getRecaptchaTokenMock = getRecaptchaToken as jest.Mock;
const dcdoGetMock = DCDO.get as jest.Mock;

const stubManager = (getTurnstileToken: jest.Mock) =>
  jest.spyOn(TurnstileManager, 'getInstance').mockReturnValue({
    getTurnstileToken,
  } as unknown as TurnstileManager);

const scriptLoadFailed = () =>
  new TurnstileChallengeError(
    'script_load_failed',
    'Failed to load Turnstile script'
  );

const setFallbackEnabled = (enabled: boolean) =>
  dcdoGetMock.mockImplementation((key: string, defaultValue: unknown) =>
    key === 'ai-gateway-recaptcha-fallback-enabled' ? enabled : defaultValue
  );

beforeEach(() => {
  setFallbackEnabled(false);
});

afterEach(() => {
  jest.restoreAllMocks();
  getRecaptchaTokenMock.mockReset();
});

describe('challengeHeaders', () => {
  it('sends a Turnstile token as X-Turnstile-Token', () => {
    expect(challengeHeaders({provider: 'turnstile', token: 'abc'})).toEqual({
      'X-Turnstile-Token': 'abc',
    });
  });

  it('sends a reCAPTCHA token as X-Recaptcha-Token', () => {
    expect(challengeHeaders({provider: 'recaptcha', token: 'xyz'})).toEqual({
      'X-Recaptcha-Token': 'xyz',
    });
  });

  it('returns empty object when token is null', () => {
    expect(challengeHeaders(null)).toEqual({});
  });
});

describe('fetchChallengeToken', () => {
  it('resolves null without instantiating the manager when disabled', async () => {
    const getInstanceSpy = jest.spyOn(TurnstileManager, 'getInstance');

    await expect(fetchChallengeToken('disabled')).resolves.toBeNull();

    // The constructor appends a container to document.body, so a page that
    // never enforces must not reach it at all.
    expect(getInstanceSpy).not.toHaveBeenCalled();
  });

  const enforcingModes: TurnstileEnforcementMode[] = ['monitor', 'enforce'];

  it.each(enforcingModes)(
    'returns the Turnstile token in %s',
    async enforcementMode => {
      stubManager(jest.fn().mockResolvedValue('turnstile-token'));

      await expect(fetchChallengeToken(enforcementMode)).resolves.toEqual({
        provider: 'turnstile',
        token: 'turnstile-token',
      });
      expect(getRecaptchaTokenMock).not.toHaveBeenCalled();
    }
  );

  it('resolves null when the challenge fails in monitor', async () => {
    stubManager(jest.fn().mockRejectedValue(new Error('challenge failed')));

    await expect(fetchChallengeToken('monitor')).resolves.toBeNull();
  });

  it('rejects when the challenge fails in enforce', async () => {
    const failure = new Error('challenge failed');
    stubManager(jest.fn().mockRejectedValue(failure));

    await expect(fetchChallengeToken('enforce')).rejects.toBe(failure);
  });

  describe('with the reCAPTCHA fallback enabled', () => {
    beforeEach(() => setFallbackEnabled(true));

    it.each(enforcingModes)(
      'returns a reCAPTCHA token when the Turnstile script did not load in %s',
      async enforcementMode => {
        stubManager(jest.fn().mockRejectedValue(scriptLoadFailed()));
        getRecaptchaTokenMock.mockResolvedValue('recaptcha-token');

        await expect(fetchChallengeToken(enforcementMode)).resolves.toEqual({
          provider: 'recaptcha',
          token: 'recaptcha-token',
        });
        expect(getRecaptchaTokenMock).toHaveBeenCalledWith(enforcementMode);
      }
    );

    it.each(['timeout', 'challenge_failed', 'unsupported'] as const)(
      'does not fall back on %s',
      async reason => {
        const failure = new TurnstileChallengeError(reason, reason);
        stubManager(jest.fn().mockRejectedValue(failure));

        await expect(fetchChallengeToken('enforce')).rejects.toBe(failure);
        expect(getRecaptchaTokenMock).not.toHaveBeenCalled();
      }
    );

    it('rejects with the Turnstile error when the fallback also fails in enforce', async () => {
      const failure = scriptLoadFailed();
      stubManager(jest.fn().mockRejectedValue(failure));
      getRecaptchaTokenMock.mockRejectedValue(new Error('google blocked'));

      await expect(fetchChallengeToken('enforce')).rejects.toBe(failure);
    });

    it('resolves null when the fallback also fails in monitor', async () => {
      stubManager(jest.fn().mockRejectedValue(scriptLoadFailed()));
      getRecaptchaTokenMock.mockRejectedValue(new Error('google blocked'));

      await expect(fetchChallengeToken('monitor')).resolves.toBeNull();
    });
  });

  it('does not fall back while the flag is off', async () => {
    const failure = scriptLoadFailed();
    stubManager(jest.fn().mockRejectedValue(failure));

    await expect(fetchChallengeToken('enforce')).rejects.toBe(failure);
    expect(getRecaptchaTokenMock).not.toHaveBeenCalled();
  });
});
