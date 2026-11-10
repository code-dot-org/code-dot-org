import type {Location, LocationInput} from '../types';

/**
 * Resolves the location value from the provided input.
 * The input can be either a location object directly, or a function that returns a location object.
 * If no input is provided and a fallback location exists, use the fallback.
 * Otherwise, use a default location object with x and y coordinates set to 200.
 *
 * @param locationInput - The location object or a function returning the location object.
 * @param fallback - Optional. Ex. The current location of an existing variable bubble, used as a fallback.
 * @returns The resolved location object with x and y coordinates.
 */
export function resolveLocation(
  locationInput: LocationInput,
  fallback?: Location,
): Location {
  if (!locationInput) {
    return fallback || {x: 200, y: 200};
  }

  return typeof locationInput === 'function' ? locationInput() : locationInput;
}
