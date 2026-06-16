import {saveAs} from 'filesaver.js';
import JSZip from 'jszip';
import React, {useCallback, useMemo, useRef, useState} from 'react';

import {aggregateResults, formatRate, GATE_LABELS} from './evalScoring';
import {
  EvalGate,
  EvalOutcome,
  EvalPrompt,
  EvalResult,
  EvalSummary,
} from './evalTypes';
import {runEval} from './imageSafetyEval';
import {parseEvalCsv} from './parseEvalCsv';
import {ThrottleEvent} from './rateLimit';
import {parseReportZip} from './reportZip';

// Each prompt makes up to ~4 calls (2 text-safety + image generation +
// moderation). Used to estimate load before a run.
const CALLS_PER_PROMPT = 4;
// Confirm before launching runs larger than this, to avoid accidentally firing
// thousands of calls at the shared gateway.
const LARGE_RUN_THRESHOLD = 150;
// Politeness cap on concurrency against shared production infrastructure.
const MAX_CONCURRENCY = 6;

const styles: Record<string, React.CSSProperties> = {
  page: {maxWidth: 1100, margin: '0 auto', padding: 24, fontSize: 14},
  controls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
    margin: '16px 0',
  },
  button: {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '12px 16px',
    minWidth: 120,
  },
  cardRow: {display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0'},
  metric: {fontSize: 24, fontWeight: 700},
  table: {borderCollapse: 'collapse', width: '100%', margin: '8px 0'},
  th: {
    textAlign: 'left',
    borderBottom: '2px solid #bbb',
    padding: '6px 8px',
    background: '#e4e4e7',
    // Explicit dark color so the dashboard's global table styles can't render
    // these headers as low-contrast white-on-grey.
    color: '#1b1b1b',
    fontWeight: 700,
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '6px 8px',
    verticalAlign: 'top',
  },
  warn: {color: '#8a6d00', background: '#fff8e1', padding: 8, borderRadius: 4},
  err: {color: '#b00020', background: '#fdecea', padding: 8, borderRadius: 4},
  thumb: {
    maxWidth: 80,
    maxHeight: 80,
    border: '1px solid #ccc',
    borderRadius: 4,
    display: 'block',
  },
  thumbButton: {
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'zoom-in',
  },
  // Full-screen click-to-close lightbox. A <button> so it is keyboard
  // accessible (Esc/click/Enter all dismiss) without navigating to a data: URL.
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.82)',
    cursor: 'zoom-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lightboxImage: {
    maxWidth: '92vw',
    maxHeight: '92vh',
    boxShadow: '0 0 24px rgba(0, 0, 0, 0.6)',
  },
};

const outcomeStyle = (outcome: EvalOutcome): React.CSSProperties => {
  switch (outcome) {
    case EvalOutcome.BLOCKED:
      return {color: '#1b5e20', fontWeight: 600}; // blocked = safety worked
    case EvalOutcome.PASSED:
      return {color: '#b00020', fontWeight: 700}; // false negative
    default:
      return {color: '#666'};
  }
};

const outcomeLabel = (result: EvalResult): string => {
  if (result.outcome === EvalOutcome.PASSED) {
    return 'FALSE NEGATIVE (allowed)';
  }
  if (result.outcome === EvalOutcome.ERROR) {
    return `error${result.stoppedAtGate ? ` @ ${result.stoppedAtGate}` : ''}`;
  }
  return `blocked @ ${result.stoppedAtGate}`;
};

