import {
  arrowSetFor,
  dispatchGameKey,
} from '@cdo/apps/p5lab/spritelab/lab2/views/playBar';

describe('arrowSetFor', () => {
  const platform = (gravity: number, ladders = false) => ({
    platformer: true,
    gravity,
    ladders,
  });

  it('offers Jump in a platform scene with gravity, either way up', () => {
    expect(arrowSetFor(platform(0.75))).toBe('jump');
    expect(arrowSetFor(platform(-0.75))).toBe('jump');
  });

  it('adds Down when the scene has ladders', () => {
    expect(arrowSetFor(platform(0.75, true))).toBe('climb');
    expect(arrowSetFor(platform(-0.75, true))).toBe('climb');
  });

  it('steers up and down when weightless, ladders or not', () => {
    expect(arrowSetFor(platform(0))).toBe('steer');
    expect(arrowSetFor(platform(0, true))).toBe('steer');
  });

  it('offers no arrows in a story scene', () => {
    expect(arrowSetFor({platformer: false, gravity: 0.75, ladders: true})).toBe(
      'none'
    );
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
