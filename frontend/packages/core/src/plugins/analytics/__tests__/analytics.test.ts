/**
 * The stable-ID cookie is Secure and scoped to .code.org, so the document is an
 * https code.org host. Each case resets modules, so a fresh module is a pre-boot
 * module, and `loadAnalytics` hands back the consent exports of that generation.
 * `fetch` is stubbed to answer SERVER_STABLE_ID unless a case says otherwise.
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
    // Recorded by identity, so tests can assert what the adapter handed on.
    Object.assign(this, {
      key,
      user,
      options,
      logEvent: vi.fn(),
      updateUserAsync: vi.fn().mockResolvedValue(undefined),
      initializeAsync: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    });
    statsigInstances.push(this as unknown as MockStatsigClient);
  }),
}));

interface AutoCaptureOptions {
  eventFilterFunc?: (event: {eventName: string}) => boolean;
  consoleLogAutoCaptureSettings?: unknown;
}

const autoCaptureCalls: Array<{client: unknown; options: AutoCaptureOptions}> =
  [];

vi.mock('@statsig/web-analytics', () => ({
  runStatsigAutoCapture: vi.fn((client: unknown, options: AutoCaptureOptions) =>
    autoCaptureCalls.push({client, options}),
  ),
}));

import type {SiteConfig, SiteConfigExtensions} from '../../../config';
import type {AnalyticsConfig} from '../types';

// Spelled out rather than imported, so the tests pin the contract.
const COOKIE_NAME = 'statsig_stable_id';
const LEGACY_LOCAL_STORAGE_KEY = 'STATSIG_STABLE_ID';
const COOKIE_SCOPE = 'path=/; domain=.code.org';
const STABLE_ID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERSISTED_STABLE_ID = '8f819c93-3aa9-4c2f-9bea-8d32a448f368';
const SERVER_STABLE_ID = '2b9f4d1e-5c7a-4e3b-9d8f-1a2b3c4d5e6f';

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

/** A pre-boot analytics module plus the consent modules of the same generation. */
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
}

/** Makes GET /api/stable_id answer `body`, as the Rails endpoint does, in plain text. */
function stubServerStableId(body: string, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(body, {status, headers: {'content-type': 'text/plain'}}),
    ),
  );
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
  autoCaptureCalls.length = 0;
  clearStableId();
  localStorage.clear();
  stubServerStableId(SERVER_STABLE_ID);
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  clearStableId();
  localStorage.clear();
  vi.unstubAllGlobals();
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

  it('stays silent when the switch is off, even with a provider configured', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({...STATSIG_CONFIG, enabled: false});
    await Promise.resolve();
    await Promise.resolve();

    analytics.sendEvent('ignored');

    expect(statsigInstances).toHaveLength(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('stays silent when the switch is off in development', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({provider: 'none', enabled: false}, 'development');
    await Promise.resolve();
    await Promise.resolve();

    analytics.sendEvent('ignored');

    expect(statsigInstances).toHaveLength(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('boots normally when the switch is explicitly on', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({...STATSIG_CONFIG, enabled: true});
    await drain();

    expect(statsigInstances).toHaveLength(1);
  });

  it('boots normally when the config omits the switch', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(statsigInstances).toHaveLength(1);
  });

  it('logs in development when the config omits the switch', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({provider: 'none'}, 'development');

    await vi.waitFor(() =>
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('Statsig Stable ID'),
      ),
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

  it('reports a name-less event under the missing-name stand-in', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    analytics.sendEvent('', {a: 1});

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'NO_VALID_EVENT_NAME_LOG_ERROR',
      'NO_VALID_EVENT_NAME_LOG_ERROR',
      {a: 1},
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('without an event name'),
    );
  });

  it('sends an explicit value in place of the repeated name', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.sendEvent('named', {a: 1}, 'variant-b');

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'named',
      'variant-b',
      {a: 1},
    );
  });

  it('keeps an explicit value through the buffer', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    analytics.sendEvent('buffered', undefined, 3);
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().logEvent).toHaveBeenCalledWith(
      'buffered',
      3,
      undefined,
    );
  });

  it('sends buffered events after a grant, and persists the stable id the server holds', async () => {
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
    const [request] = vi.mocked(fetch).mock.calls[0] as [Request];
    expect(request.url).toBe('https://test-studio.code.org/api/stable_id');
    expect(request.signal).toBeInstanceOf(AbortSignal);
    expect(persistedStableId()).toBe(SERVER_STABLE_ID);
    expect(latestStatsig().user.customIDs?.stableID).toBe(SERVER_STABLE_ID);
  });

  it('still sends buffered events after a denial — only persistence differs', async () => {
    document.cookie = `${COOKIE_NAME}=${PERSISTED_STABLE_ID}; ${COOKIE_SCOPE}`;
    localStorage.setItem(LEGACY_LOCAL_STORAGE_KEY, PERSISTED_STABLE_ID);

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
    // No stable ID reaches the SDK, which is its cue to mint and store one.
    expect(persistedStableId()).toBeUndefined();
    expect(localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)).toBeNull();
    expect(latestStatsig().user.customIDs).toEqual({stableID: undefined});
    expect(fetch).not.toHaveBeenCalled();
  });

  it('adopts an already-persisted stable id on a grant without asking the server', async () => {
    document.cookie = `${COOKIE_NAME}=${PERSISTED_STABLE_ID}; ${COOKIE_SCOPE}`;

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().user.customIDs?.stableID).toBe(PERSISTED_STABLE_ID);
    expect(persistedStableId()).toBe(PERSISTED_STABLE_ID);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('replaces a malformed cookie with the stable id the server holds', async () => {
    document.cookie = `${COOKIE_NAME}=not-a-uuid; ${COOKIE_SCOPE}`;

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(persistedStableId()).toBe(SERVER_STABLE_ID);
    expect(latestStatsig().user.customIDs?.stableID).toBe(SERVER_STABLE_ID);
  });

  it('mints a stable id when the server does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(persistedStableId()).toMatch(STABLE_ID_FORMAT);
    expect(latestStatsig().user.customIDs?.stableID).toBe(persistedStableId());
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to fetch the stable ID'),
      expect.any(Error),
    );
  });

  it('mints a stable id when the server answers with something else', async () => {
    stubServerStableId('<html>blocked</html>');

    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(persistedStableId()).toMatch(STABLE_ID_FORMAT);
    expect(persistedStableId()).not.toBe(SERVER_STABLE_ID);
  });

  it('ignores consent changes after the single boot-time decision', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(STATSIG_CONFIG);
    reportConsent(analytics, false);
    await drain();
    const client = latestStatsig();

    // A mid-session accept earns no cookie until the next page load.
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

  it('sends a null GE region when the page does not stamp one', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(latestStatsig().user.custom).toEqual({
      enabledExperiments: [],
      geRegion: null,
    });
  });

  it('passes the environment tier and leaves SDK storage at its default', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    expect(latestStatsig().options).toEqual({environment: {tier: 'test'}});
  });
});

