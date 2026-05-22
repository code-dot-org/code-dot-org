/**
 * Parsing and rewriting of `#@param` annotations in Python source lines.
 *
 * A parameter annotation has the form:
 *
 *   VARNAME = <python-literal> #@param [optional-config]
 *
 * The optional config is either a JSON-like object `{key:value, ...}` or a
 * bracket list `["opt1", "opt2"]` that implies a dropdown control.
 */

import type { Parameter, ParameterConfig, ParameterKind } from './parameterTypes';

/**
 * Parse all `#@param` annotations from a cell's source lines.
 *
 * @param source - Array of source lines (each may end with `\n`), or
 *   `undefined` when the cell has no source yet.
 * @returns Ordered list of parsed {@link Parameter} objects.  Lines that do
 *   not match the annotation pattern are silently skipped.
 */
export function parseParameters(source: string[] | undefined): Parameter[] {
  if (!source) return [];
  const parameters: Parameter[] = [];

  source.forEach((line, lineNumber) => {
    const cleanLine = line.replace(/\n$/, '');
    const trimmedLine = cleanLine.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    const paramMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+?)\s*#\s*@param(.*)$/);
    if (!paramMatch) return;

    const [, varName, valueStr, configStr] = paramMatch;

    try {
      const value = parseValue(valueStr);
      const config = parseConfig(configStr.trim());
      const type = determineParameterType(value, config);
      const prompt = config.prompt;
      parameters.push({ name: varName, value, type, config, lineNumber, prompt });
    } catch (error) {
      console.warn(
        `Failed to parse parameter on line ${lineNumber + 1}: ${line}`,
        error,
      );
    }
  });

  return parameters;
}

/**
 * Parse a Python literal string into its equivalent JS value.
 *
 * Handles: `True`/`False`/`None`, quoted strings, integers, and floats.
 * Unrecognised tokens are returned as raw strings.
 *
 * @param valueStr - The right-hand side of a Python assignment, trimmed.
 * @returns The equivalent JS primitive.
 */
function parseValue(valueStr: string): string | number | boolean | null {
  const trimmed = valueStr.trim();

  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;
  if (trimmed === 'None') return null;

  const stringMatch = trimmed.match(/^["'](.*)["']$/);
  if (stringMatch) return stringMatch[1];

  const numMatch = trimmed.match(/^-?\d+\.?\d*$/);
  if (numMatch) return trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10);

  return trimmed;
}

/**
 * Parse the optional config suffix that follows `#@param`.
 *
 * Accepts two forms:
 * - Bracket list: `["a", "b", "c"]` → `{ options: ["a", "b", "c"] }`
 * - JSON-like object: `{type:"slider", min:0, max:2, prompt:"label"}`
 *
 * @param configStr - Everything after `#@param`, trimmed.
 * @returns Parsed {@link ParameterConfig}, or `{}` when the string is empty
 *   or unparseable.
 */
function parseConfig(configStr: string): ParameterConfig {
  if (!configStr) return {};

  const arrayMatch = configStr.match(/^\[(.+)\]$/);
  if (arrayMatch) {
    const options = arrayMatch[1].split(',').map(opt => {
      const trimmed = opt.trim();
      const q = trimmed.match(/^["'](.*)["']$/);
      return q ? q[1] : trimmed;
    });
    return { options };
  }

  const jsonMatch = configStr.match(/^\{(.+)\}$/);
  if (jsonMatch) {
    try {
      const config: ParameterConfig = {};
      jsonMatch[1].split(',').forEach(pair => {
        const colonIndex = pair.indexOf(':');
        if (colonIndex === -1) return;
        const rawKey = pair.slice(0, colonIndex).trim();
        const rawVal = pair.slice(colonIndex + 1).trim();
        const k = rawKey.replace(/["']/g, '');
        const v = rawVal.replace(/["']/g, '');

        if (k === 'type') {
          config.type = v;
        } else if (k === 'min' || k === 'max' || k === 'step') {
          config[k] = parseFloat(v);
        } else if (k === 'prompt') {
          config.prompt = v;
        }
      });
      return config;
    } catch {
      return {};
    }
  }

  return {};
}

/**
 * Determine the {@link ParameterKind} from the parsed value and config.
 *
 * Resolution order:
 * 1. Explicit `config.type` of `"slider"` or `"boolean"`.
 * 2. Presence of `config.options` → `"dropdown"`.
 * 3. JS boolean value → `"boolean"`.
 * 4. Default → `"value"`.
 *
 * @param value - Parsed JS value.
 * @param config - Parsed config block.
 * @returns The resolved control kind.
 */
function determineParameterType(
  value: string | number | boolean | null,
  config: ParameterConfig,
): ParameterKind {
  if (config.type === 'slider') return 'slider';
  if (config.type === 'boolean') return 'boolean';
  if (config.options && config.options.length > 0) return 'dropdown';
  if (typeof value === 'boolean') return 'boolean';
  return 'value';
}

/**
 * Convert a JS value to its Python literal representation.
 *
 * @param value - The value to format.
 * @returns A string that is valid Python: `True`, `False`, `None`, a
 *   double-quoted string, or the numeric string representation.
 */
function formatValue(value: string | number | boolean | null): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

/**
 * Rewrite a single parameter's value inside the original source line array.
 *
 * The line at `parameter.lineNumber` is replaced with the new value while
 * preserving the variable name, whitespace, and the full `#@param ...`
 * annotation suffix.  All other lines are returned unchanged.
 *
 * @param source - Original source lines array.
 * @param parameter - The parameter to update (supplies the line index).
 * @param newValue - The new JS value to encode as a Python literal.
 * @returns A new array with the targeted line rewritten.  Returns `source`
 *   unchanged when `parameter.lineNumber` is out of range.
 */
export function updateParameterInSource(
  source: string[],
  parameter: Parameter,
  newValue: string | number | boolean | null,
): string[] {
  if (!source || parameter.lineNumber >= source.length) return source;

  const newSource = [...source];
  const line = newSource[parameter.lineNumber];
  const hasNewline = line.endsWith('\n');
  const cleanLine = line.replace(/\n$/, '');

  const paramMatch = cleanLine.match(/^(\w+\s*=\s*)(.+?)(\s*#\s*@param.*)$/);
  if (paramMatch) {
    const [, prefix, , suffix] = paramMatch;
    newSource[parameter.lineNumber] =
      `${prefix}${formatValue(newValue)}${suffix}${hasNewline ? '\n' : ''}`;
  }

  return newSource;
}
