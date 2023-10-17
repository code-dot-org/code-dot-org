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
