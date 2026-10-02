// A blank string parses as an empty object; returns null when the string is not a JSON object.
export function parseJsonObject(
  raw: string | null | undefined
): Record<string, unknown> | null {
  if (!raw || !raw.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

// An empty object serializes as a blank string, so the level stores no value.
export function serializeJsonObject(object: object): string {
  return Object.keys(object).length ? JSON.stringify(object, null, 2) : '';
}

// Passing undefined removes the key; replacing a key keeps its position.
export function setJsonObjectValue<T extends object>(
  object: T,
  key: string,
  value: unknown
): T {
  const newObject = {...object} as Record<string, unknown>;
  if (value === undefined) {
    delete newObject[key];
  } else {
    newObject[key] = value;
  }
  return newObject as T;
}
