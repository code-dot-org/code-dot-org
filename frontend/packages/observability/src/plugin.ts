import type {
  CorePlugin,
  SiteConfig,
  SiteConfigExtensions,
} from '@code-dot-org/core';

import {createObservabilityClient} from './factory';
import type {ObservabilityConfig} from './types';

import {_initializeSingleton} from './index';

// Augment SiteConfig to expose the observability field when this package is imported.
// This is a type-only augmentation — at runtime SiteConfig always parses the field.
declare module '@code-dot-org/core' {
  interface SiteConfigExtensions {
    observability: ObservabilityConfig;
  }
}

/**
 * CorePlugin implementation for observability.
 * Pass to initializeCore([observabilityPlugin]) in the host app bootstrap.
 *
 * onCoreReady is synchronous — it fires-and-forgets the async factory call.
 * createObservabilityClient dynamically imports SentryAdapter (and @sentry/browser)
 * at the adapter level, so the bundle split happens inside the factory. The singleton
 * starts as NoopAdapter and is replaced once the dynamic import resolves.
 *
 * Requirements: 2.4, 4.1, 6.1, 6.3, 6.5
 */
export const observabilityPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    const obs = config.observability as ObservabilityConfig | undefined;

    // If no observability config or provider is 'none', leave singleton as no-op
    if (!obs || obs.provider === 'none') {
      return;
    }

    // Fire-and-forget: the factory dynamically imports the adapter, then wires up
    // the singleton. onCoreReady stays synchronous — no async needed here.
    createObservabilityClient(obs.provider, obs).then(client => {
      client.init(obs);
      _initializeSingleton(client);
    });
  },
};