describe('analytics autocapture', () => {
  const AUTO_CAPTURE_CONFIG: AnalyticsConfig = {
    ...STATSIG_CONFIG,
    statsig: {clientKey: 'client-test-key', autoCapture: true},
  };

  /** The SDK's eleven auto_capture events, spelled out to pin the wire names. */
  const CAPTURED = [
    'auto_capture::click',
    'auto_capture::copy',
    'auto_capture::dead_click',
    'auto_capture::error',
    'auto_capture::form_submit',
    'auto_capture::page_view',
    'auto_capture::rage_click',
    'auto_capture::session_start',
    'auto_capture::web_vitals',
  ];
  const EXCLUDED = ['auto_capture::page_view_end', 'auto_capture::performance'];

  /** Waits for the dynamic import behind autocapture to resolve. */
  async function drainAutoCapture() {
    await vi.waitFor(() => expect(autoCaptureCalls).toHaveLength(1));
    return autoCaptureCalls[0];
  }

  /** Lets every pending microtask run, so "never called" means never. */
  async function settle() {
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  it('binds autocapture to the client the adapter already built', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(AUTO_CAPTURE_CONFIG);
    await drain();

    // One client, not a second on the same SDK key.
    expect((await drainAutoCapture()).client).toBe(latestStatsig());
    expect(statsigInstances).toHaveLength(1);
  });

  it('admits the nine kept events and rejects the two legacy drops', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(AUTO_CAPTURE_CONFIG);
    await drain();
    const filter = (await drainAutoCapture()).options.eventFilterFunc;

    expect(CAPTURED.map(eventName => filter?.({eventName}))).toEqual(
      CAPTURED.map(() => true),
    );
    expect(EXCLUDED.map(eventName => filter?.({eventName}))).toEqual(
      EXCLUDED.map(() => false),
    );
  });

  it('leaves console capture off', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(AUTO_CAPTURE_CONFIG);
    await drain();

    expect(
      (await drainAutoCapture()).options.consoleLogAutoCaptureSettings,
    ).toBeUndefined();
  });

  it('stays off when the config omits the flag', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();
    await settle();

    expect(autoCaptureCalls).toHaveLength(0);
  });

  it('stays off when the flag is false', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({
      ...STATSIG_CONFIG,
      statsig: {clientKey: 'client-test-key', autoCapture: false},
    });
    await drain();
    await settle();

    expect(autoCaptureCalls).toHaveLength(0);
  });

  it('stays off when the switch is off, because no client is built', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady({...AUTO_CAPTURE_CONFIG, enabled: false});
    await settle();

    expect(statsigInstances).toHaveLength(0);
    expect(autoCaptureCalls).toHaveLength(0);
  });

  it('stays off while consent has not settled, because no client is built', async () => {
    const analytics = await loadAnalytics();
    analytics.onCoreReady(AUTO_CAPTURE_CONFIG);
    await settle();

    expect(statsigInstances).toHaveLength(0);
    expect(autoCaptureCalls).toHaveLength(0);
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
    document.cookie = `${COOKIE_NAME}=${PERSISTED_STABLE_ID}; ${COOKIE_SCOPE}`;
    document.documentElement.dataset.geRegion = 'fa';

    const analytics = await loadAnalytics();
    analytics.onCoreReady(SEEDED_CONFIG);
    reportConsent(analytics, true);
    await drain();

    expect(latestStatsig().user).toEqual({
      userID: 'test-42',
      custom: {enabledExperiments: [], geRegion: 'fa', userType: 'teacher'},
      customIDs: {stableID: PERSISTED_STABLE_ID},
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

    // The seed and the update never serialize alike, so the identify is not dropped.
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
    document.cookie = `${COOKIE_NAME}=${PERSISTED_STABLE_ID}; ${COOKIE_SCOPE}`;

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

  it('sends a null educator role rather than omitting it', async () => {
    const analytics = await loadAnalytics();
    analytics.markConsentSettled();
    analytics.onCoreReady(STATSIG_CONFIG);
    await drain();

    analytics.setUser({
      userId: '1234',
      userType: 'student',
      educatorRole: null,
    });

    expect(latestStatsig().updateUserAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        custom: expect.objectContaining({educatorRole: null}),
      }),
    );
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
