// Helper for converting a string boolean ('true' or 'false') to a boolean.
// Many of our apis will return strings rather than booleans.
export function convertStringToBoolean(str: 'true' | 'false') {
  return str === 'true';
}
