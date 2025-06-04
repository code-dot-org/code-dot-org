import {Honeybadger} from '@honeybadger-io/react';

import {getStage} from '@/config/stage';
import {getEnv} from '@/providers/environment';
export function initializeHoneybadger() {
  Honeybadger.configure({
    apiKey: getEnv('NEXT_PUBLIC_HONEYBADGER_BROWSER_API_KEY'),
    environment: getStage(),
    revision: getEnv('NEXT_PUBLIC_CONTAINER_DIGEST'),
    projectRoot: 'webpack://_N_E/./',
    debug: true,
    reportData: true,
  });
  Honeybadger.logger.debug('Honeybadger configured for browser');
}