// Serialize results to a CSV for offline analysis. When imageFiles is given
// (the ZIP report), an image_file column links each row to its saved image.
function resultsToCsv(results: EvalResult[], imageFiles?: string[]): string {
  const header = [
    'prompt',
    'label',
    'outcome',
    'stopped_at_gate',
    'finish_reason',
    'moderation_status',
    'detail',
    'humanReviewedBenign',
    'elapsed_ms',
    ...(imageFiles ? ['image_file'] : []),
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = results.map((r, i) =>
    [
      r.prompt,
      r.label,
      r.outcome,
      r.stoppedAtGate ?? '',
      r.finishReason ?? '',
      r.moderationStatus ?? '',
      r.detail ?? '',
      String(!!r.humanReviewedBenign),
      String(r.elapsedMs),
      ...(imageFiles ? [imageFiles[i] ?? ''] : []),
    ]
      .map(v => escape(String(v)))
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

function downloadBlob(filename: string, blob: Blob) {
  // Use filesaver.js (same as the applab/gamelab exporters) rather than a
  // hand-rolled anchor: it handles object-URL lifetime correctly so large blobs
  // like the ZIP don't get stuck as an unfinished .crdownload.
  saveAs(blob, filename);
}

function downloadText(filename: string, text: string, type: string) {
  downloadBlob(filename, new Blob([text], {type}));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Decode a data: URL into raw bytes + a file extension (for the ZIP images/).
function decodeImageDataUrl(dataUrl: string): {bytes: Uint8Array; ext: string} {
  const comma = dataUrl.indexOf(',');
  const mime = /data:(.*?);base64/.exec(dataUrl.slice(0, comma))?.[1] ?? '';
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return {bytes, ext: EXT_BY_MIME[mime] ?? 'img'};
}

function sanitizeForFilename(value: string): string {
  return value
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// A short, filesystem-safe slug describing where the prompt ended up.
function outcomeSlug(r: EvalResult): string {
  if (r.outcome === EvalOutcome.PASSED) {
    return 'false-negative';
  }
  if (r.outcome === EvalOutcome.ERROR) {
    return `error-${r.stoppedAtGate ?? 'unknown'}`;
  }
  return `blocked-${r.stoppedAtGate ?? 'unknown'}`;
}

// Build the gallery index.html for the ZIP report. Images are referenced by
// relative path (images/<file>) and lazy-loaded, so the file stays small and
// opens fast even with many images.
function buildIndexHtml(
  results: EvalResult[],
  imageFiles: string[],
  summary: EvalSummary
): string {
  const severities = (r: EvalResult) =>
    (r.moderationCategories ?? [])
      .filter(c => c.severity > 0)
      .map(c => `${c.category}:${c.severity}`)
      .join(', ');
  // False negatives first, then everything else.
  const rank = (r: EvalResult) => (r.outcome === EvalOutcome.PASSED ? 0 : 1);
  const items = results
    .map((r, i) => ({r, file: imageFiles[i]}))
    .filter(x => x.file)
    .sort((a, b) => rank(a.r) - rank(b.r));

  const cards = items
    .map(
      ({r, file}) => `
      <figure class="card${r.outcome === EvalOutcome.PASSED ? ' fn' : ''}">
        <img src="images/${escapeHtml(
          file
        )}" loading="lazy" alt="generated image" />
        <figcaption>
          <div class="outcome">${escapeHtml(outcomeLabel(r))}</div>
          <div class="meta">${escapeHtml(r.label)}${
        r.stoppedAtGate ? ` &middot; ${escapeHtml(r.stoppedAtGate)}` : ''
      }${r.humanReviewedBenign ? ' &middot; reviewed benign' : ''}</div>
          <div class="prompt">${escapeHtml(r.prompt)}</div>
          ${
            severities(r)
              ? `<div class="sev">Azure: ${escapeHtml(severities(r))}</div>`
              : ''
          }
        </figcaption>
      </figure>`
    )
    .join('\n');

  const funnel = summary.funnel
    .map(
      s =>
        `<tr><td>${escapeHtml(GATE_LABELS[s.gate])}</td><td>${
          s.entered
        }</td><td>${s.blocked}</td><td>${s.errored}</td><td>${
          s.passed
        }</td></tr>`
    )
    .join('');
  const cats = summary.byLabel
    .map(
      c =>
        `<tr><td>${escapeHtml(c.label)}</td><td>${c.total}</td><td>${
          c.evaluated
        }</td><td>${c.blocked}</td><td>${c.falseNegatives}</td><td>${
          c.errors
        }</td><td>${formatRate(c.falseNegativeRate)}</td></tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Image safety eval report</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 24px; color: #1b1b1b; }
  h1 { margin-bottom: 4px; }
  table { border-collapse: collapse; margin: 8px 0 24px; }
  th, td { border-bottom: 1px solid #ddd; padding: 4px 10px; text-align: left; }
  th { background: #e4e4e7; }
  .big { font-size: 28px; font-weight: 700; color: #b00020; }
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .card { border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin: 0; }
  .card.fn { border-color: #b00020; }
  .card img { width: 100%; height: auto; border-radius: 4px; background: #f3f3f3; }
  .outcome { font-weight: 700; margin-top: 6px; }
  .card.fn .outcome { color: #b00020; }
  .meta { color: #555; font-size: 13px; }
  .prompt { font-size: 13px; margin-top: 4px; white-space: pre-wrap; }
  .sev { font-size: 12px; color: #8a4b00; margin-top: 4px; }
</style>
</head>
<body>
<h1>Image generation safety eval report</h1>
<p>Generated ${escapeHtml(new Date().toLocaleString())} &middot; ${
    summary.total
  } prompt(s) &middot; ${items.length} generated image(s).</p>
<p>False-negative rate: <span class="big">${formatRate(
    summary.falseNegativeRate
  )}</span>
 (${summary.falseNegatives} of ${summary.evaluated} evaluated; ${
    summary.errors
  } error(s))</p>
<h2>Pipeline funnel</h2>
<table><thead><tr><th>Gate</th><th>Reached</th><th>Blocked</th><th>Errored</th><th>Passed</th></tr></thead><tbody>${funnel}</tbody></table>
<h2>By label</h2>
<table><thead><tr><th>Label</th><th>Total</th><th>Evaluated</th><th>Blocked</th><th>False negatives</th><th>Errors</th><th>FN rate</th></tr></thead><tbody>${cats}</tbody></table>
<h2>Generated images (${items.length})</h2>
<p>Images that defeated the text gate and were generated &mdash; false negatives first. These are the cases to review.</p>
<div class="gallery">${cards || '<p>No images were generated.</p>'}</div>
</body>
</html>`;
}

const SummaryView: React.FunctionComponent<{summary: EvalSummary}> = ({
  summary,
}) => (
  <div>
    <div style={styles.cardRow}>
      <div style={styles.card}>
        <div>Prompts</div>
        <div style={styles.metric}>{summary.total}</div>
      </div>
      <div style={styles.card}>
        <div>Evaluated</div>
        <div style={styles.metric}>{summary.evaluated}</div>
      </div>
      <div style={styles.card}>
        <div>Blocked</div>
        <div style={styles.metric}>{summary.blocked}</div>
      </div>
      <div style={{...styles.card, borderColor: '#b00020'}}>
        <div>False negatives</div>
        <div style={{...styles.metric, color: '#b00020'}}>
          {summary.falseNegatives}
        </div>
      </div>
      <div style={{...styles.card, borderColor: '#b00020'}}>
        <div>False negative rate</div>
        <div style={{...styles.metric, color: '#b00020'}}>
          {formatRate(summary.falseNegativeRate)}
        </div>
      </div>
      <div style={{...styles.card, borderColor: '#1b5e20'}}>
        <div>Reviewed benign</div>
        <div style={{...styles.metric, color: '#1b5e20'}}>
          {summary.reviewedBenign}
        </div>
      </div>
      <div style={{...styles.card, borderColor: '#1b5e20'}}>
        <div>Benign output rate</div>
        <div style={{...styles.metric, color: '#1b5e20'}}>
          {formatRate(summary.reviewedBenignRate)}
        </div>
      </div>
      <div style={styles.card}>
        <div>Errors</div>
        <div style={styles.metric}>{summary.errors}</div>
      </div>
    </div>

    <h3>Pipeline funnel</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Gate</th>
          <th style={styles.th}>Reached</th>
          <th style={styles.th}>Blocked here</th>
          <th style={styles.th}>Errored here</th>
          <th style={styles.th}>Passed through</th>
        </tr>
      </thead>
      <tbody>
        {summary.funnel.map(step => (
          <tr key={step.gate}>
            <td style={styles.td}>{GATE_LABELS[step.gate]}</td>
            <td style={styles.td}>{step.entered}</td>
            <td style={styles.td}>{step.blocked}</td>
            <td style={styles.td}>{step.errored}</td>
            <td style={styles.td}>{step.passed}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3>By label</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Label</th>
          <th style={styles.th}>Total</th>
          <th style={styles.th}>Evaluated</th>
          <th style={styles.th}>Blocked</th>
          <th style={styles.th}>False negatives</th>
          <th style={styles.th}>Reviewed benign</th>
          <th style={styles.th}>Errors</th>
          <th style={styles.th}>FN rate</th>
        </tr>
      </thead>
      <tbody>
        {summary.byLabel.map(cat => (
          <tr key={cat.label}>
            <td style={styles.td}>{cat.label}</td>
            <td style={styles.td}>{cat.total}</td>
            <td style={styles.td}>{cat.evaluated}</td>
            <td style={styles.td}>{cat.blocked}</td>
            <td style={{...styles.td, color: '#b00020', fontWeight: 600}}>
              {cat.falseNegatives}
            </td>
            <td style={{...styles.td, color: '#1b5e20', fontWeight: 600}}>
              {cat.reviewedBenign}
            </td>
            <td style={styles.td}>{cat.errors}</td>
            <td style={{...styles.td, fontWeight: 600}}>
              {formatRate(cat.falseNegativeRate)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ImageSafetyEvalApp: React.FunctionComponent = () => {
  const [fileName, setFileName] = useState<string>('');
  const [prompts, setPrompts] = useState<EvalPrompt[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | undefined>();
  const [concurrency, setConcurrency] = useState(3);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({completed: 0, total: 0});
  const [results, setResults] = useState<EvalResult[]>([]);
  // Derived from results so it recomputes when a row is toggled benign.
  const summary = useMemo(
    () => (results.length ? aggregateResults(results) : null),
    [results]
  );
  const [showImages, setShowImages] = useState(false);
  const [throttle, setThrottle] = useState<ThrottleEvent | null>(null);
  // data: URL of the image shown in the full-size lightbox, or null.
  const [lightbox, setLightbox] = useState<string | null>(null);
  // True while the ZIP report is being assembled.
  const [building, setBuilding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setFileName(file.name);
      setResults([]);
      setProgress({completed: 0, total: 0});
      const text = await file.text();
      const parsed = parseEvalCsv(text);
      setPrompts(parsed.prompts);
      setParseWarnings(parsed.warnings);
      setParseError(parsed.error);
    },
    []
  );

  const handleRun = useCallback(async () => {
    // Guard against accidentally firing thousands of calls at shared infra.
    if (
      prompts.length > LARGE_RUN_THRESHOLD &&
      !window.confirm(
        `This will run ${prompts.length} prompts (up to ~${
          prompts.length * CALLS_PER_PROMPT
        } calls to the shared AI gateway + Azure moderation) at concurrency ` +
          `${concurrency}. It can take a while and uses shared capacity. Continue?`
      )
    ) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setResults([]);
    setThrottle(null);
    setProgress({completed: 0, total: prompts.length});

    const collected: EvalResult[] = [];
    try {
      await runEval(prompts, {
        concurrency,
        signal: controller.signal,
        // Surface gateway throttling; a throttle cools down the whole run.
        onThrottle: setThrottle,
        onResume: () => setThrottle(null),
        onResult: (result, completed, total) => {
          collected.push(result);
          setResults([...collected]);
          setProgress({completed, total});
        },
      });
    } finally {
      setRunning(false);
      setThrottle(null);
      abortRef.current = null;
    }
  }, [prompts, concurrency]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Bundle results + generated images into a single ZIP: a gallery index.html,
  // the raw image files, and results.csv/json. Robust for many images.
  const handleDownloadZip = useCallback(async () => {
    if (!summary) {
      return;
    }
    setBuilding(true);
    try {
      const zip = new JSZip();
      const images = zip.folder('images');
      const imageFiles = results.map((r, i) => {
        if (!r.imageDataUrl) {
          return '';
        }
        const {bytes, ext} = decodeImageDataUrl(r.imageDataUrl);
        const name = `${String(i + 1).padStart(4, '0')}__${sanitizeForFilename(
          r.label
        )}__${outcomeSlug(r)}.${ext}`;
        images?.file(name, bytes);
        return name;
      });
      zip.file('results.csv', resultsToCsv(results, imageFiles));
      zip.file(
        'results.json',
        JSON.stringify(
          // Explicitly omit the heavy base64 imageDataUrl; the image lives once
          // as a file under images/, linked by image_file.
          results.map((r, i) => ({
            prompt: r.prompt,
            label: r.label,
            outcome: r.outcome,
            stoppedAtGate: r.stoppedAtGate,
            finishReason: r.finishReason,
            moderationStatus: r.moderationStatus,
            moderationCategories: r.moderationCategories,
            detail: r.detail,
            humanReviewedBenign: !!r.humanReviewedBenign,
            elapsedMs: r.elapsedMs,
            image_file: imageFiles[i] || null,
          })),
          null,
          2
        )
      );
      zip.file('index.html', buildIndexHtml(results, imageFiles, summary));
      const blob = await zip.generateAsync({type: 'blob'});
      downloadBlob('image-safety-eval-report.zip', blob);
    } finally {
      setBuilding(false);
    }
  }, [results, summary]);

  // Toggle a row's reviewer "benign output" flag (by index into results); the
  // derived summary recomputes automatically.
  const toggleBenign = useCallback((index: number) => {
    setResults(prev =>
      prev.map((r, i) =>
        i === index ? {...r, humanReviewedBenign: !r.humanReviewedBenign} : r
      )
    );
  }, []);

  // Load a previously exported report ZIP back into the UI (results, images,
  // benign marks) so it can be reviewed, re-run, and re-exported.
  const handleLoadReport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setFileName(file.name);
      setPrompts([]);
      setResults([]);
      setParseError(undefined);
      setParseWarnings([]);
      setProgress({completed: 0, total: 0});
      const parsed = await parseReportZip(file);
      if (parsed.error) {
        setParseError(parsed.error);
        return;
      }
      setResults(parsed.results);
      setParseWarnings(parsed.warnings);
    },
    []
  );

  // Re-run only the prompts that errored, merging each fresh result back into
  // its original row by index.
  const handleRerunErrors = useCallback(async () => {
    const targets = results
      .map((r, originalIndex) => ({r, originalIndex}))
      .filter(({r}) => r.outcome === EvalOutcome.ERROR);
    if (!targets.length || running) {
      return;
    }
    const erroredPrompts = targets.map(({r}) => ({
      prompt: r.prompt,
      label: r.label,
    }));
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setThrottle(null);
    setProgress({completed: 0, total: erroredPrompts.length});
    try {
      await runEval(erroredPrompts, {
        concurrency,
        signal: controller.signal,
        onThrottle: setThrottle,
        onResume: () => setThrottle(null),
        onResult: (result, completed, total, index) => {
          const originalIndex = targets[index].originalIndex;
          setResults(prev =>
            prev.map((r, i) => (i === originalIndex ? result : r))
          );
          setProgress({completed, total});
        },
      });
    } finally {
      setRunning(false);
      setThrottle(null);
      abortRef.current = null;
    }
  }, [results, concurrency, running]);

  // The per-prompt list hides prompts blocked at the input-text gate (usually
  // the bulk of an adversarial run) so the reviewer focuses on what got past
  // it. Keep the original index for toggling/keys.
  const visibleResults = results
    .map((r, index) => ({r, index}))
    .filter(
      ({r}) =>
        !(
          r.outcome === EvalOutcome.BLOCKED &&
          r.stoppedAtGate === EvalGate.INPUT_TEXT
        )
    );
  const hiddenCount = results.length - visibleResults.length;
  const erroredCount = results.filter(
    r => r.outcome === EvalOutcome.ERROR
  ).length;

  return (
    <div style={styles.page}>
      <h1>Image generation safety eval</h1>
      <p>
        Upload a CSV with <code>prompt,label</code> columns of adversarial
        prompts. Each prompt is run through the real aichat image pipeline
        (input text safety → image generation → Azure image moderation → output
        text safety). A prompt that clears every gate and yields an allowed
        image is a <strong>false negative</strong>.
      </p>

      <div style={styles.controls}>
        <label>
          Prompts CSV:{' '}
          <input type="file" accept=".csv,text/csv" onChange={handleFile} />
        </label>
        <label>
          Report ZIP:{' '}
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={handleLoadReport}
          />
        </label>
        <label>
          Concurrency:{' '}
          <input
            type="number"
            min={1}
            max={MAX_CONCURRENCY}
            value={concurrency}
            disabled={running}
            onChange={e =>
              setConcurrency(
                Math.min(
                  MAX_CONCURRENCY,
                  Math.max(1, Number(e.target.value) || 1)
                )
              )
            }
            style={{width: 56}}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={showImages}
            onChange={e => setShowImages(e.target.checked)}
          />{' '}
          Show generated images
        </label>
      </div>

      {fileName && prompts.length > 0 && (
        <p>
          Loaded <strong>{fileName}</strong>: {prompts.length} prompt
          {prompts.length === 1 ? '' : 's'} — up to ~
          {prompts.length * CALLS_PER_PROMPT} gateway/moderation calls.
        </p>
      )}
      {fileName && prompts.length === 0 && results.length > 0 && (
        <p>
          Loaded report <strong>{fileName}</strong>: {results.length} result
          {results.length === 1 ? '' : 's'}
          {erroredCount > 0 && ` (${erroredCount} errored)`}.
        </p>
      )}
      {parseError && <div style={styles.err}>{parseError}</div>}
      {parseWarnings.length > 0 && (
        <details style={styles.warn}>
          <summary>{parseWarnings.length} parse warning(s)</summary>
          <ul>
            {parseWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}

      <div style={styles.controls}>
        {!running ? (
          <button
            type="button"
            style={{
              ...styles.button,
              background: prompts.length ? '#7665a0' : '#ccc',
              color: 'white',
            }}
            disabled={!prompts.length}
            onClick={handleRun}
          >
            Run eval ({prompts.length})
          </button>
        ) : (
          <button
            type="button"
            style={{...styles.button, background: '#b00020', color: 'white'}}
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        {!running && erroredCount > 0 && (
          <button
            type="button"
            style={{...styles.button, background: '#7665a0', color: 'white'}}
            onClick={handleRerunErrors}
          >
            Re-run {erroredCount} errored
          </button>
        )}
        {(running || results.length > 0) && (
          <span>
            {progress.completed} / {progress.total} done
          </span>
        )}
        {results.length > 0 && !running && (
          <>
            <button
              type="button"
              style={{...styles.button, background: '#eee', color: '#333'}}
              onClick={() =>
                downloadText(
                  'image-safety-eval-results.csv',
                  resultsToCsv(results),
                  'text/csv'
                )
              }
            >
              Download results CSV
            </button>
            <button
              type="button"
              disabled={building}
              style={{...styles.button, background: '#eee', color: '#333'}}
              onClick={handleDownloadZip}
            >
              {building ? 'Building report…' : 'Download report (.zip)'}
            </button>
          </>
        )}
      </div>

      {throttle && (
        <div style={styles.warn}>
          ⏳ Being throttled by the gateway — backing off{' '}
          {Math.round(throttle.waitMs / 1000)}s (×{throttle.consecutive}
          {throttle.status ? `, HTTP ${throttle.status}` : ''}). The run pauses
          and continues automatically; you can Cancel.
        </div>
      )}

      {summary && <SummaryView summary={summary} />}

      {results.length > 0 && (
        <>
          <h3>Per-prompt results</h3>
          <p style={{color: '#555'}}>
            Showing {visibleResults.length} of {results.length}
            {hiddenCount > 0 &&
              ` (${hiddenCount} blocked at input text hidden)`}
            . Check <strong>Benign?</strong> when the generated output is
            actually harmless — it moves the prompt out of the false-negative
            count into the reviewed-benign bucket.
          </p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Prompt</th>
                <th style={styles.th}>Label</th>
                <th style={styles.th}>Outcome</th>
                <th style={styles.th}>Detail</th>
                {showImages && <th style={styles.th}>Image</th>}
                <th style={styles.th}>Benign?</th>
              </tr>
            </thead>
            <tbody>
              {visibleResults.map(({r, index}) => (
                <tr
                  key={index}
                  style={
                    r.humanReviewedBenign ? {background: '#eaf5ea'} : undefined
                  }
                >
                  <td style={{...styles.td, maxWidth: 360}}>{r.prompt}</td>
                  <td style={styles.td}>{r.label}</td>
                  <td style={{...styles.td, ...outcomeStyle(r.outcome)}}>
                    {outcomeLabel(r)}
                  </td>
                  <td style={{...styles.td, maxWidth: 280, color: '#555'}}>
                    {r.detail}
                    {r.moderationStatus === 'flagged' &&
                      r.moderationCategories && (
                        <div>
                          {r.moderationCategories
                            .filter(c => c.severity > 0)
                            .map(c => `${c.category}:${c.severity}`)
                            .join(', ')}
                        </div>
                      )}
                  </td>
                  {showImages && (
                    <td style={styles.td}>
                      {r.imageDataUrl ? (
                        <button
                          type="button"
                          style={styles.thumbButton}
                          title="Click to view full size"
                          onClick={() => setLightbox(r.imageDataUrl ?? null)}
                        >
                          <img
                            src={r.imageDataUrl}
                            alt="generated"
                            style={styles.thumb}
                          />
                        </button>
                      ) : null}
                    </td>
                  )}
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <input
                      type="checkbox"
                      checked={!!r.humanReviewedBenign}
                      onChange={() => toggleBenign(index)}
                      aria-label="Mark generated output benign"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {lightbox && (
        <button
          type="button"
          style={styles.lightboxOverlay}
          title="Click to close"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="generated (full size)"
            style={styles.lightboxImage}
          />
        </button>
      )}
    </div>
  );
};

export default ImageSafetyEvalApp;
