import {getEnvironmentFromHostname} from './getEnvironmentFromHostname';

/**
 * Checks if the current environment is 'staging'.
 * @returns True if the current environment is 'staging'.
 */
export function isStagingEnvironment() {
  return getEnvironmentFromHostname() === 'staging';
}
