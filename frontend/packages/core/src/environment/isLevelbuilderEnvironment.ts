import {getEnvironmentFromHostname} from './getEnvironmentFromHostname';

/**
 * Checks if the current environment is 'levelbuilder'.
 * @returns True if the current environment is 'levelbuilder'.
 */
export function isLevelbuilderEnvironment() {
  return getEnvironmentFromHostname() === 'levelbuilder';
}
