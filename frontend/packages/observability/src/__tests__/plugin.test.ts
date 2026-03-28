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

import * as Sentry from '@sentry/browser';
import type {SiteConfig, SiteConfigExtensions} from '@code-dot-org/core';

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
  });

  it('onCoreReady with provider "none" does not initialize Sentry', () => {
    const config = {
      observability: {provider: 'none'},
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('onCoreReady with provider "sentry" initializes Sentry with the given DSN', () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({dsn: 'https://test@sentry.io/1'}),
    );
  });

  it('Sentry is not initialized before onCoreReady', () => {
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('Sentry is initialized after onCoreReady with sentry provider', () => {
    const config = {
      observability: {
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      },
    } as unknown as PluginConfig;

    observabilityPlugin.onCoreReady(config);
    expect(Sentry.init).toHaveBeenCalledOnce();
  });

  it('onCoreReady with missing observability config is a no-op', () => {
    const config = {} as unknown as PluginConfig;
    expect(() => observabilityPlugin.onCoreReady(config)).not.toThrow();
    expect(Sentry.init).not.toHaveBeenCalled();
  });
});
