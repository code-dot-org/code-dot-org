import {v4 as uuidv4} from 'uuid';

import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';
// Not the consent index: it would pull the CMP provider into every consumer bundle.
import {isConsentSettled, whenConsentSettled} from '../consent/settled';
import {consent} from '../consent/store';
import {getEnabledExperiments} from '../experiments';

import {DeferredAdapter} from './adapters/DeferredAdapter';
import {NoopAdapter} from './adapters/NoopAdapter';
import {createAnalyticsClient, type AnalyticsClientKind} from './factory';
import {
  fetchStableId,
  forgetStableId,
  persistStableId,
  readStableId,
} from './stableId';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from './types';

export type {AnalyticsClient, AnalyticsConfig, AnalyticsSession, AnalyticsUser};
export {createAnalyticsClient};

let analyticsClient: AnalyticsClient = new NoopAdapter();

/** Rails stamps the global edition region on the DOM. */
function geRegion(): string | null {
  return document.documentElement.dataset.geRegion ?? null;
}

let booted = false;

/** Stands in for an event whose caller supplied no name; dashboards count these. */
const MISSING_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

export function sendEvent(
  name: string,
  payload?: Record<string, unknown>,
  value?: string | number,
): void {
  if (!name) {
    console.warn('[analytics] sendEvent was called without an event name');
    analyticsClient.sendEvent(MISSING_EVENT_NAME, payload);
    return;
  }

  analyticsClient.sendEvent(name, payload, value);
}

export function setUser(user: AnalyticsUser | null): void {
  analyticsClient.setUser(user);
}

/** Consent gates persistence only, and is read once per page load. */
async function resolveSession(): Promise<AnalyticsSession> {
  const granted = consent.current().categories.has('performance');

  let stableId: string | undefined;
  if (granted) {
    stableId = readStableId() ?? (await fetchStableId()) ?? uuidv4();
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
  void Promise.all([resolveSession(), createAnalyticsClient(kind)])
    .then(([session, client]) => {
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

/** Register after consentPlugin, whose settlement the boot below waits for. */
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

    // A CMP that never settles means nothing is ever sent.
    if (isConsentSettled()) {
      bootClient(kind, resolvedConfig, deferredClient);
      return;
    }

    void whenConsentSettled().then(() => {
      bootClient(kind, resolvedConfig, deferredClient);
    });
  },
};
