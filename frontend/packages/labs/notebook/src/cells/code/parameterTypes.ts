/**
 * Type definitions for the notebook parameter system.
 *
 * Parameters are Python variable assignments annotated with `#@param` in a
 * code cell's source lines.  The author can optionally attach a JSON-like
 * config block to control the rendered control type and its constraints.
 */

/** Discriminated union of the four renderable control kinds. */
export type ParameterKind = 'value' | 'slider' | 'dropdown' | 'boolean';

/**
 * Optional configuration block parsed from the `#@param` annotation.
 *
 * Fields are a direct mapping of the JSON-like syntax accepted in cell
 * source, e.g. `{type:"slider", min:0, max:2, step:0.1}`.
 */
export interface ParameterConfig {
  /** Explicit control type override, e.g. `"slider"` or `"boolean"`. */
  type?: string;
  /** Minimum numeric value for a slider control. */
  min?: number;
  /** Maximum numeric value for a slider control. */
  max?: number;
  /** Step increment for a slider control. */
  step?: number;
  /** Ordered list of choices for a dropdown control. */
  options?: string[];
  /** Author-supplied label for the control, e.g. "Try a temperature". */
  prompt?: string;
}

/**
 * A fully parsed parameter extracted from a single source line.
 */
export interface Parameter {
  /** Python variable name on the left-hand side of the assignment. */
  name: string;
  /** Current value parsed from the Python literal on the right-hand side. */
  value: string | number | boolean | null;
  /** Resolved control kind, derived from `config` and the value's JS type. */
  type: ParameterKind;
  /** Parsed configuration block from the annotation. */
  config: ParameterConfig;
  /** Zero-based index of the source line this parameter was parsed from. */
  lineNumber: number;
  /** Author-supplied prompt, or undefined.  Use a fallback when absent. */
  prompt?: string;
}
