import {getEnvironmentFromHostname} from './getEnvironmentFromHostname';

/**
 * Checks if the current environment is 'development'.
 * @returns True if the current environment is 'development'.
 */
export function isDevelopmentEnvironment() {
  return getEnvironmentFromHostname() === 'development';
}
