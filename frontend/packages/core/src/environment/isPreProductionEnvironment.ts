import {isProductionEnvironment} from './isProductionEnvironment';

/**
 * Checks if the current environment is not 'production'.
 * @returns True if the current environment is not 'production'.
 */
export function isPreProductionEnvironment() {
  return !isProductionEnvironment();
}
