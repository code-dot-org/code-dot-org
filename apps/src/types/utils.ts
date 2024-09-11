// Helper for converting a string boolean ('true' or 'false') to a boolean.
// However, if an actual boolean is passed in, it's returned directly.
// If undefined is passed in, then the provided defaultValue is returned.
// Some of our server APIs will return strings rather than booleans.
export function convertOptionalStringToBoolean(
  value: 'true' | 'false' | boolean | undefined,
  defaultValue: boolean
) {
  if (typeof value === 'boolean') {
    return value;
  } else if (!value) {
    return defaultValue;
  } else {
    return value === 'true';
  }
}

/**
 * Return the keys of an object as a typed array.
 */
export function getTypedKeys<K extends string | number | symbol>(object: {
  [key in K]?: unknown;
}): K[] {
  return Object.keys(object) as K[];
}

/**
 * A type that is one of the values of an object type.
 */
export type ValueOf<T> = T[keyof T];
