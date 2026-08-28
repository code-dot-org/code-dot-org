import {describe, expect, it} from 'vitest';

import {oneLineCheckVerdict} from '../checkNarration.js';

describe('oneLineCheckVerdict', () => {
  it('reports a passing simulated check', () => {
    expect(
      oneLineCheckVerdict({ok: true, mode: 'simulated', reasons: []}),
    ).toBe('check: OK (simulated)');
  });

  it('flags a passing palette-only check as honestly incomplete', () => {
    expect(
      oneLineCheckVerdict({ok: true, mode: 'palette', reasons: []}),
    ).toBe('check: OK (palette only — full simulation not attempted)');
  });

  it('reports only the first reason on failure, never the whole list', () => {
    const line = oneLineCheckVerdict({
      ok: false,
      mode: 'simulated',
      reasons: ['hits a wall at row 2 col 1', 'also missing a toolbox block'],
    });
    expect(line).toBe('check: FAILED (simulated) — hits a wall at row 2 col 1');
    expect(line).not.toMatch(/toolbox block/);
  });

  it('caps an overlong reason instead of echoing it in full', () => {
    const longReason = 'x'.repeat(500);
    const line = oneLineCheckVerdict({
      ok: false,
      mode: 'palette',
      reasons: [longReason],
    });
    expect(line.length).toBeLessThan(250);
    expect(line).toMatch(/…$/);
  });
});
