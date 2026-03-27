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

import type {SiteConfig, SiteConfigExtensions} from '@code-dot-org/core';

import {NoopAdapter} from '../adapters/noop';
import {SentryAdapter} from '../adapters/sentry';
import {singleton, _initializeSingleton} from '../index';
import {observabilityPlugin} from '../plugin';
import type {ObservabilityConfig} from '../types';

type PluginConfig = SiteConfig &
  SiteConfigExtensions & {observability: ObservabilityConfig};

describe('observabilityPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton to no-op before each test
    _initializeSingleton(new NoopAdapter());
  });

  it('onCoreReady with provider "none" does not call factory or _initializeSingleton', () => {
    const config = {
      observability: {provider: 'none'},
    } as unknown as PluginConfig;
    const initSpy = vi.spyOn(NoopAdapter.prototype, 'init');

    observabilityPlugin.onCoreReady(config);

    // Singleton should still be a NoopAdapter (unchanged)
    expect(singleton).toBeInstanceOf(NoopAdapter);
    // init should not have been called on a new adapter
    expect(initSpy).not.toHaveBeenCalled();
    initSpy.mockRestore();
  });

  it('onCoreReady with provider "sentry" calls factory and _initializeSingleton', () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);

    // Singleton should now be a SentryAdapter
    expect(singleton).toBeInstanceOf(SentryAdapter);
  });

  it('singleton is NoopAdapter before onCoreReady', () => {
    expect(singleton).toBeInstanceOf(NoopAdapter);
  });

  it('singleton is SentryAdapter after onCoreReady with sentry provider', () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);
    expect(singleton).toBeInstanceOf(SentryAdapter);
  });

  it('onCoreReady with missing observability config is a no-op', () => {
    const config = {} as unknown as PluginConfig;
    expect(() => observabilityPlugin.onCoreReady(config)).not.toThrow();
    expect(singleton).toBeInstanceOf(NoopAdapter);
  });
});
