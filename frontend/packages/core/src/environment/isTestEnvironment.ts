import {getEnvironmentFromHostname} from './getEnvironmentFromHostname';

/**
 * Checks if the current environment is 'test'.
 * @returns True if the current environment is 'test'.
 */
export function isTestEnvironment() {
  return getEnvironmentFromHostname() === 'test';
}
