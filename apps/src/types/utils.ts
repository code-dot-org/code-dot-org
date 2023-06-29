// Helper for converting a string boolean ('true' or 'false') to a boolean.
// Many of our apis will return strings rather than booleans.
export function convertOptionalStringToBoolean(
  str: 'true' | 'false' | undefined,
  defaultValue: boolean
) {
  if (!str) {
    return defaultValue;
  }
  return str === 'true';
}
