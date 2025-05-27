import {BrowserAgent} from '@newrelic/browser-agent';

import {getNewRelicConfig} from '@/config/newrelic';
import {getStage} from '@/config/stage';

async function initializeNewRelic(): Promise<BrowserAgent | undefined> {
  if (typeof window === 'undefined') {
    return Promise.resolve(undefined);
  }

  const stage = getStage();

  if (stage !== 'test' && stage !== 'production') {
    console.log(`New Relic not loaded in ${stage} environment`);
    // Don't load New Relic in development environments
    return Promise.resolve(undefined);
  }

  const {BrowserAgent} = await import(
    '@newrelic/browser-agent/loaders/browser-agent'
  );

  // Populate using values in copy-paste JavaScript snippet.
  const options = {
    init: {
      distributed_tracing: {enabled: true},
      privacy: {cookies_enabled: true},
      ajax: {deny_list: ['bam.nr-data.net']},
    },
    ...getNewRelicConfig(),
  };

  // The agent loader code executes immediately on instantiation.
  return new BrowserAgent(options);
}

export default initializeNewRelic();
