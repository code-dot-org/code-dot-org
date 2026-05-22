/**
 * {{VAR}} substitution for notebook cell source lines.
 *
 * Globals are defined in `notebook.metadata.globals` and substituted at
 * execution time so that curriculum authors can parameterise cells by locale
 * or by externally-configured values without modifying Python source.
 *
 * Substitution happens on the main thread before code is sent to the worker;
 * the worker must never see the raw `{{VAR}}` syntax.
 *
 * Also handles locale-specific cell source overrides stored in
 * `cell.metadata.i18n[locale]`.
 */

import type { Cell, Global, NotebookMetadata } from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Core substitution
// ---------------------------------------------------------------------------

/**
 * Substitutes `{{VAR}}` placeholders in cell source lines.
 *
 * Each placeholder is resolved against `globals[VAR]`: the locale-specific
 * value is used when present, falling back to `globals[VAR].default`.
 * Unrecognised placeholders are left as-is so authoring errors surface
 * visibly at runtime rather than silently producing empty strings.
 *
 * @param sourceLines Cell source lines (each may end with '\n')
 * @param globals Notebook-level globals from metadata
 * @param locale Active locale string, e.g. 'en-US'
 * @returns New array of lines with placeholders replaced
 */
export function applyGlobals(
  sourceLines: string[],
  globals: NotebookMetadata['globals'],
  locale: string
): string[] {
  if (globals === undefined || Object.keys(globals).length === 0) {
    return sourceLines;
  }

  return sourceLines.map(line =>
    line.replace(
      /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,
      (match, key: string) => {
        const g: Global | undefined = globals[key];
        if (g === undefined) return match;
        return g[locale] ?? g.default;
      }
    )
  );
}

// ---------------------------------------------------------------------------
// Locale-aware source resolution
// ---------------------------------------------------------------------------

/**
 * Returns the effective source lines for a cell, applying locale overrides
 * from `cell.metadata.i18n` when available.
 *
 * @param cell Source cell
 * @param locale Active locale string (e.g. 'en-US')
 * @returns Locale-resolved source lines, or the canonical source, or []
 */
export function getLocalizedSource(cell: Cell, locale: string): string[] {
  const i18n = cell.metadata.i18n;
  if (i18n && i18n[locale]) {
    return i18n[locale];
  }
  return cell.source ?? [];
}

/**
 * Resolves the locale-appropriate source for a cell, applying globals
 * templating.
 *
 * Resolution order:
 * 1. `cell.metadata.i18n[locale]` — explicit locale override for this cell
 * 2. `cell.source` — canonical source
 * 3. `[]` — empty fallback (cell has no source yet)
 *
 * After picking the raw lines, `applyGlobals` substitutes any `{{VAR}}`
 * tokens from the notebook globals map.
 *
 * @param cell Source cell (accepts full Cell or a structurally-compatible subset)
 * @param globals Named globals from notebook metadata, or undefined
 * @param locale Active locale string
 * @returns Resolved source lines ready for display or execution
 */
export function resolveSource(
  cell: { source?: string[]; metadata: { i18n?: Record<string, string[]> } },
  globals: NotebookMetadata['globals'],
  locale: string
): string[] {
  const raw = cell.metadata.i18n?.[locale] ?? cell.source ?? [];
  return applyGlobals(raw, globals, locale);
}
