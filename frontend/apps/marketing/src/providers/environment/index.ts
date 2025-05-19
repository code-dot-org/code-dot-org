import {PUBLIC_ENV_KEY} from '@/providers/environment/constants';

import EnvironmentLoader from './EnvironmentLoader';

export function getEnv(key: string) {
  // Grab environment variable from the browser
  if (typeof window !== 'undefined') {
    return window[PUBLIC_ENV_KEY][key];
  }

  // Grab environment variable from node server
  return process.env[key];
}

export default EnvironmentLoader;
