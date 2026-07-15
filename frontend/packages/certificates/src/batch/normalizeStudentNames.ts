const MAX_BATCH_NAMES = 30;

export function normalizeStudentNames(value: string): string[] {
  return value
    .split('\n')
    .map(name => name.trim())
    .filter(Boolean)
    .slice(0, MAX_BATCH_NAMES);
}
