import {
  FOLLOW_REACH_PX,
  TURN_PAUSE_TICKS,
  WALKERS_HELPER_CODE,
  WANDER_STAND_EVERY,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/walkingOnBlocks';

// The behaviours' runtime half is interpreted ES5 source, so the tests run
// the shipped string with stubbed lab commands. The stubs mirror the real
// ones: platformSupportAhead is true when the point under the body's leading
// edge (the body is 80% of the on-screen size) is inside a block,
// platformGrounded says whether the resolver has the sprite on footing,
// getProp('scale') is the sprite's on-screen size in pixels while
// getProp('width') is its costume's own unscaled width, and getProp on
// {group: 'players'} reads the player.
interface WalkCase {
  behavior?:
    | 'patrollingOnBlocks'
    | 'wanderingOnBlocks'
    | 'followingPlayerOnBlocks';
  // The sprite's on-screen size in pixels, as getProp('scale') reports it.
  size: number;
  // Its costume's own unscaled width, as getProp('width') reports it.
  costumeWidth: number;
  // Columns holding a block, all on the same row.
  blockCols: number[];
  startCol: number;
  cell?: number;
  row?: number;
  // Frames the sprite spends in the air before landing.
  airborneFrames?: number;
  // The player's x, or none; a function reads it per frame.
  playerX?: number | ((frame: number) => number | undefined);
  // A stand-in for randomNumber: the roll each call takes, 0..1 of the range.
  random?: () => number;
  frames?: number;
}

function walk({
  behavior = 'patrollingOnBlocks',
  size,
  costumeWidth,
  blockCols,
  startCol,
  cell = 40,
  row = 8,
  airborneFrames = 0,
  playerX,
  random = () => 0.5,
  frames = 600,
}: WalkCase) {
  const centerOf = (col: number) => cell / 2 + cell * col;
  const top = cell * (row + 1);
  const blocks = blockCols.map(col => ({
    left: centerOf(col) - cell / 2,
    right: centerOf(col) + cell / 2,
  }));
  const sprite = {x: centerOf(startCol)};
  const props: {[key: string]: number | undefined} = {};
  let frame = 0;
  let marked = false;
  const player = () =>
    typeof playerX === 'function' ? playerX(frame) : playerX;
  const commands = {
    usePlatformBody: () => (marked = true),
    platformGrounded: () => frame >= airborneFrames,
    getProp: (id: unknown, prop: string): number | undefined => {
      if ((id as {group?: string}).group === 'players') {
        return prop === 'x' ? player() : undefined;
      }
      if (prop === 'x') return sprite.x;
      if (prop === 'scale') return size;
      if (prop === 'width') return costumeWidth;
      return props[prop];
    },
    setProp: (id: unknown, prop: string, value: number | undefined) => {
      // The real command ignores undefined values.
      if (value === undefined) return;
      if (prop === 'x') sprite.x = value;
      else props[prop] = value;
    },
    changePropBy: (id: unknown, prop: string, delta: number) => {
      if (prop === 'x') sprite.x += delta;
    },
    platformSupportAhead: (id: unknown, direction: number) => {
      const toe = sprite.x + direction * size * 0.4;
      return blocks.some(b => toe >= b.left && toe <= b.right);
    },
    randomNumber: (low: number, high: number) =>
      low + Math.floor(random() * (high - low + 1)),
  };
  const made = new Function(
    'getProp',
    'setProp',
    'changePropBy',
    'usePlatformBody',
    'platformGrounded',
    'platformSupportAhead',
    'randomNumber',
    `${WALKERS_HELPER_CODE}\nreturn ${behavior}();`
  )(
    commands.getProp,
    commands.setProp,
    commands.changePropBy,
    commands.usePlatformBody,
    commands.platformGrounded,
    commands.platformSupportAhead,
    commands.randomNumber
  );
  const seen: number[] = [];
  for (frame = 0; frame < frames; frame++) {
    made.func({id: 1});
    seen.push(sprite.x);
  }
  return {
    name: made.name,
    left: Math.min(...seen),
    right: Math.max(...seen),
    positions: new Set(seen.map(Math.round)).size,
    top,
    marked,
    seen,
    last: sprite.x,
  };
}

// Runs of unchanged x, each a stand.
function stands(seen: number[]): number[] {
  const runs: number[] = [];
  let run = 1;
  for (let i = 1; i < seen.length; i++) {
    if (seen[i] === seen[i - 1]) {
      run++;
    } else {
      if (run > 1) runs.push(run);
      run = 1;
    }
  }
  return runs;
}

const FULL_FLOOR = [...Array(10).keys()];

describe('patrollingOnBlocks', () => {
  it('walks the full floor, turning half its own width from each edge', () => {
    const w = walk({
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 2,
    });
    expect(w.name).toBe('patrolling on blocks');
    expect(w.left).toBeCloseTo(20, 0);
    expect(w.right).toBeCloseTo(380, 0);
    // Handed to the platform resolver, which gives it gravity and landings.
    expect(w.marked).toBe(true);
  });

  it('waits in the air and walks on from where it lands', () => {
    const w = walk({
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 2,
      airborneFrames: 30,
    });
    const start = w.seen[0];
    expect(w.seen.slice(0, 30).every(x => x === start)).toBe(true);
    expect(w.seen[30]).not.toBe(start);
    // The landing frame is not read as a wall: it keeps walking the same way.
    expect(w.seen[31] - w.seen[30]).toBe(w.seen[30] - start);
  });

  it("sizes itself from the sprite's on-screen size, not its costume's width", () => {
    // A generated costume is ~1000px wide however small the sprite is drawn.
    // Reading that instead of the size sent the gap probe off the canvas,
    // which left the sprite stepping forward and back in place.
    const w = walk({
      size: 40,
      costumeWidth: 4000,
      blockCols: FULL_FLOOR,
      startCol: 2,
    });
    expect(w.positions).toBeGreaterThan(50);
  });

  it('stands for a moment at each turn', () => {
    const w = walk({
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
    });
    // Each turn is one stand — the pause, plus the turn's own tick (an edge
    // is found by stepping and stepping back) — and the walk between turns
    // never stands.
    const runs = stands(w.seen);
    expect(runs.length).toBeGreaterThan(4);
    expect(
      runs.every(s => s >= TURN_PAUSE_TICKS && s <= TURN_PAUSE_TICKS + 2)
    ).toBe(true);
  });

  it('turns back at a gap rather than walking off the blocks', () => {
    const w = walk({
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
    });
    // Blocks span 80..200; the body (32 wide) stops with its edge at theirs.
    expect(w.left).toBeGreaterThanOrEqual(96);
    expect(w.left).toBeLessThan(100);
    expect(w.right).toBeLessThanOrEqual(184);
    expect(w.right).toBeGreaterThan(180);
  });

  it('paces the width of a single block and never leaves it', () => {
    const w = walk({
      size: 40,
      costumeWidth: 1024,
      blockCols: [5],
      startCol: 5,
    });
    // Block 200..240, body 32 wide: a few pixels of room either side.
    expect(w.left).toBeGreaterThanOrEqual(216);
    expect(w.right).toBeLessThanOrEqual(224);
    expect(w.positions).toBeLessThanOrEqual(6);
  });
});

describe('wanderingOnBlocks', () => {
  // A roll sequence that stands now and then and picks both directions.
  function rolling() {
    let n = 0;
    return () => {
      n++;
      // Every WANDER_STAND_EVERY-th roll of the stand check comes up 1.
      return (n * 0.37) % 1;
    };
  }

  it('stays on the blocks and goes both ways', () => {
    const w = walk({
      behavior: 'wanderingOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4, 5, 6],
      startCol: 4,
      random: rolling(),
      frames: 2000,
    });
    expect(w.name).toBe('wandering on blocks');
    expect(w.marked).toBe(true);
    // Blocks span 80..280; the body never leaves them.
    expect(w.left).toBeGreaterThanOrEqual(96);
    expect(w.right).toBeLessThanOrEqual(264);
    expect(w.left).toBeLessThan(140);
    expect(w.right).toBeGreaterThan(220);
  });

  it('stands at random, for longer than a turn, and sets off either way', () => {
    // The stand check rolls 1 on every call: a stand straight away.
    let calls = 0;
    const w = walk({
      behavior: 'wanderingOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 5,
      random: () => (calls++ % 3 === 0 ? 0 : 0.9),
      frames: 400,
    });
    const runs = stands(w.seen);
    expect(runs.length).toBeGreaterThan(3);
    expect(runs.some(s => s > TURN_PAUSE_TICKS + 2)).toBe(true);
    const steps = new Set(
      w.seen
        .slice(1)
        .map((x, i) => Math.sign(x - w.seen[i]))
        .filter(Boolean)
    );
    expect(steps).toEqual(new Set([1, -1]));
    expect(WANDER_STAND_EVERY).toBeGreaterThan(TURN_PAUSE_TICKS);
  });
});

describe('followingPlayerOnBlocks', () => {
  it('walks to the player and stops within reach', () => {
    const w = walk({
      behavior: 'followingPlayerOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 1,
      playerX: 300,
      frames: 300,
    });
    expect(w.name).toBe('following the player');
    expect(w.marked).toBe(true);
    expect(w.last).toBeGreaterThan(300 - FOLLOW_REACH_PX - 1);
    expect(w.last).toBeLessThan(300);
    // Once there it stands, rather than shuffling about the player.
    expect(w.seen.slice(-20).every(x => x === w.last)).toBe(true);
  });

  it('turns to follow a player who walks past, the other way', () => {
    const w = walk({
      behavior: 'followingPlayerOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 5,
      playerX: frame => (frame < 150 ? 380 : 20),
      frames: 400,
    });
    expect(w.right).toBeGreaterThan(300);
    expect(w.last).toBeLessThan(20 + FOLLOW_REACH_PX + 1);
  });

  it('waits at a gap rather than stepping off toward the player', () => {
    const w = walk({
      behavior: 'followingPlayerOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
      playerX: 380,
      frames: 300,
    });
    // Blocks span 80..200; the body stops with its edge at theirs and stays.
    expect(w.right).toBeLessThanOrEqual(184);
    expect(w.seen.slice(-50).every(x => x === w.last)).toBe(true);
  });

  it('stands still with no player in the scene', () => {
    const w = walk({
      behavior: 'followingPlayerOnBlocks',
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 3,
      frames: 100,
    });
    expect(w.positions).toBe(1);
  });
});
