/**
 * The stable-ID cookie is `Secure` and scoped to `.code.org`, so the test
 * document must be an https code.org host or jsdom's cookie jar rejects it.
 *
 * Each case loads a fresh module graph via `vi.resetModules()`, so the plugin
 * needs no test hooks: a fresh module is a pre-boot module. Consent and
 * settlement must be driven through the same generation the plugin imported,
 * which is why `loadAnalytics` hands back their exports too.
 *
 * @vitest-environment jsdom
 * @vitest-environment-options {"url": "https://test-studio.code.org/"}
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

interface MockStatsigClient {
  key: string;
  user: {customIDs?: {stableID?: string}; custom?: Record<string, unknown>};
  options: Record<string, unknown>;
  logEvent: ReturnType<typeof vi.fn>;
  updateUserAsync: ReturnType<typeof vi.fn>;
  initializeAsync: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
}

const statsigInstances: MockStatsigClient[] = [];

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
    statsigInstances.push(instance as MockStatsigClient);
    Object.assign(this, instance);
  }),
}));

import type {SiteConfig, SiteConfigExtensions} from '../../../config';
import type {AnalyticsConfig} from '../types';

// The storage contract, spelled out rather than imported, so these tests pin it
// independently of the implementation's constants.
const COOKIE_NAME = 'statsig_stable_id';
const LOCAL_STORAGE_KEY = 'STATSIG_STABLE_ID';
const COOKIE_SCOPE = 'path=/; domain=.code.org';

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

/**
 * Loads a pre-boot analytics module together with the consent modules it
 * imported, so tests drive the same instances the plugin reads.
 */
async function loadAnalytics() {
  vi.resetModules();
  const settled = await import('../../consent/settled');
  const store = await import('../../consent/store');
  const analytics = await import('../index');

  return {
    onCoreReady: (config?: AnalyticsConfig, environment?: string) =>
      analytics.analyticsPlugin.onCoreReady(pluginConfig(config, environment)),
    sendEvent: analytics.sendEvent,
    setUser: analytics.setUser,
    createAnalyticsClient: analytics.createAnalyticsClient,
    markConsentSettled: settled.markConsentSettled,
    pushConsentState: store.pushConsentState,
  };
}

type Analytics = Awaited<ReturnType<typeof loadAnalytics>>;

/** Reports a CMP decision on `performance` and settles the consent source. */
function reportConsent(analytics: Analytics, granted: boolean) {
  analytics.pushConsentState({
    categories: new Set(
      granted
        ? (['strictly-necessary', 'performance'] as const)
        : (['strictly-necessary'] as const),
    ),
  });
  analytics.markConsentSettled();
}

function latestStatsig(): MockStatsigClient {
  return statsigInstances[statsigInstances.length - 1];
}

/** Waits for the async provider import to install a client. */
async function drain() {
  await vi.waitFor(() => expect(latestStatsig()).toBeDefined());
}

