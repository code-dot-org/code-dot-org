import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {
  createEmptyWorld,
  World,
  WorldCell,
} from '@cdo/apps/p5lab/spritelab/lab2/world';
import {
  paintPattern,
  patternCells,
} from '@cdo/apps/p5lab/spritelab/lab2/worldStartPattern';

// Newest first, as the animation list stores them.
function animations(
  entries: [key: string, name: string, categories: string[]][]
): RuntimeAnimationList {
  return {
    orderedKeys: entries.map(([key]) => key),
    propsByKey: Object.fromEntries(
      entries.map(([key, name, categories]) => [key, {name, categories}])
    ),
  } as RuntimeAnimationList;
}

const twoOfEach = animations([
  ['k4', 'newBlock', ['blocks']],
  ['k3', 'oldBlock', ['blocks']],
  ['k2', 'secondCharacter', []],
  ['k1', 'firstCharacter', []],
]);

function worldWith(placements: [row: number, col: number, cell: WorldCell][]) {
  const world = createEmptyWorld(10);
  placements.forEach(([row, col, cell]) => (world.grid[row][col] = cell));
  return world;
}

function occupied(world: World) {
  const found: string[] = [];
  world.grid.forEach((cells, row) =>
    cells.forEach(
      (cell, col) => cell && found.push(`${row},${col}:${cell.image}`)
    )
  );
  return found;
}

describe('patternCells', () => {
  it('takes the newest block and the first character', () => {
    expect(patternCells(twoOfEach)).toEqual({
      B: {image: 'newBlock', kind: 'block'},
      S: {image: 'firstCharacter', kind: 'sprite'},
    });
  });

  it('offers only the characters it has images for', () => {
    expect(patternCells(animations([['k1', 'hero', []]]))).toEqual({
      S: {image: 'hero', kind: 'sprite'},
    });
    expect(patternCells(animations([]))).toEqual({});
  });

  it('does not mistake a background for a character', () => {
    expect(patternCells(animations([['k1', 'sky', ['backgrounds']]]))).toEqual(
      {}
    );
  });
});

describe('paintPattern', () => {
  const cells = patternCells(twoOfEach);

  it('anchors a short pattern to the playfield floor', () => {
    const painted = paintPattern(createEmptyWorld(10), ['S.', 'BB'], cells);
    expect(occupied(painted as World)).toEqual([
      '8,0:firstCharacter',
      '9,0:newBlock',
      '9,1:newBlock',
    ]);
  });

  it('seeds a world that does not exist yet', () => {
    expect(occupied(paintPattern(undefined, ['S'], cells) as World)).toEqual([
      '9,0:firstCharacter',
    ]);
  });

  it('leaves a kind alone once the world holds any of it', () => {
    const placed = worldWith([[0, 0, {image: 'ownBlock', kind: 'block'}]]);
    const painted = paintPattern(placed, ['SB'], cells) as World;
    expect(occupied(painted)).toEqual(['0,0:ownBlock', '9,0:firstCharacter']);
  });

  it('never overwrites an occupied cell', () => {
    const placed = worldWith([[9, 0, {image: 'theirs', kind: 'sprite'}]]);
    expect(paintPattern(placed, ['S'], cells)).toBeNull();
  });

  it('returns null when the pattern paints nothing', () => {
    expect(paintPattern(createEmptyWorld(10), ['...'], cells)).toBeNull();
    expect(paintPattern(createEmptyWorld(10), ['SB'], {})).toBeNull();
  });

  it('leaves the world it was given untouched', () => {
    const world = createEmptyWorld(10);
    paintPattern(world, ['S'], cells);
    expect(occupied(world)).toEqual([]);
  });

  it('clips a pattern bigger than the playfield', () => {
    const tall = Array.from({length: 12}, () => 'S'.padEnd(12, 'B'));
    const painted = paintPattern(createEmptyWorld(10), tall, cells) as World;
    const rows = painted.grid.filter(cells => cells.some(Boolean)).length;
    expect(rows).toBe(10);
    expect(painted.grid[0].filter(Boolean)).toHaveLength(10);
  });
});
