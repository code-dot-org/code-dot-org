// Strip whitespace and special characters. We need this to use feature name
// strings as design element ids and object {} keys.
export function stripSpaceAndSpecial(string) {
  return string.replace(/\W/g, '');
}
