import {aggregateResults, formatRate} from '@cdo/apps/aichat/evals/evalScoring';
import {
  EvalGate,
  EvalOutcome,
  EvalResult,
} from '@cdo/apps/aichat/evals/evalTypes';

// Build an EvalResult with sensible defaults for the fields under test.
function result(partial: Partial<EvalResult>): EvalResult {
  return {
    prompt: 'p',
    label: 'unlabeled',
    outcome: EvalOutcome.BLOCKED,
    stoppedAtGate: EvalGate.INPUT_TEXT,
    elapsedMs: 0,
    ...partial,
  };
}

describe('aggregateResults', () => {
  const results: EvalResult[] = [
    result({label: 'violence', stoppedAtGate: EvalGate.INPUT_TEXT}),
    result({label: 'violence', stoppedAtGate: EvalGate.GENERATION}),
    result({label: 'sexual', stoppedAtGate: EvalGate.IMAGE_MODERATION}),
    result({
      label: 'benign',
      outcome: EvalOutcome.PASSED,
      stoppedAtGate: null,
    }),
    result({
      label: 'sexual',
      outcome: EvalOutcome.PASSED,
      stoppedAtGate: null,
    }),
    result({
      label: 'hate',
      outcome: EvalOutcome.ERROR,
      stoppedAtGate: EvalGate.GENERATION,
    }),
  ];

  const summary = aggregateResults(results);

  it('counts overall outcomes, excluding errors from the denominator', () => {
    expect(summary.total).toBe(6);
    expect(summary.errors).toBe(1);
    expect(summary.evaluated).toBe(5);
    expect(summary.blocked).toBe(3);
    expect(summary.falseNegatives).toBe(2);
    expect(summary.falseNegativeRate).toBeCloseTo(2 / 5);
  });

  it('builds a gate funnel that accounts for blocks and errors per gate', () => {
    const byGate = Object.fromEntries(summary.funnel.map(s => [s.gate, s]));

    expect(byGate[EvalGate.INPUT_TEXT]).toMatchObject({
      entered: 6,
      blocked: 1,
      errored: 0,
      passed: 5,
    });
    expect(byGate[EvalGate.GENERATION]).toMatchObject({
      entered: 5,
      blocked: 1,
      errored: 1,
      passed: 3,
    });
    expect(byGate[EvalGate.IMAGE_MODERATION]).toMatchObject({
      entered: 3,
      blocked: 1,
      errored: 0,
      passed: 2,
    });
    expect(byGate[EvalGate.OUTPUT_TEXT]).toMatchObject({
      entered: 2,
      blocked: 0,
      errored: 0,
      passed: 2,
    });
  });

  it('breaks down per label, sorted by name', () => {
    expect(summary.byLabel.map(c => c.label)).toEqual([
      'benign',
      'hate',
      'sexual',
      'violence',
    ]);

    const byName = Object.fromEntries(summary.byLabel.map(c => [c.label, c]));
    expect(byName.violence).toMatchObject({
      total: 2,
      evaluated: 2,
      blocked: 2,
      falseNegatives: 0,
      errors: 0,
      falseNegativeRate: 0,
    });
    expect(byName.sexual).toMatchObject({
      total: 2,
      blocked: 1,
      falseNegatives: 1,
      falseNegativeRate: 0.5,
    });
    expect(byName.benign).toMatchObject({
      total: 1,
      falseNegatives: 1,
      falseNegativeRate: 1,
    });
    // A label with only errors has no evaluable prompts: rate is null.
    expect(byName.hate).toMatchObject({
      total: 1,
      evaluated: 0,
      errors: 1,
      falseNegativeRate: null,
    });
  });

  it('handles an empty result set', () => {
    const empty = aggregateResults([]);
    expect(empty.total).toBe(0);
    expect(empty.falseNegativeRate).toBeNull();
    expect(empty.funnel.every(s => s.entered === 0)).toBe(true);
  });
});

describe('formatRate', () => {
  it('formats fractions as percentages', () => {
    expect(formatRate(0.4)).toBe('40.0%');
    expect(formatRate(1)).toBe('100.0%');
  });

  it('renders null as an em dash', () => {
    expect(formatRate(null)).toBe('—');
  });
});