function clearStableId() {
  document.cookie = `${COOKIE_NAME}=; ${COOKIE_SCOPE}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function persistedStableId(): string | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

let log: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  statsigInstances.length = 0;
  clearStableId();
  localStorage.clear();
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  clearStableId();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('analytics factory', () => {
  it('creates a console client for the development stand-in', async () => {
    vi.resetModules();
    const {createAnalyticsClient} = await import('../factory');
    const {ConsoleAdapter} = await import('../adapters/ConsoleAdapter');

    await expect(createAnalyticsClient('console')).resolves.toBeInstanceOf(
      ConsoleAdapter,
    );
  });

  it('creates a statsig client for the statsig provider', async () => {
    vi.resetModules();
    const {createAnalyticsClient} = await import('../factory');
    const {StatsigAdapter} = await import('../adapters/StatsigAdapter');

    await expect(createAnalyticsClient('statsig')).resolves.toBeInstanceOf(
      StatsigAdapter,
    );
  });

  it('rejects an unsupported client kind', async () => {
    const {createAnalyticsClient} = await loadAnalytics();

    await expect(
      createAnalyticsClient(
        'mixpanel' as Parameters<typeof createAnalyticsClient>[0],
      ),
    ).rejects.toThrow(/Unsupported analytics client/);
  });
});

describe('analytics plugin bootstrap', () => {
  it('stays silent when analytics config is absent outside development', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(undefined);
    analytics.markConsentSettled();
    await Promise.resolve();
    await Promise.resolve();

    analytics.sendEvent('ignored');

    expect(statsigInstances).toHaveLength(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('stays silent for provider "none" outside development', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady({provider: 'none'});
    analytics.markConsentSettled();
    await Promise.resolve();
    await Promise.resolve();

    analytics.sendEvent('ignored');

    expect(statsigInstances).toHaveLength(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('logs to the console for a non-transmitting development environment', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({provider: 'none'}, 'development');
    await vi.waitFor(() =>
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('Statsig Stable ID'),
      ),
    );

    analytics.sendEvent('Some Event', {a: 1});

    expect(statsigInstances).toHaveLength(0);
    expect(log).toHaveBeenCalledWith(
      '[STATSIG ANALYTICS EVENT]: Some Event. Payload: {"payload":{"a":1}}',
    );
  });

  it('buffers an event sent synchronously after onCoreReady', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('synchronous');

    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'synchronous',
      'synchronous',
      undefined,
    );
  });

  it('replays buffered events in order once the client is ready', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('first');
    analytics.sendEvent('second');
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().logEvent.mock.calls.map(call => call[0])).toEqual([
      'first',
      'second',
    ]);
  });

  it('falls back to a silent client when provider setup fails', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    // No clientKey, so the adapter's init throws inside the boot chain.
    analytics.onCoreReady({provider: 'statsig'});
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());

    expect(() => analytics.sendEvent('dropped')).not.toThrow();
    expect(statsigInstances).toHaveLength(0);
  });

  it('boots once, ignoring any later onCoreReady', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    analytics.onCoreReady(STATSIG_CONFIG);
    await Promise.resolve();
    await Promise.resolve();

    expect(statsigInstances).toHaveLength(1);
  });

  it('drops events and identity before any boot without throwing', async () => {
    const analytics = await loadAnalytics();

    expect(() => analytics.sendEvent('ignored', {a: 1})).not.toThrow();
    expect(() => analytics.setUser({userId: '1'})).not.toThrow();
    expect(() => analytics.setUser(null)).not.toThrow();
    expect(statsigInstances).toHaveLength(0);
  });
});

describe('analytics consent gate', () => {
  it('sends immediately when the page carries no CMP', async () => {
    const analytics = await loadAnalytics();
    // No CMP means the consent source settles synchronously at connect time.
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.sendEvent('immediate');

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'immediate',
      'immediate',
      undefined,
    );
  });

  it('sends nothing while a CMP is present but has not settled', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('buffered');
    await Promise.resolve();
    await Promise.resolve();

    expect(statsigInstances).toHaveLength(0);
  });

  it('sends buffered events after a grant, and persists the stable id', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('before consent');
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'before consent',
      'before consent',
      undefined,
    );
    expect(persistedStableId()).toBeDefined();
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(persistedStableId());
    expect(latestStatsig().user.customIDs?.stableID).toBe(persistedStableId());
  });

  it('still sends buffered events after a denial — only persistence differs', async () => {
    document.cookie = `${COOKIE_NAME}=previously-persisted; ${COOKIE_SCOPE}`;
    localStorage.setItem(LOCAL_STORAGE_KEY, 'previously-persisted');

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('before consent');
    reportConsent(analytics, false);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'before consent',
      'before consent',
      undefined,
    );
    // Our copies are deleted and no stable ID is handed to the SDK, which is
    // its cue to mint and store one of its own.
    expect(persistedStableId()).toBeUndefined();
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
    expect(latestStatsig().user.customIDs).toEqual({stableID: undefined});
  });

  it('adopts an already-persisted stable id on a grant', async () => {
    document.cookie = `${COOKIE_NAME}=persisted-id; ${COOKIE_SCOPE}`;

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().user.customIDs?.stableID).toBe('persisted-id');
    expect(persistedStableId()).toBe('persisted-id');
  });

  it('ignores consent changes after the single boot-time decision', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, false);
    await drain();
    const client = latestStatsig();

    // A mid-session accept earns no cookie until the next page load, and the
    // running client is left alone.
    reportConsent(analytics, true);
    await Promise.resolve();
    await Promise.resolve();

    expect(persistedStableId()).toBeUndefined();
    expect(client.shutdown).not.toHaveBeenCalled();
    expect(statsigInstances).toHaveLength(1);

    analytics.sendEvent('after change');
    expect(client.logEvent).toHaveBeenCalledWith(
      'after change',
      'after change',
      undefined,
    );
  });

  it('keeps sending after a mid-session revoke', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    reportConsent(analytics, false);
    await Promise.resolve();
    analytics.sendEvent('still sending');

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

    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(latestStatsig().user.custom).toEqual({
      enabledExperiments: ['cookie-one', 'local-one'],
      geRegion: 'fa',
    });

    document.cookie =
      '_experiments=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    delete document.documentElement.dataset.geRegion;
  });

  it('passes the environment tier and leaves SDK storage at its default', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(latestStatsig().options).toEqual({environment: {tier: 'test'}});
  });
});

describe('analytics seeded identity', () => {
  const SEEDED_CONFIG: AnalyticsConfig = {
    ...STATSIG_CONFIG,
    user: {userId: '42', userType: 'teacher'},
  };

  it('boots anonymous when the page rendered no identity', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(latestStatsig().user).not.toHaveProperty('userID');
    expect(latestStatsig().user.custom).not.toHaveProperty('userType');
  });

  it('carries a server-rendered identity into the init user', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(SEEDED_CONFIG);
    await drain();

    expect(latestStatsig().user).toMatchObject({
      userID: 'test-42',
      custom: expect.objectContaining({userType: 'teacher'}),
    });
  });

  it('keeps the anonymous session dimensions alongside the seed', async () => {
    document.cookie = `${COOKIE_NAME}=persisted-id; ${COOKIE_SCOPE}`;
    document.documentElement.dataset.geRegion = 'fa';

    const analytics = await loadAnalytics();
    analytics.onCoreReady(SEEDED_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().user).toEqual({
      userID: 'test-42',
      custom: {enabledExperiments: [], geRegion: 'fa', userType: 'teacher'},
      customIDs: {stableID: 'persisted-id'},
    });

    delete document.documentElement.dataset.geRegion;
  });

  it('still applies a later setUser, which carries the fuller dimensions', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(SEEDED_CONFIG);
    await drain();

    analytics.setUser({
      userId: '42',
      userType: 'teacher',
      isVerifiedInstructor: true,
      educatorRole: 'librarian',
    });

    // The seed and the update never serialize alike, so the same-user
    // short-circuit cannot swallow the first identify after a seeded boot.
    expect(latestStatsig().updateUserAsync).toHaveBeenCalledWith({
      userID: 'test-42',
      custom: {
        userType: 'teacher',
        isVerifiedInstructor: true,
        enabledExperiments: [],
        educatorRole: 'librarian',
      },
    });
  });

  it('logs the seeded identity on the console adapter', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(
      {provider: 'none', user: {userId: '42', userType: 'teacher'}},
      'development',
    );
    await vi.waitFor(() =>
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('Seeded identity'),
      ),
    );

    expect(log).toHaveBeenCalledWith(
      '[STATSIG ANALYTICS EVENT]: Seeded identity: userId: 42, userType: teacher',
    );
  });
});

describe('analytics identity', () => {
  it('sends the identity update without customIDs', async () => {
    document.cookie = `${COOKIE_NAME}=persisted-id; ${COOKIE_SCOPE}`;

    const analytics = await loadAnalytics();
    reportConsent(analytics, true);
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.setUser({
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
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.setUser({userId: '1234', userType: 'teacher'});
    analytics.setUser({userId: '1234', userType: 'teacher'});

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledTimes(1);
  });

  it('treats setUser(null) as a no-op', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.setUser(null);

    expect(latestStatsig().updateUserAsync).not.toHaveBeenCalled();
  });

  it('buffers a setUser issued before the client exists', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.setUser({userId: '77', userType: 'student'});
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledWith(
      expect.objectContaining({userID: 'test-77'}),
    );
  });
});

describe('stable id storage', () => {
  it('round-trips through the cookie and localStorage', async () => {
    const {persistStableId, readStableId} = await import('../stableId');
    persistStableId('abc-123');

    expect(document.cookie).toContain(`${COOKIE_NAME}=abc-123`);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe('abc-123');
    expect(readStableId()).toBe('abc-123');
  });

  it('falls back to localStorage when the cookie is gone', async () => {
    const {readStableId} = await import('../stableId');
    localStorage.setItem(LOCAL_STORAGE_KEY, 'from-storage');

    expect(readStableId()).toBe('from-storage');
  });

  it('falls through an empty cookie value to localStorage', async () => {
    const {readStableId} = await import('../stableId');
    localStorage.setItem(LOCAL_STORAGE_KEY, 'from-storage');
    document.cookie = `${COOKIE_NAME}=; ${COOKIE_SCOPE}`;

    expect(readStableId()).toBe('from-storage');
  });

  it('treats an undecodable cookie escape as absent', async () => {
    const {readStableId} = await import('../stableId');
    document.cookie = `${COOKIE_NAME}=%E0%A4%A; ${COOKIE_SCOPE}`;

    expect(readStableId()).toBeUndefined();
  });

  it('reads a value carrying a stray percent without throwing', async () => {
    const {readStableId} = await import('../stableId');
    document.cookie = `${COOKIE_NAME}=100%; ${COOKIE_SCOPE}`;

    expect(() => readStableId()).not.toThrow();
  });

  it('reports nothing once forgotten', async () => {
    const {forgetStableId, persistStableId, readStableId} = await import(
      '../stableId'
    );
    persistStableId('abc-123');
    forgetStableId();

    expect(readStableId()).toBeUndefined();
  });
});
