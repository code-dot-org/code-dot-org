import patrollingOnBlocks from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/patrollingOnBlocks';

// The behavior's runtime half is interpreted ES5 source, so the test runs the
// shipped string with stubbed lab commands. The stubs mirror the real ones:
// hasSupportAt needs resting contact AND the probe inside a block, and
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
}

function patrol({
  size,
  costumeWidth,
  blockCols,
  startCol,
  cell = 40,
  row = 8,
}: PatrolCase) {
  const centerOf = (col: number) => cell / 2 + cell * col;
  const top = cell * (row + 1);
  const blocks = blockCols.map(col => ({
    left: centerOf(col) - cell / 2,
    right: centerOf(col) + cell / 2,
  }));
  const sprite = {x: centerOf(startCol)};
  const props: {[key: string]: number} = {};
  const commands = {
    getProp: (id: unknown, prop: string) => {
      if (prop === 'x') return sprite.x;
      if (prop === 'scale') return size;
      if (prop === 'width') return costumeWidth;
      return props[prop];
    },
    setProp: (id: unknown, prop: string, value: number) => {
      if (prop === 'x') sprite.x = value;
      else props[prop] = value;
    },
    changePropBy: (id: unknown, prop: string, delta: number) => {
      if (prop === 'x') sprite.x += delta;
    },
    // Resting on the blocks throughout.
    isDirectlyAbove: () => true,
    hasSupportAt: (id: unknown, offset: number) =>
      blocks.some(
        b => sprite.x + offset >= b.left && sprite.x + offset <= b.right
      ),
  };
  const behavior = new Function(
    'getProp',
    'setProp',
    'changePropBy',
    'isDirectlyAbove',
    'hasSupportAt',
    `${patrollingOnBlocks.helperCode}\nreturn patrollingOnBlocks();`
  )(
    commands.getProp,
    commands.setProp,
    commands.changePropBy,
    commands.isDirectlyAbove,
    commands.hasSupportAt
  );
  const seen: number[] = [];
  for (let frame = 0; frame < 600; frame++) {
    behavior.func({id: 1});
    seen.push(sprite.x);
  }
  return {
    name: behavior.name,
    left: Math.min(...seen),
    right: Math.max(...seen),
    positions: new Set(seen.map(Math.round)).size,
    top,
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

  it('turns back at a gap rather than walking off the blocks', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: [2, 3, 4],
      startCol: 3,
    });
    expect(walk.left).toBeGreaterThanOrEqual(80);
    expect(walk.right).toBeLessThanOrEqual(200);
  });

  it('stands still on a single block, with nowhere to walk', () => {
    const walk = patrol({
      size: 40,
      costumeWidth: 1024,
      blockCols: [5],
      startCol: 5,
    });
    expect(walk.positions).toBeLessThanOrEqual(2);
  });
});
