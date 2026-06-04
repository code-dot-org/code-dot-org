import {
  CategorySummary,
  EvalOutcome,
  EvalResult,
  EvalSummary,
  EvalGate,
  GATE_ORDER,
  GateFunnelStep,
} from './evalTypes';

// Where, in the gate order, a result came to rest. PASSED results clear every
// gate, so their stop index is GATE_ORDER.length.
function stopIndex(result: EvalResult): number {
  if (result.outcome === EvalOutcome.PASSED || result.stoppedAtGate === null) {
    return GATE_ORDER.length;
  }
  return GATE_ORDER.indexOf(result.stoppedAtGate);
}

// Build the gate-by-gate funnel. A prompt "enters" gate i if it cleared every
// earlier gate (its stop index is >= i). It is blocked or errored at gate i if
// it came to rest there; otherwise it passed through.
function buildFunnel(results: EvalResult[]): GateFunnelStep[] {
  return GATE_ORDER.map((gate, i) => {
    let entered = 0;
    let blocked = 0;
    let errored = 0;
    for (const result of results) {
      const stop = stopIndex(result);
      if (stop < i) {
        continue; // never reached this gate
      }
      entered++;
      if (stop === i && result.outcome === EvalOutcome.BLOCKED) {
        blocked++;
      } else if (stop === i && result.outcome === EvalOutcome.ERROR) {
        errored++;
      }
    }
    return {
      gate,
      entered,
      blocked,
      errored,
      passed: entered - blocked - errored,
    };
  });
}

function summarizeGroup(
  category: string,
  results: EvalResult[]
): CategorySummary {
  const total = results.length;
  const errors = results.filter(r => r.outcome === EvalOutcome.ERROR).length;
  const blocked = results.filter(r => r.outcome === EvalOutcome.BLOCKED).length;
  const falseNegatives = results.filter(
    r => r.outcome === EvalOutcome.PASSED
  ).length;
  const evaluated = total - errors;
  return {
    category,
    total,
    evaluated,
    blocked,
    falseNegatives,
    errors,
    falseNegativeRate: evaluated > 0 ? falseNegatives / evaluated : null,
  };
}

/**
 * Aggregate per-prompt results into overall + per-category stats and a
 * gate-by-gate funnel. Pure: no network, safe to unit test.
 *
 * The false-negative rate is falseNegatives / evaluated, where evaluated
 * excludes ERROR results (an inconclusive run is neither a block nor a miss).
 */
export function aggregateResults(results: EvalResult[]): EvalSummary {
  const overall = summarizeGroup('__overall__', results);

  const byCategoryMap = new Map<string, EvalResult[]>();
  for (const result of results) {
    const group = byCategoryMap.get(result.category) ?? [];
    group.push(result);
    byCategoryMap.set(result.category, group);
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([category, group]) => summarizeGroup(category, group))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    total: overall.total,
    errors: overall.errors,
    evaluated: overall.evaluated,
    blocked: overall.blocked,
    falseNegatives: overall.falseNegatives,
    falseNegativeRate: overall.falseNegativeRate,
    funnel: buildFunnel(results),
    byCategory,
  };
}

// Format a rate (0..1) as a percentage string, or an em dash when null.
export function formatRate(rate: number | null): string {
  return rate === null ? '—' : `${(rate * 100).toFixed(1)}%`;
}

// Human-readable label for a gate.
export const GATE_LABELS: Record<EvalGate, string> = {
  [EvalGate.INPUT_TEXT]: 'Input text safety',
  [EvalGate.GENERATION]: 'Image generation',
  [EvalGate.IMAGE_MODERATION]: 'Image moderation',
  [EvalGate.OUTPUT_TEXT]: 'Output text safety',
};
