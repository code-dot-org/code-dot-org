import {getFileNameWithNumberSuffix} from './getFileNameWithNumberSuffix';

/**
 * Returns the input filename if it does not collide with any name in
 * `existing`. Otherwise, increments a numeric suffix until the result is
 * unique.
 */
export const uniqueFileName = (
  filename: string,
  existing: string[],
  separator = '_'
): string => {
  const taken = new Set(existing);
  let candidate = filename;
  while (taken.has(candidate)) {
    candidate = getFileNameWithNumberSuffix(candidate, separator);
  }
  return candidate;
};
