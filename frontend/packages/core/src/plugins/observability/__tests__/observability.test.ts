/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
  browserTracingIntegration: vi.fn().mockReturnValue({name: 'BrowserTracing'}),
  consoleLoggingIntegration: vi.fn().mockReturnValue({name: 'ConsoleLogging'}),
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  metrics: {
    count: vi.fn(),
    gauge: vi.fn(),
    distribution: vi.fn(),
  },
}));

import * as Sentry from '@sentry/browser';

import type {SiteConfig, SiteConfigExtensions} from '../../../config';
import {DeferredAdapter} from '../adapters/DeferredAdapter';
import {NoopAdapter} from '../adapters/NoopAdapter';
import {SentryAdapter} from '../adapters/SentryAdapter';
import {createObservabilityClient} from '../factory';
import {
  _initializeSingleton,
  isConsented,
  init,
  logger,
  metrics,
  observabilityPlugin,
  recordError,
  shutdown,
  setConsented,
} from '../index';
import type {ObservabilityConfig} from '../types';
import {isSampled} from '../sampling';

type PluginConfig = SiteConfig &
  SiteConfigExtensions & {observability: ObservabilityConfig};

describe('observability plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _initializeSingleton(new NoopAdapter());
    sessionStorage.clear();
  });

  it('creates a no-op client for provider "none"', async () => {
    await expect(createObservabilityClient('none')).resolves.toBeInstanceOf(
      NoopAdapter,
    );
  });

  it('creates a no-op client when provider is omitted', async () => {
    await expect(createObservabilityClient()).resolves.toBeInstanceOf(
      NoopAdapter,
    );
  });

  it('creates a sentry client for provider "sentry"', async () => {
    await expect(createObservabilityClient('sentry')).resolves.toBeInstanceOf(
      SentryAdapter,
    );
  });

  it('throws for an unsupported provider', async () => {
    await expect(
      createObservabilityClient('datadog' as ObservabilityConfig['provider']),
    ).rejects.toThrow('Unsupported observability provider');
  });

  it('initializes Sentry when provider is sentry', async () => {
    sessionStorage.setItem(
      '__cdo_observability_session_id__',
      '11111111-1111-1111-1111-111111111111',
    );
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
        sampling: {
          errorSampleRate: 0.5,
          tracesSampleRate: 0.25,
          logSampleRate: 1,
          metricsSampleRate: 1,
        },
      },
    } as PluginConfig;

    observabilityPlugin.onCoreReady(config);
    await vi.dynamicImportSettled();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/1',
        sampleRate: 0.5,
        tracesSampleRate: 0.25,
        sendDefaultPii: false,
        enableLogs: true,
        enableMetrics: true,
      }),
    );
  });

  it('is a no-op when provider is none', () => {
    observabilityPlugin.onCoreReady({
      observability: {provider: 'none'},
    } as PluginConfig);

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('is a no-op when observability config is missing', () => {
    observabilityPlugin.onCoreReady({} as PluginConfig);

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('keeps module-level api as no-op before plugin initialization', async () => {
    recordError(new Error('boom'), {lab: 'music'});
    logger.warn('warn-before-init', {lab: 'music'});
    metrics.count('metric.before.init', 1, {lab: 'music'});
    init({provider: 'none'});
    await expect(shutdown()).resolves.toBeUndefined();

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.logger.warn).not.toHaveBeenCalled();
    expect(Sentry.metrics.count).not.toHaveBeenCalled();
  });

  it('delegates module-level recordError after initialization', async () => {
    observabilityPlugin.onCoreReady({
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as PluginConfig);
    await vi.dynamicImportSettled();

    const error = new Error('boom');
    recordError(error, {lab: 'music'});

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: {lab: 'music'},
    });
  });

  it('delegates logger and metrics calls after initialization', async () => {
    sessionStorage.setItem(
      '__cdo_observability_session_id__',
      '22222222-2222-2222-2222-222222222222',
    );
    observabilityPlugin.onCoreReady({
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
        sampling: {logSampleRate: 1, metricsSampleRate: 1},
      },
    } as PluginConfig);
    await vi.dynamicImportSettled();

    logger.info('message', {source: 'test'});
    metrics.count('metric.name', 2, {source: 'test'});

    expect(Sentry.logger.info).toHaveBeenCalledWith('message', {
      source: 'test',
    });
    expect(Sentry.metrics.count).toHaveBeenCalledWith('metric.name', 2, {
      attributes: {source: 'test'},
    });
  });

  it('buffers startup calls until the async provider client is ready', async () => {
    const deferredClient = new DeferredAdapter();
    _initializeSingleton(deferredClient);

    logger.info('startup log', {source: 'boot'});
    metrics.count('startup.metric', 1, {source: 'boot'});
    recordError(new Error('startup error'), {source: 'boot'});
    setConsented('user-123');

    expect(Sentry.logger.info).not.toHaveBeenCalled();
    expect(Sentry.metrics.count).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(isConsented()).toBe(true);

    const client = new SentryAdapter();
    client.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 1, metricsSampleRate: 1},
    });
    deferredClient.flushTo(client);
    _initializeSingleton(client);

    expect(Sentry.logger.info).toHaveBeenCalledWith('startup log', {
      source: 'boot',
    });
    expect(Sentry.metrics.count).toHaveBeenCalledWith('startup.metric', 1, {
      attributes: {source: 'boot'},
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: {source: 'boot'},
    });
    expect(Sentry.setUser).toHaveBeenCalledWith({id: 'user-123'});
  });

  it('tracks consent through the module-level API', async () => {
    observabilityPlugin.onCoreReady({
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as PluginConfig);
    await vi.dynamicImportSettled();

    setConsented('user-123');
    expect(isConsented()).toBe(true);
    expect(Sentry.setUser).toHaveBeenCalledWith({id: 'user-123'});

    setConsented(null);
    expect(isConsented()).toBe(false);
    expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
  });

  it('shuts down through the module-level API after initialization', async () => {
    observabilityPlugin.onCoreReady({
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as PluginConfig);
    await vi.dynamicImportSettled();

    await expect(shutdown()).resolves.toBeUndefined();
    expect(Sentry.close).toHaveBeenCalledOnce();
  });

  it('samples logs and metrics by hashed session id', () => {
    const adapter = new SentryAdapter();
    sessionStorage.setItem(
      '__cdo_observability_session_id__',
      '33333333-3333-3333-3333-333333333333',
    );

    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 0.5, metricsSampleRate: 0.5},
    });

    const sessionId = sessionStorage.getItem(
      '__cdo_observability_session_id__',
    );
    expect(
      (
        adapter as unknown as {isLogSampled: (rate?: number) => boolean}
      ).isLogSampled(0.5),
    ).toBe(isSampled(sessionId ?? undefined, 0.5));
    expect(
      (
        adapter as unknown as {isMetricsSampled: (rate?: number) => boolean}
      ).isMetricsSampled(0.5),
    ).toBe(isSampled(sessionId ?? undefined, 0.5));
  });

  it('disables session-based sampling when sessionStorage throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage blocked');
      });

    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 1, metricsSampleRate: 1},
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(
      (
        adapter as unknown as {isLogSampled: (rate?: number) => boolean}
      ).isLogSampled(1),
    ).toBe(false);
    expect(
      (
        adapter as unknown as {isMetricsSampled: (rate?: number) => boolean}
      ).isMetricsSampled(1),
    ).toBe(false);

    getItem.mockRestore();
    warnSpy.mockRestore();
  });
});
