import {v4 as uuidv4} from 'uuid';

import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';
// Leaf modules, not the consent plugin index: importing the index would pull a
// CMP provider and the observability graph behind it into consumer bundles.
import {isConsentSettled, whenConsentSettled} from '../consent/settled';
import {consent} from '../consent/store';
import {getEnabledExperiments} from '../experiments';

import {DeferredAdapter} from './adapters/DeferredAdapter';
import {NoopAdapter} from './adapters/NoopAdapter';
import {createAnalyticsClient, type AnalyticsClientKind} from './factory';
import {forgetStableId, persistStableId, readStableId} from './stableId';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from './types';

export type {AnalyticsClient, AnalyticsConfig, AnalyticsSession, AnalyticsUser};
export {createAnalyticsClient};

let analyticsClient: AnalyticsClient = new NoopAdapter();

/**
 * Rails chooses the Global Edition region server-side and stamps the result on
 * `<html>`; a shell that does not stamp it reads null.
 */
function geRegion(): string | null {
  return document.documentElement.dataset.geRegion ?? null;
}

let booted = false;

/** Stands in for an event whose caller supplied no name; dashboards count these. */
const MISSING_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

export function sendEvent(
  name: string,
  payload?: Record<string, unknown>,
): void {
  if (!name) {
    console.warn('[analytics] sendEvent was called without an event name');
    analyticsClient.sendEvent(MISSING_EVENT_NAME, payload);
    return;
  }

  analyticsClient.sendEvent(name, payload);
}

export function setUser(user: AnalyticsUser | null): void {
  analyticsClient.setUser(user);
}

/**
 * Resolves this page load's session, making its one consent decision: a
 * `performance` grant persists the stable ID, anything else deletes both copies
 * and leaves the ID undefined. Persistence precedes client construction.
 */
function resolveSession(): AnalyticsSession {
  const granted = consent.current().categories.has('performance');

  let stableId: string | undefined;
  if (granted) {
    stableId = readStableId() || uuidv4();
    persistStableId(stableId);
  } else {
    forgetStableId();
  }

  return {
    stableId,
    enabledExperiments: getEnabledExperiments(),
    geRegion: geRegion(),
  };
}

function bootClient(
  kind: AnalyticsClientKind,
  config: AnalyticsConfig,
  deferredClient: DeferredAdapter,
): void {
  const session = resolveSession();

  void createAnalyticsClient(kind)
    .then(client => {
      client.init(config, session);
      deferredClient.flushTo(client);
      analyticsClient = client;
    })
    .catch(error => {
      console.warn(
        '[analytics] failed to create provider client; falling back to no-op client:',
        error,
      );
      const noopClient = new NoopAdapter();
      deferredClient.flushTo(noopClient);
      analyticsClient = noopClient;
    });
}

/**
 * CorePlugin implementation for product analytics. Register at bootstrap via
 * initializeCore({plugins: [analyticsPlugin]}), after `consentPlugin`.
 */
export const analyticsPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    if (booted) return;
    booted = true;

    const analytics = config.analytics as AnalyticsConfig | undefined;
    if (analytics?.enabled === false) return;

    const provider = analytics?.provider ?? 'none';

    const kind: AnalyticsClientKind | null =
      provider === 'statsig'
        ? 'statsig'
        : config.environment === 'development'
          ? 'console'
          : null;

    if (!kind) return;

    const resolvedConfig = analytics ?? {provider: 'none' as const};
    const deferredClient = new DeferredAdapter();
    analyticsClient = deferredClient;

    // The consent decision cannot be made before the CMP has settled, so the
    // client waits for it. A CMP that never settles means nothing is sent.
    if (isConsentSettled()) {
      bootClient(kind, resolvedConfig, deferredClient);
      return;
    }

    void whenConsentSettled().then(() => {
      bootClient(kind, resolvedConfig, deferredClient);
    });
  },
};
