import {afterEach, describe, expect, it} from 'vitest';

import {animationOptions, setProjectAnimations} from '../animationOptions';

// Registry is module state; reset it between cases.
afterEach(() => setProjectAnimations([]));

describe('animationOptions', () => {
  it('always offers the stock animations', () => {
    const values = animationOptions().map(([, id]) => id);
    expect(values).toContain('coinSpin');
    expect(values).toContain('playerWalk');
  });

  it('adds the project-authored animations, deduped, with Title Case labels', () => {
    setProjectAnimations(['pulse', 'coinSpin']); // coinSpin already stock
    const options = animationOptions();
    const values = options.map(([, id]) => id);
    expect(values).toContain('pulse');
    expect(values.filter(v => v === 'coinSpin')).toHaveLength(1); // deduped
    expect(options).toContainEqual(['Pulse', 'pulse']);
  });
});
