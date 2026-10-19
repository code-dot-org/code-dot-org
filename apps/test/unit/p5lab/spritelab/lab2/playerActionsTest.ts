import {
  createPlayerActionTracker,
  isPlayerAction,
  PlayerAction,
  PlayerFrame,
  WALK_PERIOD_MS,
} from '@cdo/apps/p5lab/spritelab/lab2/playerActions';

const VIEW = {width: 400, height: 400};
const GRAVITY = 0.6;
const CELL = 40;
// Walls are square cells; a floor is a row of them along the bottom.
const cell = (x: number, y: number) => ({
  position: {x, y},
  width: CELL,
  height: CELL,
  scale: 1,
});
const FLOOR = Array.from({length: 10}, (_, i) =>
  cell(CELL / 2 + i * CELL, VIEW.height - CELL / 2)
);
const FLOOR_TOP = VIEW.height - CELL;
const SIZE = 40;

function frame(
  x: number,
  y: number,
  asked: {x?: number; y?: number} = {},
  walls = FLOOR,
  animation?: {frame: number; frames: number}
): PlayerFrame {
  return {
    sprite: {
      position: {x, y},
      velocity: {x: 0, y: 0},
      width: SIZE,
      height: SIZE,
      scale: 1,
    } as never,
    requestedX: asked.x ?? x,
    requestedY: asked.y ?? y,
    gravity: GRAVITY,
    walls: walls as never,
    view: VIEW,
    animationFrame: animation?.frame,
    animationFrames: animation?.frames,
  };
}

// Standing on the floor: feet on its top edge.
const STANDING_Y = FLOOR_TOP - SIZE / 2;

function run(frames: PlayerFrame[], stepMs = 16): PlayerAction[][] {
  const tracker = createPlayerActionTracker();
  return frames.map((f, i) => [...tracker.observe(f, i * stepMs)]);
}

describe('isPlayerAction', () => {
  it('knows the four actions', () => {
    expect(isPlayerAction('walk')).toBe(true);
    expect(isPlayerAction('land')).toBe(true);
    expect(isPlayerAction('bump')).toBe(true);
    expect(isPlayerAction('fly')).toBe(false);
    expect(isPlayerAction(3)).toBe(false);
  });
});

