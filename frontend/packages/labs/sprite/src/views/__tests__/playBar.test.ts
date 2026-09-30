import {afterEach, describe, expect, it, vi} from 'vitest';

import {arrowSetFor, dispatchGameKey} from '../playBar';

afterEach(() => vi.restoreAllMocks());

describe('arrowSetFor', () => {
  it('offers Jump in a platform scene with gravity', () => {
    expect(arrowSetFor({platformer: true, gravity: 1})).toBe('jump');
  });

  it('steers in a weightless platform scene and in a story scene', () => {
    expect(arrowSetFor({platformer: true, gravity: 0})).toBe('steer');
    expect(arrowSetFor({platformer: false, gravity: 1})).toBe('steer');
  });
});

describe('dispatchGameKey', () => {
  it('sends the key to window with the legacy keyCode p5 reads', () => {
    const events: KeyboardEvent[] = [];
    const listener = (event: KeyboardEvent) => events.push(event);
    window.addEventListener('keydown', listener);
    dispatchGameKey('keydown', 'left');
    window.removeEventListener('keydown', listener);
    expect(events).toHaveLength(1);
    expect(events[0].key).toBe('ArrowLeft');
    expect(events[0].keyCode).toBe(37);
  });
});
