import JSZip from 'jszip';

import {EvalOutcome, EvalResult} from './evalTypes';

/**
 * Reads a ZIP previously produced by the eval's "Download report (.zip)" back
 * into EvalResults, so a run can be reopened to review, re-run errors, and
 * re-export. The base64 images live as files under images/ (not in
 * results.json), so we re-attach them as data: URLs on load.
 */

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

const VALID_OUTCOMES = new Set<string>([
  EvalOutcome.BLOCKED,
  EvalOutcome.PASSED,
  EvalOutcome.ERROR,
]);

// One row of results.json (untrusted: it came from an uploaded file).
type ReportRecord = Record<string, unknown>;

// Pure: map one results.json record into an EvalResult. imageDataUrl is
// supplied by the caller after reading images/<image_file> from the zip.
// Defensive about the uploaded shape; an unknown outcome becomes ERROR.
export function reportRecordToResult(
  record: ReportRecord,
  imageDataUrl?: string
): EvalResult {
  const outcome = VALID_OUTCOMES.has(String(record.outcome))
    ? (record.outcome as EvalOutcome)
    : EvalOutcome.ERROR;
  return {
    prompt: String(record.prompt ?? ''),
    label: String(record.label ?? 'unlabeled'),
    outcome,
    stoppedAtGate:
      (record.stoppedAtGate as EvalResult['stoppedAtGate']) ?? null,
    finishReason: record.finishReason as string | undefined,
    moderationStatus: record.moderationStatus as EvalResult['moderationStatus'],
    moderationCategories:
      record.moderationCategories as EvalResult['moderationCategories'],
    detail: record.detail as string | undefined,
    humanReviewedBenign: !!record.humanReviewedBenign,
    imageDataUrl,
    elapsedMs: Number(record.elapsedMs) || 0,
  };
}

export interface ParseReportResult {
  results: EvalResult[];
  warnings: string[];
  error?: string;
}

// Parse an uploaded report ZIP into EvalResults, re-attaching images.
export async function parseReportZip(file: File): Promise<ParseReportResult> {
  const warnings: string[] = [];
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (error) {
    return {
      results: [],
      warnings,
      error: `Could not read ZIP: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  const jsonFile = zip.file('results.json');
  if (!jsonFile) {
    return {
      results: [],
      warnings,
      error:
        'ZIP has no results.json — is this a report exported by this tool?',
    };
  }

  let records: unknown;
  try {
    records = JSON.parse(await jsonFile.async('string'));
  } catch {
    return {results: [], warnings, error: 'results.json is not valid JSON.'};
  }
  if (!Array.isArray(records)) {
    return {results: [], warnings, error: 'results.json is not an array.'};
  }

  const results: EvalResult[] = [];
  for (const record of records as ReportRecord[]) {
    let imageDataUrl: string | undefined;
    const imageFile = record.image_file;
    if (typeof imageFile === 'string' && imageFile) {
      const entry = zip.file(`images/${imageFile}`);
      if (entry) {
        const ext = imageFile.split('.').pop()?.toLowerCase() ?? '';
        const mime = MIME_BY_EXT[ext] ?? 'image/png';
        const base64 = await entry.async('base64');
        imageDataUrl = `data:${mime};base64,${base64}`;
      } else {
        warnings.push(`Missing image referenced by results.json: ${imageFile}`);
      }
    }
    results.push(reportRecordToResult(record, imageDataUrl));
  }

  if (!results.length) {
    return {results, warnings, error: 'results.json contained no rows.'};
  }
  return {results, warnings};
}