describe('createPlayerActionTracker', () => {
  it('reports nothing on the first frame', () => {
    expect(run([frame(100, STANDING_Y)])).toEqual([[]]);
  });

  it('beats a walk on the first step and then on each walk-frame flip', () => {
    // The strip shows standing frame 0 at rest; the walk pose opens on
    // frame 2 the frame after the first step, then flips 1/2 every three
    // ticks.
    const walkFrame = (i: number) =>
      i <= 1 ? 0 : 1 + ((Math.floor((i - 2) / 3) + 1) % 2);
    const frames = Array.from({length: 15}, (_, i) =>
      frame(100 + (i === 0 ? 0 : i * 3), STANDING_Y, {}, FLOOR, {
        frame: walkFrame(i),
        frames: 5,
      })
    );
    const walks = run(frames)
      .map((actions, i) => (actions.includes('walk') ? i : -1))
      .filter(i => i >= 0);
    // Frame 1 is the first step; frame 2's pose switch only arms; then
    // each flip (frames 5, 8, 11, 14) beats.
    expect(walks).toEqual([1, 5, 8, 11, 14]);
  });

  it('treats a gravity change in the air as neither jump nor landing', () => {
    const tracker = createPlayerActionTracker();
    tracker.observe(frame(100, STANDING_Y - 60), 0);
    const weightless = {...frame(100, STANDING_Y - 60), gravity: 0};
    expect([...tracker.observe(weightless, 16)]).toEqual([]);
    const falling = frame(100, STANDING_Y - 62);
    expect([...tracker.observe(falling, 32)]).toEqual([]);
  });

  it('beats a one-frame character on the period', () => {
    const frames = Array.from({length: 40}, (_, i) =>
      frame(100 + i * 3, STANDING_Y)
    );
    const walks = run(frames, 16)
      .map((actions, i) => (actions.includes('walk') ? i : -1))
      .filter(i => i >= 0);
    // Frame 0 has no previous; the walk starts at frame 1.
    expect(walks[0]).toBe(1);
    expect((walks[1] - walks[0]) * 16).toBeGreaterThanOrEqual(WALK_PERIOD_MS);
    expect(walks.length).toBeGreaterThanOrEqual(2);
  });

  it('starts the beat over after standing still', () => {
    const tracker = createPlayerActionTracker();
    tracker.observe(frame(100, STANDING_Y), 0);
    expect([...tracker.observe(frame(103, STANDING_Y), 16)]).toEqual(['walk']);
    expect([...tracker.observe(frame(103, STANDING_Y), 32)]).toEqual([]);
    expect([...tracker.observe(frame(106, STANDING_Y), 48)]).toEqual(['walk']);
  });

  it('does not walk in the air', () => {
    const [, second] = run([
      frame(100, STANDING_Y - 60),
      frame(103, STANDING_Y - 62),
    ]);
    expect(second).not.toContain('walk');
  });

  it('jumps when leaving the ground upward, not when stepping off an edge', () => {
    const jump = run([frame(100, STANDING_Y), frame(100, STANDING_Y - 8)]);
    expect(jump[1]).toContain('jump');
    const ledge = [cell(100, VIEW.height - CELL / 2)];
    const fall = run([
      frame(100, STANDING_Y, {}, ledge),
      frame(140, STANDING_Y + 4, {}, ledge),
    ]);
    expect(fall[1]).not.toContain('jump');
  });

  it('lands when the player reaches the ground again', () => {
    const actions = run([
      frame(100, STANDING_Y - 30),
      frame(100, STANDING_Y - 12),
      frame(100, STANDING_Y),
      frame(100, STANDING_Y),
    ]);
    expect(actions[1]).not.toContain('land');
    expect(actions[2]).toContain('land');
    expect(actions[3]).not.toContain('land');
  });

  it('bumps once when a move into a wall is refused', () => {
    const asked = {x: 106};
    const actions = run([
      frame(100, STANDING_Y),
      frame(100, STANDING_Y, asked),
      frame(100, STANDING_Y, asked),
    ]);
    expect(actions[1]).toContain('bump');
    expect(actions[2]).not.toContain('bump');
  });

  it('bumps when a jump is stopped by a block overhead', () => {
    const actions = run([
      frame(100, STANDING_Y),
      frame(100, STANDING_Y, {y: STANDING_Y - 10}),
    ]);
    expect(actions[1]).toContain('bump');
  });

  it('jumps and lands under flipped gravity, against the ceiling', () => {
    // Gravity pulls up: the ceiling is a row of cells along the top, and the
    // player stands with its head on them.
    const ceiling = Array.from({length: 10}, (_, i) =>
      cell(CELL / 2 + i * CELL, CELL / 2)
    );
    const standingY = CELL + SIZE / 2;
    const flipped = (y: number) => ({
      ...frame(100, y, {}, ceiling),
      gravity: -GRAVITY,
    });
    const actions = run([
      flipped(standingY),
      flipped(standingY),
      flipped(standingY + 20),
      flipped(standingY + 60),
      flipped(standingY + 30),
      flipped(standingY),
      flipped(standingY),
    ]);
    expect(actions.map(a => a.filter(x => x !== 'walk'))).toEqual([
      [],
      [],
      ['jump'],
      [],
      [],
      ['land'],
      [],
    ]);
  });

  it('forgets, so the next frame is a first frame again', () => {
    const tracker = createPlayerActionTracker();
    tracker.observe(frame(100, STANDING_Y), 0);
    tracker.forget();
    expect([...tracker.observe(frame(103, STANDING_Y), 16)]).toEqual([]);
  });
});
