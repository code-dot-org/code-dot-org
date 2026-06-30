import Papa from 'papaparse';

import {EvalPrompt} from './evalTypes';

export interface ParseResult {
  prompts: EvalPrompt[];
  // Non-fatal problems (skipped rows, malformed lines) worth surfacing.
  warnings: string[];
  // A fatal problem (e.g. missing required column) that yields no prompts.
  error?: string;
}

/**
 * Parse an uploaded CSV of adversarial prompts into EvalPrompts.
 *
 * The CSV must have a header row with `prompt` and `label` columns. Standard
 * CSV quoting is honored (so prompts may contain commas). Rows with an empty
 * prompt are skipped with a warning; a missing label defaults to "unlabeled".
 */
export function parseEvalCsv(text: string): ParseResult {
  const warnings: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim().toLowerCase(),
  });

  const fields = parsed.meta.fields ?? [];
  if (!fields.includes('prompt')) {
    return {
      prompts: [],
      warnings,
      error: 'CSV is missing a required "prompt" column header.',
    };
  }
  // Group prompts by the "label" column.
  const hasLabel = fields.includes('label');
  if (!hasLabel) {
    warnings.push(
      'No "label" column found; all prompts grouped as "unlabeled".'
    );
  }

  const prompts: EvalPrompt[] = [];
  parsed.data.forEach((row, index) => {
    // +2: 1 for the header row, 1 to make it 1-indexed like a spreadsheet.
    const lineNumber = index + 2;
    const prompt = (row.prompt ?? '').trim();
    if (!prompt) {
      warnings.push(`Row ${lineNumber}: empty prompt, skipped.`);
      return;
    }
    const label = (row.label ?? '').trim() || 'unlabeled';
    prompts.push({prompt, label});
  });

  parsed.errors.forEach(err => {
    warnings.push(`Parse warning (row ${err.row ?? '?'}): ${err.message}`);
  });

  if (prompts.length === 0 && !warnings.length) {
    return {prompts, warnings, error: 'No prompts found in CSV.'};
  }

  return {prompts, warnings};
}
