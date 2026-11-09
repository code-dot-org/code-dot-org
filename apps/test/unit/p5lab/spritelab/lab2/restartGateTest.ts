import {
  createRestartGate,
  RESTART_QUIET_FRAMES,
} from '@cdo/apps/p5lab/spritelab/lab2/restartGate';

describe('createRestartGate', () => {
  it('restarts at once when asked after the quiet frames', () => {
    const gate = createRestartGate(30);
    expect(gate.request(30)).toBe(true);
    expect(gate.due(31)).toBe(false);
  });

  it('holds an early request until the quiet frames have passed', () => {
    const gate = createRestartGate(30);
    expect(gate.request(2)).toBe(false);
    expect(gate.due(10)).toBe(false);
    expect(gate.due(30)).toBe(true);
    // Done once.
    expect(gate.due(31)).toBe(false);
  });

  it('takes one restart per run, the first asked', () => {
    const gate = createRestartGate(30);
    expect(gate.request(2)).toBe(false);
    // Asked again every frame while the condition holds: not a second one.
    expect(gate.request(3)).toBe(false);
    expect(gate.request(40)).toBe(false);
    expect(gate.due(30)).toBe(true);
    const now = createRestartGate(30);
    expect(now.request(40)).toBe(true);
    expect(now.request(41)).toBe(false);
  });

  it('starts over with a new run', () => {
    const gate = createRestartGate(30);
    gate.request(2);
    gate.reset();
    expect(gate.due(30)).toBe(false);
    expect(gate.request(2)).toBe(false);
    expect(gate.due(30)).toBe(true);
  });

  it('defaults to about half a second of frames', () => {
    expect(RESTART_QUIET_FRAMES).toBe(30);
  });
});
