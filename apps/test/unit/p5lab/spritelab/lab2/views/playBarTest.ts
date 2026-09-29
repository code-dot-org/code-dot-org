import {
  arrowSetFor,
  dispatchGameKey,
} from '@cdo/apps/p5lab/spritelab/lab2/views/playBar';

describe('arrowSetFor', () => {
  it('offers Jump in a platform scene with gravity, either way up', () => {
    expect(arrowSetFor({platformer: true, gravity: 0.75})).toBe('jump');
    expect(arrowSetFor({platformer: true, gravity: -0.75})).toBe('jump');
  });

  it('steers up and down when weightless, and in a story scene', () => {
    expect(arrowSetFor({platformer: true, gravity: 0})).toBe('steer');
    expect(arrowSetFor({platformer: false, gravity: 0.75})).toBe('steer');
  });
});

describe('dispatchGameKey', () => {
  it('fires a window key event carrying the legacy code p5 reads', () => {
    const seen: KeyboardEvent[] = [];
    const record = (e: Event) => seen.push(e as KeyboardEvent);
    window.addEventListener('keydown', record);
    window.addEventListener('keyup', record);
    try {
      dispatchGameKey('keydown', 'left');
      dispatchGameKey('keyup', 'up');
    } finally {
      window.removeEventListener('keydown', record);
      window.removeEventListener('keyup', record);
    }
    expect(seen.map(e => [e.type, e.keyCode, e.which, e.key])).toEqual([
      ['keydown', 37, 37, 'ArrowLeft'],
      ['keyup', 38, 38, 'ArrowUp'],
    ]);
  });
});
