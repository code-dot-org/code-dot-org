/**
 * The stable-ID cookie is `Secure` and scoped to `.code.org`, so the test
 * document must be an https code.org host or jsdom's cookie jar rejects it.
 *
 * @vitest-environment jsdom
 * @vitest-environment-options {"url": "https://test-studio.code.org/"}
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const statsigInstances: Array<{
  key: string;
  user: {customIDs?: {stableID?: string}; custom?: Record<string, unknown>};
  options: Record<string, unknown>;
  logEvent: ReturnType<typeof vi.fn>;
  updateUserAsync: ReturnType<typeof vi.fn>;
  initializeAsync: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('@statsig/js-client', () => ({
  StatsigClient: vi.fn(function (
    this: Record<string, unknown>,
    key: string,
    user: unknown,
    options: unknown,
  ) {
    const instance = {
      key,
      user,
      options,
      logEvent: vi.fn(),
      updateUserAsync: vi.fn().mockResolvedValue(undefined),
      initializeAsync: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };
    statsigInstances.push(instance as never);
    Object.assign(this, instance);
  }),
}));

import {StatsigClient} from '@statsig/js-client';

import type {SiteConfig, SiteConfigExtensions} from '../../../config';
import {_resetConsentSettled, markConsentSettled} from '../../consent/settled';
import {DEFAULT_STATE, pushConsentState} from '../../consent/store';
import {ConsoleAdapter} from '../adapters/ConsoleAdapter';
import {DeferredAdapter} from '../adapters/DeferredAdapter';
import {NoopAdapter} from '../adapters/NoopAdapter';
import {StatsigAdapter} from '../adapters/StatsigAdapter';
import {createAnalyticsClient, type AnalyticsClientKind} from '../factory';
import {
  _getSingleton,
  _initializeSingleton,
  _resetForTests,
  analyticsPlugin,
  sendEvent,
  setUser,
} from '../index';
import {
  COOKIE_NAME,
  LOCAL_STORAGE_KEY,
  forgetStableId,
  persistStableId,
  readStableId,
} from '../stableId';
import type {AnalyticsConfig} from '../types';

const STATSIG_CONFIG: AnalyticsConfig = {
  provider: 'statsig',
  statsig: {clientKey: 'client-test-key'},
};

/** Minimal SiteConfig stand-in; the plugin reads `analytics` and `environment`. */
function pluginConfig(
  analytics?: AnalyticsConfig,
  environment = 'test',
): SiteConfig & SiteConfigExtensions {
  return {analytics, environment} as unknown as SiteConfig &
    SiteConfigExtensions;
}

function latestStatsig() {
  return statsigInstances[statsigInstances.length - 1];
}

/** Report a CMP decision on `performance` and settle the consent source. */
function reportConsent(granted: boolean) {
  pushConsentState({
    categories: new Set(
      granted
        ? (['strictly-necessary', 'performance'] as const)
        : (['strictly-necessary'] as const),
    ),
  });
  markConsentSettled();
}

/** Let the settlement promise and the provider import chain drain. */
async function drain() {
  await vi.waitFor(() => expect(latestStatsig()).toBeDefined());
}

beforeEach(() => {
  _resetForTests();
  vi.clearAllMocks();
  statsigInstances.length = 0;
  forgetStableId();
  pushConsentState(DEFAULT_STATE);
  _resetConsentSettled();
});

afterEach(() => {
  _resetForTests();
  forgetStableId();
  pushConsentState(DEFAULT_STATE);
  _resetConsentSettled();
});

describe('analytics factory', () => {
  it('creates a console client for the development stand-in', async () => {
    await expect(createAnalyticsClient('console')).resolves.toBeInstanceOf(
      ConsoleAdapter,
    );
  });

  it('creates a statsig client for the statsig provider', async () => {
    await expect(createAnalyticsClient('statsig')).resolves.toBeInstanceOf(
      StatsigAdapter,
    );
  });

  it('rejects an unsupported client kind', async () => {
    await expect(
      createAnalyticsClient('mixpanel' as AnalyticsClientKind),
    ).rejects.toThrow(/Unsupported analytics client/);
  });
});

