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
 * Requirements: 2.4, 4.1, 6.1, 6.3
 */
export const observabilityPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    const obs = config.observability as ObservabilityConfig | undefined;

    // If no observability config or provider is 'none', leave singleton as no-op
    if (!obs || obs.provider === 'none') {
      return;
    }

    const client = createObservabilityClient(obs.provider, obs);
    client.init(obs);
    _initializeSingleton(client);
  },
};
