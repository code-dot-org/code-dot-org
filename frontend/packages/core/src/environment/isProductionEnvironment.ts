import {getEnvironmentFromHostname} from './getEnvironmentFromHostname';

/**
 * Checks if the current environment is 'production'.
 * @returns True if the current environment is 'production'.
 */
export function isProductionEnvironment() {
  return getEnvironmentFromHostname() === 'production';
}
