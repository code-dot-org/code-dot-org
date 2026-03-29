/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';

// Mock @sentry/browser
vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
  browserTracingIntegration: vi.fn().mockReturnValue({}),
}));

// Mock @code-dot-org/core to avoid needing a real window.__CODE_STUDIO__
vi.mock('@code-dot-org/core', async () => {
  const actual =
    await vi.importActual<typeof import('@code-dot-org/core')>(
      '@code-dot-org/core',
    );
  return {
    ...actual,
  };
});

// Mock the factory — it's async (returns Promise<ObservabilityClient>).
// mockResolvedValue ensures the .then() in onCoreReady resolves synchronously
// in the microtask queue during tests.
const mockClient = {
  init: vi.fn(),
  recordError: vi.fn(),
  setConsented: vi.fn(),
  isConsented: vi.fn().mockReturnValue(false),
  shutdown: vi.fn().mockResolvedValue(undefined),
  logger: {},
  metrics: {},
};
vi.mock('../factory', () => ({
  createObservabilityClient: vi.fn().mockResolvedValue(mockClient),
}));

import * as Sentry from '@sentry/browser';
import type {SiteConfig, SiteConfigExtensions} from '@code-dot-org/core';

import {createObservabilityClient} from '../factory';
import {NoopAdapter} from '../adapters/noop';
import {_initializeSingleton} from '../index';
import {observabilityPlugin} from '../plugin';
import type {ObservabilityConfig} from '../types';

type PluginConfig = SiteConfig &
  SiteConfigExtensions & {observability: ObservabilityConfig};

describe('observabilityPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton to no-op before each test
    _initializeSingleton(new NoopAdapter());
    // Re-apply mock return values after clearAllMocks
    vi.mocked(mockClient.shutdown).mockResolvedValue(undefined);
    vi.mocked(mockClient.isConsented).mockReturnValue(false);
    vi.mocked(createObservabilityClient).mockResolvedValue(mockClient as any);
  });

  it('onCoreReady with provider "none" does not call factory', () => {
    const config = {
      observability: {provider: 'none'},
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);

    expect(createObservabilityClient).not.toHaveBeenCalled();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('onCoreReady with provider "sentry" calls factory and initializes client', async () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);
    // Flush the microtask queue so the .then() callback runs
    await Promise.resolve();

    expect(createObservabilityClient).toHaveBeenCalledWith(
      'sentry',
      config.observability,
    );
    expect(mockClient.init).toHaveBeenCalledWith(config.observability);
  });

  it('observabilityClient is no-op before onCoreReady', () => {
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('factory is called exactly once after onCoreReady with sentry provider', async () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);
    await Promise.resolve();

    expect(createObservabilityClient).toHaveBeenCalledOnce();
  });

  it('onCoreReady with missing observability config is a no-op', () => {
    const config = {} as unknown as PluginConfig;
    expect(() => observabilityPlugin.onCoreReady(config)).not.toThrow();
    expect(createObservabilityClient).not.toHaveBeenCalled();
  });
});
