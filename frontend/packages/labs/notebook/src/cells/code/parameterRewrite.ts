/**
 * Thin re-export layer for parameter source-rewriting utilities.
 *
 * Consumers should import from this module rather than directly from
 * `parameterParser` so the rewrite surface stays clearly bounded and
 * testable in isolation.
 */

export { updateParameterInSource as rewriteParameter } from './parameterParser';

/**
 * Convert a JS primitive to its Python literal string representation.
 *
 * Used when constructing or validating rewritten source lines.
 *
 * @param value - The value to format.
 * @returns A Python-compatible literal:
 *   - `true` → `'True'`
 *   - `false` → `'False'`
 *   - `null` → `'None'`
 *   - string → `'"value"'` (double-quoted)
 *   - number → decimal string representation
 */
export function formatPythonValue(value: string | number | boolean | null): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === null) return 'None';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}
