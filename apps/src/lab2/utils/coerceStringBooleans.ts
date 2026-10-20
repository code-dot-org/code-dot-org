/**
 * Returns a copy of level properties with "true" and "false" strings turned
 * into booleans. Levelbuilder stores booleans as strings; top-level keys only,
 * matching what the level properties request has always done.
 */
export function coerceStringBooleans<T extends object>(properties: T): T {
  const copy = {...properties} as {[key: string]: unknown};
  for (const key of Object.keys(copy)) {
    if (copy[key] === 'true') copy[key] = true;
    if (copy[key] === 'false') copy[key] = false;
  }
  return copy as T;
}