describe('analytics plugin bootstrap', () => {
  it('stays silent when analytics config is absent outside development', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(undefined));
    await Promise.resolve();

    expect(_getSingleton()).toBeInstanceOf(NoopAdapter);
    expect(StatsigClient).not.toHaveBeenCalled();
  });

  it('stays silent for provider "none" outside development', async () => {
    analyticsPlugin.onCoreReady(pluginConfig({provider: 'none'}));
    await Promise.resolve();

    expect(_getSingleton()).toBeInstanceOf(NoopAdapter);
    expect(StatsigClient).not.toHaveBeenCalled();
  });

  it('logs to the console for a non-transmitting development environment', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    markConsentSettled();
    analyticsPlugin.onCoreReady(
      pluginConfig({provider: 'none'}, 'development'),
    );
    await vi.waitFor(() =>
      expect(_getSingleton()).toBeInstanceOf(ConsoleAdapter),
    );

    sendEvent('Some Event', {a: 1});

    expect(StatsigClient).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      '[STATSIG ANALYTICS EVENT]: Some Event. Payload: {"payload":{"a":1}}',
    );
    log.mockRestore();
  });

  it('installs a deferred client synchronously so early events are not lost', () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));

    expect(_getSingleton()).toBeInstanceOf(DeferredAdapter);
  });

  it('replays buffered events in order once the client is ready', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    sendEvent('first');
    sendEvent('second');
    reportConsent(true);
    await drain();

    expect(latestStatsig().logEvent.mock.calls.map(call => call[0])).toEqual([
      'first',
      'second',
    ]);
  });

  it('boots once, ignoring any later onCoreReady', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    reportConsent(true);
    await drain();
    const client = _getSingleton();

    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await Promise.resolve();
    await Promise.resolve();

    expect(statsigInstances).toHaveLength(1);
    expect(_getSingleton()).toBe(client);
  });

  it('falls back to a silent client when provider setup fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    markConsentSettled();
    // No clientKey, so the adapter's init throws inside the boot chain.
    analyticsPlugin.onCoreReady(pluginConfig({provider: 'statsig'}));
    await vi.waitFor(() => expect(_getSingleton()).toBeInstanceOf(NoopAdapter));

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('analytics consent gate', () => {
  it('sends immediately when the page carries no CMP', async () => {
    // No CMP means the consent source settles synchronously at connect time.
    markConsentSettled();
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    sendEvent('immediate');

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'immediate',
      'immediate',
      undefined,
    );
  });

  it('sends nothing while a CMP is present but has not settled', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    sendEvent('buffered');
    await Promise.resolve();
    await Promise.resolve();

    expect(StatsigClient).not.toHaveBeenCalled();
    expect(_getSingleton()).toBeInstanceOf(DeferredAdapter);
  });

  it('sends buffered events after a grant, and persists the stable id', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    sendEvent('before consent');
    reportConsent(true);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'before consent',
      'before consent',
      undefined,
    );
    expect(readStableId()).toBeDefined();
    expect(latestStatsig().user.customIDs?.stableID).toBe(readStableId());
  });

  it('still sends buffered events after a denial — only persistence differs', async () => {
    persistStableId('previously-persisted');
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    sendEvent('before consent');
    reportConsent(false);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'before consent',
      'before consent',
      undefined,
    );
    // Our copies are deleted and no stable ID is handed to the SDK, which is
    // its cue to mint and store one of its own.
    expect(readStableId()).toBeUndefined();
    expect(document.cookie).not.toContain(COOKIE_NAME);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
    expect(latestStatsig().user.customIDs).toEqual({stableID: undefined});
  });

  it('adopts an already-persisted stable id on a grant', async () => {
    persistStableId('persisted-id');
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    reportConsent(true);
    await drain();

    expect(latestStatsig().user.customIDs?.stableID).toBe('persisted-id');
    expect(readStableId()).toBe('persisted-id');
  });

  it('ignores consent changes after the single boot-time decision', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    reportConsent(false);
    await drain();
    const client = latestStatsig();

    // A mid-session accept earns no cookie until the next page load, and the
    // running client is left alone.
    reportConsent(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(readStableId()).toBeUndefined();
    expect(client.shutdown).not.toHaveBeenCalled();
    expect(statsigInstances).toHaveLength(1);

    // Sending still works — consent never gated transmission.
    sendEvent('after change');
    expect(client.logEvent).toHaveBeenCalledWith(
      'after change',
      'after change',
      undefined,
    );
  });

  it('keeps sending after a mid-session revoke', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    reportConsent(true);
    await drain();

    reportConsent(false);
    await Promise.resolve();
    sendEvent('still sending');

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'still sending',
      'still sending',
      undefined,
    );
    expect(latestStatsig().shutdown).not.toHaveBeenCalled();
  });
});

