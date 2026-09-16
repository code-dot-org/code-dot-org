import {
  initialPlayerEventState,
  playerEvents,
  PlayerEventState,
  PlayerFrame,
} from '@cdo/apps/p5lab/spritelab/lab2/playerEvents';

const STILL: PlayerFrame = {
  moved: 0,
  requested: 0,
  movedUp: 0,
  requestedUp: 0,
  grounded: true,
};

const frame = (over: Partial<PlayerFrame>): PlayerFrame => ({
  ...STILL,
  ...over,
});

describe('SpriteLab2 playerEvents', () => {
  let state: PlayerEventState;
  beforeEach(() => {
    state = initialPlayerEventState();
  });

  const run = (...frames: PlayerFrame[]) =>
    frames.map(f => playerEvents(state, f));

  it('is silent on the first frame of a run', () => {
    // A spawn is a position, not a stride.
    expect(run(STILL)).toEqual([[]]);
  });

  it('is silent while the player stands still', () => {
    expect(run(STILL, STILL)).toEqual([[], []]);
  });

  it('sounds the first stride at once, then by distance covered', () => {
    // Primed, so the first moving frame steps at once; 16px after that.
    expect(
      run(
        frame({moved: 4, requested: 4}),
        frame({moved: 4, requested: 4}),
        frame({moved: 4, requested: 4}),
        frame({moved: 4, requested: 4}),
        frame({moved: 4, requested: 4})
      )
    ).toEqual([['step'], [], [], ['step'], []]);
  });

  it('re-primes when the player stops, so the next walk steps at once', () => {
    run(frame({moved: 4, requested: 4}));
    expect(run(STILL, frame({moved: 4, requested: 4}))).toEqual([[], ['step']]);
  });

  it('takes no steps in the air', () => {
    expect(run(frame({moved: 4, requested: 4, grounded: false}))).toEqual([[]]);
  });

  it('reports a wall once, not every frame the key is held', () => {
    expect(
      run(
        frame({moved: 0, requested: 4}),
        frame({moved: 0, requested: 4}),
        frame({moved: 0, requested: 4})
      )
    ).toEqual([['blocked'], [], []]);
  });

  it('reports a block overhead with the same buzz as a wall', () => {
    // The real numbers, off the resolver: the jump asks for 13px, the
    // block allows 10, and the player is coming down by the next frame.
    expect(
      run(
        frame({grounded: false, requestedUp: 13, movedUp: 13}),
        frame({grounded: false, requestedUp: 13, movedUp: 10}),
        frame({grounded: false, requestedUp: -8.75, movedUp: -8.75})
      )
    ).toEqual([[], ['blocked'], []]);
  });

  it('ignores a rise nothing got in the way of', () => {
    expect(run(frame({grounded: false, requestedUp: 13, movedUp: 13}))).toEqual(
      [[]]
    );
  });

  it('ignores the sub-pixel slack of a clean pass under a block', () => {
    expect(
      run(frame({grounded: false, requestedUp: 13, movedUp: 12.9}))
    ).toEqual([[]]);
  });

  it('reports a wall hit in mid-air, not just on the ground', () => {
    expect(run(frame({moved: 0, requested: 4, grounded: false}))).toEqual([
      ['blocked'],
    ]);
  });

  it('lets a block overhead through while a wall is already held', () => {
    expect(
      run(
        frame({moved: 0, requested: 4, grounded: false}),
        frame({
          moved: 0,
          requested: 4,
          grounded: false,
          requestedUp: 13,
          movedUp: 10,
        })
      )
    ).toEqual([['blocked'], ['blocked']]);
  });

  it('reports the wall again after walking away and back', () => {
    expect(
      run(
        frame({moved: 0, requested: 4}),
        frame({moved: -4, requested: -4}),
        frame({moved: 0, requested: 4})
      )
    ).toEqual([['blocked'], ['step'], ['blocked']]);
  });
});
