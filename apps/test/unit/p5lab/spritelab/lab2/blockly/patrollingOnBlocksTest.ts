import patrollingOnBlocks, {
  TURN_PAUSE_TICKS,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/patrollingOnBlocks';

// The behavior's runtime half is interpreted ES5 source, so the test runs the
// shipped string with stubbed lab commands. The stubs mirror the real ones:
// platformSupportAhead is true when the point under the body's leading edge
// (the body is 80% of the on-screen size) is inside a block,
// platformGrounded says whether the resolver has the sprite on footing, and
// getProp('scale') is the sprite's on-screen size in pixels while
// getProp('width') is its costume's own unscaled width.
interface PatrolCase {
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
}

function patrol({
  size,
  costumeWidth,
  blockCols,
  startCol,
  cell = 40,
  row = 8,
  airborneFrames = 0,
}: PatrolCase) {
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
  const commands = {
    usePlatformBody: () => (marked = true),
    platformGrounded: () => frame >= airborneFrames,
    getProp: (id: unknown, prop: string): number | undefined => {
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
  };
  const behavior = new Function(
    'getProp',
    'setProp',
    'changePropBy',
    'usePlatformBody',
    'platformGrounded',
    'platformSupportAhead',
    `${patrollingOnBlocks.helperCode}\nreturn patrollingOnBlocks();`
  )(
    commands.getProp,
    commands.setProp,
    commands.changePropBy,
    commands.usePlatformBody,
    commands.platformGrounded,
    commands.platformSupportAhead
  );
  const seen: number[] = [];
  for (frame = 0; frame < 600; frame++) {
    behavior.func({id: 1});
    seen.push(sprite.x);
  }
  return {
    name: behavior.name,
    left: Math.min(...seen),
    right: Math.max(...seen),
    positions: new Set(seen.map(Math.round)).size,
    top,
    marked,
    seen,
  };
}

const FULL_FLOOR = [...Array(10).keys()];

describe('patrollingOnBlocks', () => {
  it('walks the full floor, turning half its own width from each edge', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 2,
    });
    expect(walk.name).toBe('patrolling on blocks');
    expect(walk.left).toBeCloseTo(20, 0);
    expect(walk.right).toBeCloseTo(380, 0);
    // Handed to the platform resolver, which gives it gravity and landings.
    expect(walk.marked).toBe(true);
  });

  it('waits in the air and walks on from where it lands', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: FULL_FLOOR,
      startCol: 2,
      airborneFrames: 30,
    });
    const start = walk.seen[0];
    expect(walk.seen.slice(0, 30).every(x => x === start)).toBe(true);
    expect(walk.seen[30]).not.toBe(start);
    // The landing frame is not read as a wall: it keeps walking the same way.
    expect(walk.seen[31] - walk.seen[30]).toBe(walk.seen[30] - start);
  });

  it("sizes itself from the sprite's on-screen size, not its costume's width", () => {
    // A generated costume is ~1000px wide however small the sprite is drawn.
    // Reading that instead of the size sent the gap probe off the canvas,
    // which left the sprite stepping forward and back in place.
    const walk = patrol({
      size: 40,
      costumeWidth: 4000,
      blockCols: FULL_FLOOR,
      startCol: 2,
    });
    expect(walk.positions).toBeGreaterThan(50);
  });

  it('stands for a moment at each turn', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
    });
    // Runs of unchanged x: each turn is one stand — the pause, plus the
    // turn's own tick (an edge is found by stepping and stepping back) — and
    // the walk between turns never stands.
    const stands: number[] = [];
    let run = 1;
    for (let i = 1; i < walk.seen.length; i++) {
      if (walk.seen[i] === walk.seen[i - 1]) {
        run++;
      } else {
        if (run > 1) stands.push(run);
        run = 1;
      }
    }
    expect(stands.length).toBeGreaterThan(4);
    expect(
      stands.every(s => s >= TURN_PAUSE_TICKS && s <= TURN_PAUSE_TICKS + 2)
    ).toBe(true);
  });

  it('turns back at a gap rather than walking off the blocks', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
    });
    // Blocks span 80..200; the body (32 wide) stops with its edge at theirs.
    expect(walk.left).toBeGreaterThanOrEqual(96);
    expect(walk.left).toBeLessThan(100);
    expect(walk.right).toBeLessThanOrEqual(184);
    expect(walk.right).toBeGreaterThan(180);
  });

  it('paces the width of a single block and never leaves it', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: [5],
      startCol: 5,
    });
    // Block 200..240, body 32 wide: a few pixels of room either side.
    expect(walk.left).toBeGreaterThanOrEqual(216);
    expect(walk.right).toBeLessThanOrEqual(224);
    expect(walk.positions).toBeLessThanOrEqual(6);
  });
});