describe('analytics session dimensions', () => {
  it('attaches enabled experiments and the GE region at init', async () => {
    localStorage.setItem(
      'experimentsList',
      JSON.stringify([{key: 'local-one'}]),
    );
    document.cookie = '_experiments=%5B%22cookie-one%22%5D; path=/';
    document.documentElement.dataset.geRegion = 'fa';

    markConsentSettled();
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    expect(latestStatsig().user.custom).toEqual({
      enabledExperiments: ['cookie-one', 'local-one'],
      geRegion: 'fa',
    });

    document.cookie =
      '_experiments=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('experimentsList');
    delete document.documentElement.dataset.geRegion;
  });

  it('passes the environment tier and leaves SDK storage at its default', async () => {
    markConsentSettled();
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    expect(latestStatsig().options).toEqual({environment: {tier: 'test'}});
  });
});

describe('analytics identity', () => {
  it('matches legacy setUserProperties, including its omitted customIDs', async () => {
    persistStableId('persisted-id');
    reportConsent(true);
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    setUser({
      userId: '1234',
      userType: 'teacher',
      isVerifiedInstructor: true,
      educatorRole: 'librarian',
    });

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledWith({
      userID: 'test-1234',
      custom: {
        userType: 'teacher',
        isVerifiedInstructor: true,
        enabledExperiments: [],
        educatorRole: 'librarian',
      },
    });
  });

  it('drops an identical repeat setUser', async () => {
    markConsentSettled();
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    setUser({userId: '1234', userType: 'teacher'});
    setUser({userId: '1234', userType: 'teacher'});

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledTimes(1);
  });

  it('treats setUser(null) as a no-op, as legacy had no sign-out path', async () => {
    markConsentSettled();
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    await drain();

    setUser(null);

    expect(latestStatsig().updateUserAsync).not.toHaveBeenCalled();
  });

  it('buffers a setUser issued before the client exists', async () => {
    analyticsPlugin.onCoreReady(pluginConfig(STATSIG_CONFIG));
    setUser({userId: '77', userType: 'student'});
    reportConsent(true);
    await drain();

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledWith(
      expect.objectContaining({userID: 'test-77'}),
    );
  });

  it('drops events and identity on the silent client without throwing', () => {
    _initializeSingleton(new NoopAdapter());

    expect(() => sendEvent('ignored', {a: 1})).not.toThrow();
    expect(() => setUser({userId: '1'})).not.toThrow();
    expect(() => setUser(null)).not.toThrow();
  });
});

describe('stable id storage', () => {
  it('round-trips through the cookie and localStorage', () => {
    persistStableId('abc-123');

    expect(document.cookie).toContain(`${COOKIE_NAME}=abc-123`);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe('abc-123');
    expect(readStableId()).toBe('abc-123');
  });

  it('falls back to localStorage when the cookie is gone', () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'from-storage');

    expect(readStableId()).toBe('from-storage');
  });

  it('falls through an empty cookie value to localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'from-storage');
    document.cookie = `${COOKIE_NAME}=; path=/; domain=.code.org`;

    expect(readStableId()).toBe('from-storage');
  });

  it('treats a malformed cookie escape as absent', () => {
    document.cookie = `${COOKIE_NAME}=100%; path=/; domain=.code.org`;

    expect(() => readStableId()).not.toThrow();
    expect(readStableId()).toBeUndefined();
  });

  it('reports nothing once forgotten', () => {
    persistStableId('abc-123');
    forgetStableId();

    expect(readStableId()).toBeUndefined();
  });
});
