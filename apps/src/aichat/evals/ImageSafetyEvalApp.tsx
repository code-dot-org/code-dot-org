import React, {useCallback, useRef, useState} from 'react';

import {aggregateResults, formatRate, GATE_LABELS} from './evalScoring';
import {EvalOutcome, EvalPrompt, EvalResult, EvalSummary} from './evalTypes';
import {runEval} from './imageSafetyEval';
import {parseEvalCsv} from './parseEvalCsv';
import {ThrottleEvent} from './rateLimit';

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

// Serialize results to a CSV the user can download for offline analysis.
function resultsToCsv(results: EvalResult[]): string {
  const header = [
    'prompt',
    'category',
    'outcome',
    'stopped_at_gate',
    'finish_reason',
    'moderation_status',
    'detail',
    'elapsed_ms',
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = results.map(r =>
    [
      r.prompt,
      r.category,
      r.outcome,
      r.stoppedAtGate ?? '',
      r.finishReason ?? '',
      r.moderationStatus ?? '',
      r.detail ?? '',
      String(r.elapsedMs),
    ]
      .map(v => escape(String(v)))
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

    <h3>By category</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Category</th>
          <th style={styles.th}>Total</th>
          <th style={styles.th}>Evaluated</th>
          <th style={styles.th}>Blocked</th>
          <th style={styles.th}>False negatives</th>
          <th style={styles.th}>Errors</th>
          <th style={styles.th}>FN rate</th>
        </tr>
      </thead>
      <tbody>
        {summary.byCategory.map(cat => (
          <tr key={cat.category}>
            <td style={styles.td}>{cat.category}</td>
            <td style={styles.td}>{cat.total}</td>
            <td style={styles.td}>{cat.evaluated}</td>
            <td style={styles.td}>{cat.blocked}</td>
            <td style={{...styles.td, color: '#b00020', fontWeight: 600}}>
              {cat.falseNegatives}
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
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [showImages, setShowImages] = useState(false);
  const [throttle, setThrottle] = useState<ThrottleEvent | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setFileName(file.name);
      setResults([]);
      setSummary(null);
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
    setSummary(null);
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
          setSummary(aggregateResults(collected));
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

  return (
    <div style={styles.page}>
      <h1>Image generation safety eval</h1>
      <p>
        Upload a CSV with <code>prompt,category</code> columns of adversarial
        prompts. Each prompt is run through the real aichat image pipeline
        (input text safety → image generation → Azure image moderation → output
        text safety). A prompt that clears every gate and yields an allowed
        image is a <strong>false negative</strong>.
      </p>

      <div style={styles.controls}>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
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

      {fileName && (
        <p>
          Loaded <strong>{fileName}</strong>: {prompts.length} prompt
          {prompts.length === 1 ? '' : 's'}
          {prompts.length > 0 && (
            <>
              {' '}
              — up to ~{prompts.length * CALLS_PER_PROMPT} gateway/moderation
              calls
            </>
          )}
          .
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
              style={{...styles.button, background: '#eee', color: '#333'}}
              onClick={() =>
                downloadText(
                  'image-safety-eval-results.json',
                  JSON.stringify(
                    results.map(({imageDataUrl, ...rest}) => rest),
                    null,
                    2
                  ),
                  'application/json'
                )
              }
            >
              Download results JSON
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
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Prompt</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Outcome</th>
                <th style={styles.th}>Detail</th>
                {showImages && <th style={styles.th}>Image</th>}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{...styles.td, maxWidth: 360}}>{r.prompt}</td>
                  <td style={styles.td}>{r.category}</td>
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
                        <a
                          href={r.imageDataUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={r.imageDataUrl}
                            alt="generated"
                            style={styles.thumb}
                          />
                        </a>
                      ) : null}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ImageSafetyEvalApp;
