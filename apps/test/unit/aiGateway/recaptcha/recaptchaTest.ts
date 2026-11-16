jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn(), distribution: jest.fn()},
  logger: {warn: jest.fn()},
}));

const mockDcdoGet = jest.fn(
  (_key: string, defaultValue: unknown): unknown => defaultValue
);
jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {
    get: (key: string, defaultValue: unknown) => mockDcdoGet(key, defaultValue),
  },
}));

import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  DEFAULT_RECAPTCHA_TIMEOUT_SECONDS,
  RECAPTCHA_ACTION,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_TIMEOUT_FLAG,
} from '@cdo/apps/aiGateway/recaptcha/constants';

type RecaptchaModule = typeof import('@cdo/apps/aiGateway/recaptcha');

// The script loader caches its promise, so each test loads a fresh module.
const loadModule = (): RecaptchaModule => {
  let module: RecaptchaModule | undefined;
  jest.isolateModules(() => {
    module = require('@cdo/apps/aiGateway/recaptcha');
  });
  return module as RecaptchaModule;
};

// Settles every injected script tag the way the browser would.
const settleScripts = (outcome: 'load' | 'error') =>
  jest
    .spyOn(document.head, 'appendChild')
    .mockImplementation(<T extends Node>(node: T): T => {
      const script = node as unknown as HTMLScriptElement;
      setTimeout(() =>
        outcome === 'load'
          ? script.onload?.(new Event('load'))
          : script.onerror?.(new Event('error'))
      );
      return node;
    });

const stubGrecaptcha = (execute: jest.Mock) => {
  window.grecaptcha = {ready: callback => callback(), execute};
};

const countMock = Observability.metrics.count as jest.Mock;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  delete window.grecaptcha;
  jest.restoreAllMocks();
  jest.useRealTimers();
  countMock.mockClear();
  mockDcdoGet.mockImplementation((_key, defaultValue) => defaultValue);
});

describe('getRecaptchaToken', () => {
  it('executes the configured key and action and records success', async () => {
    settleScripts('load');
    const execute = jest.fn().mockResolvedValue('recaptcha-token');
    stubGrecaptcha(execute);

    await expect(loadModule().getRecaptchaToken('enforce')).resolves.toBe(
      'recaptcha-token'
    );

    expect(execute).toHaveBeenCalledWith(RECAPTCHA_SITE_KEY, {
      action: RECAPTCHA_ACTION,
    });
    expect(countMock).toHaveBeenCalledWith('ai-gateway.recaptcha', 1, {
      enforcement_mode: 'enforce',
      result: 'ok',
    });
  });

  it('reports script_load_failed and loads again on the next call', async () => {
    const appendChild = settleScripts('error');
    const {getRecaptchaToken} = loadModule();

    await expect(getRecaptchaToken('monitor')).rejects.toMatchObject({
      reason: 'script_load_failed',
    });
    await expect(getRecaptchaToken('monitor')).rejects.toMatchObject({
      reason: 'script_load_failed',
    });

    expect(appendChild).toHaveBeenCalledTimes(2);
    expect(countMock).toHaveBeenCalledWith('ai-gateway.recaptcha', 1, {
      enforcement_mode: 'monitor',
      result: 'error',
      reason: 'script_load_failed',
    });
  });

  it('reports execute_failed when execute() rejects', async () => {
    settleScripts('load');
    stubGrecaptcha(jest.fn().mockRejectedValue(new Error('invalid key')));

    await expect(
      loadModule().getRecaptchaToken('enforce')
    ).rejects.toMatchObject({reason: 'execute_failed'});
  });

  it('reports empty_token when execute() resolves nothing', async () => {
    settleScripts('load');
    stubGrecaptcha(jest.fn().mockResolvedValue(''));

    await expect(
      loadModule().getRecaptchaToken('enforce')
    ).rejects.toMatchObject({reason: 'empty_token'});
  });

  it('reports timeout when execute() never answers', async () => {
    jest.useFakeTimers();
    settleScripts('load');
    stubGrecaptcha(jest.fn().mockReturnValue(new Promise(() => {})));

    const pending = loadModule().getRecaptchaToken('enforce');
    const assertion = expect(pending).rejects.toMatchObject({
      reason: 'timeout',
    });
    await jest.advanceTimersByTimeAsync(
      DEFAULT_RECAPTCHA_TIMEOUT_SECONDS * 1000
    );
    await assertion;
  });

  it('times out after the DCDO reCAPTCHA timeout when one is set', async () => {
    jest.useFakeTimers();
    mockDcdoGet.mockImplementation((key, defaultValue) =>
      key === RECAPTCHA_TIMEOUT_FLAG ? 5 : defaultValue
    );
    settleScripts('load');
    stubGrecaptcha(jest.fn().mockReturnValue(new Promise(() => {})));

    const pending = loadModule().getRecaptchaToken('enforce');
    const assertion = expect(pending).rejects.toMatchObject({
      reason: 'timeout',
    });
    await jest.advanceTimersByTimeAsync(5_000);
    await assertion;
  });
});
