import {
  cellSize,
  compileWorldPrelude,
  createEmptyWorld,
  DEFAULT_SCENE_GRID_SIZE,
  isLegacyWorld,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  trimLegacyWorld,
  World,
  WorldCell,
} from '@cdo/apps/p5lab/spritelab/lab2/world';

// A legacy world: the 8-cell playfield this lab shipped with first.
const LEGACY_SCENE_SIZE = 8;

// A grid as projects stored it before the playfield became the grid: three
// times the playfield per side, with placements only in the top-left corner.
function oversizeWorld(sceneSize: number): World {
  const side = sceneSize * 3;
  return {
    grid: Array.from({length: side}, () =>
      Array.from({length: side}, (): WorldCell | null => null)
    ),
  };
}

describe('world', () => {
  it('creates an empty world the size of the playfield', () => {
    const world = createEmptyWorld();
    expect(world.grid).toHaveLength(DEFAULT_SCENE_GRID_SIZE);
    expect(world.grid[0]).toHaveLength(DEFAULT_SCENE_GRID_SIZE);
    expect(world.grid.flat().every(cell => cell === null)).toBe(true);
  });

  it('recognizes an oversize legacy grid and trims it to its playfield', () => {
    const legacy = oversizeWorld(DEFAULT_SCENE_GRID_SIZE);
    legacy.grid[DEFAULT_SCENE_GRID_SIZE - 1][0] = {image: 'ice', kind: 'block'};
    expect(isLegacyWorld(legacy)).toBe(true);
    const trimmed = trimLegacyWorld(legacy);
    expect(trimmed.grid).toHaveLength(DEFAULT_SCENE_GRID_SIZE);
    expect(trimmed.grid[0]).toHaveLength(DEFAULT_SCENE_GRID_SIZE);
    expect(trimmed.grid[DEFAULT_SCENE_GRID_SIZE - 1][0]).toEqual({
      image: 'ice',
      kind: 'block',
    });
    expect(sceneGridSize(trimmed)).toBe(DEFAULT_SCENE_GRID_SIZE);
    // The 8-cell era stored 24 per side.
    expect(trimLegacyWorld(oversizeWorld(LEGACY_SCENE_SIZE)).grid).toHaveLength(
      LEGACY_SCENE_SIZE
    );
  });

  it('trims by shape alone, dropping anything outside the corner', () => {
    // Nothing outside the corner was ever shown or run.
    const painted = oversizeWorld(DEFAULT_SCENE_GRID_SIZE);
    painted.grid[DEFAULT_SCENE_GRID_SIZE][0] = {image: 'ice', kind: 'block'};
    expect(isLegacyWorld(painted)).toBe(true);
    expect(trimLegacyWorld(painted).grid.flat().filter(Boolean)).toHaveLength(
      0
    );
  });

  it('knows a current grid from a legacy one', () => {
    expect(isLegacyWorld(createEmptyWorld())).toBe(false);
    expect(isLegacyWorld(undefined)).toBe(false);
    // Only the playfields the lab has had count: a 12-cell world is not a
    // 4-cell legacy one.
    expect(isLegacyWorld(createEmptyWorld(12))).toBe(false);
    expect(isLegacyWorld({grid: []})).toBe(false);
  });

  it('reads the playfield size back off a stored grid', () => {
    expect(sceneGridSize(createEmptyWorld())).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(sceneGridSize(createEmptyWorld(LEGACY_SCENE_SIZE))).toBe(
      LEGACY_SCENE_SIZE
    );
    // No world at all, and a world saved before the grid existed.
    expect(sceneGridSize(undefined)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(sceneGridSize({grid: []})).toBe(DEFAULT_SCENE_GRID_SIZE);
  });

  it('compiles nothing for an empty or missing world', () => {
    expect(compileWorldPrelude(undefined)).toBe('');
    expect(compileWorldPrelude(createEmptyWorld())).toBe('');
  });

  it('spawns blocks before sprites at cell centers, cell-sized', () => {
    const world = createEmptyWorld(LEGACY_SCENE_SIZE);
    world.grid[0][1] = {image: 'owl', kind: 'sprite'};
    world.grid[7][0] = {image: 'ice', kind: 'block'};
    expect(compileWorldPrelude(world)).toBe(
      [
        'setDefaultSpriteSize(50);',
        'makeNewGroupSprite("ice", \'walls\', {x: 25, y: 375});',
        'makeNewSpriteAnon("owl", {x: 75, y: 25});',
        '',
      ].join('\n')
    );
  });

  it("sizes cells from the world's own playfield, not a fixed constant", () => {
    const world = createEmptyWorld(20);
    world.grid[0][0] = {image: 'ice', kind: 'block'};
    expect(cellSize(20)).toBe(20);
    expect(compileWorldPrelude(world)).toBe(
      [
        'setDefaultSpriteSize(20);',
        'makeNewGroupSprite("ice", \'walls\', {x: 10, y: 10});',
        '',
      ].join('\n')
    );
  });

  it("grows a smaller world, keeping the playfield's floor at the floor", () => {
    const legacy = createEmptyWorld(LEGACY_SCENE_SIZE);
    // A floor along the old playfield's bottom row, and someone standing on
    // it. A taller playfield must not leave them mid-air.
    legacy.grid[LEGACY_SCENE_SIZE - 1][0] = {image: 'ice', kind: 'block'};
    legacy.grid[LEGACY_SCENE_SIZE - 2][0] = {image: 'cat', kind: 'sprite'};
    const grown = resizeWorld(legacy, DEFAULT_SCENE_GRID_SIZE);
    expect(sceneGridSize(grown)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(grown.grid[DEFAULT_SCENE_GRID_SIZE - 1][0]).toEqual({
      image: 'ice',
      kind: 'block',
    });
    expect(grown.grid[DEFAULT_SCENE_GRID_SIZE - 2][0]).toEqual({
      image: 'cat',
      kind: 'sprite',
    });
    expect(grown.grid.flat().filter(Boolean)).toHaveLength(2);
  });

  it('shrinks a larger world, still keeping the floor at the floor', () => {
    const wide = createEmptyWorld(12);
    wide.grid[11][2] = {image: 'ice', kind: 'block'};
    const shrunk = resizeWorld(wide, DEFAULT_SCENE_GRID_SIZE);
    expect(sceneGridSize(shrunk)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(shrunk.grid[DEFAULT_SCENE_GRID_SIZE - 1][2]).toEqual({
      image: 'ice',
      kind: 'block',
    });
  });

  it('refuses a resize that would push a placement off the grid', () => {
    // Painted above the playfield's top: shrinking would have to drop it.
    const wide = createEmptyWorld(12);
    wide.grid[0][0] = {image: 'ice', kind: 'block'};
    expect(sceneGridSize(resizeWorld(wide, DEFAULT_SCENE_GRID_SIZE))).toBe(12);
  });

  it('shrinks only when no placement would be dropped', () => {
    const empty = createEmptyWorld(DEFAULT_SCENE_GRID_SIZE);
    expect(sceneGridSize(resizeWorld(empty, LEGACY_SCENE_SIZE))).toBe(
      LEGACY_SCENE_SIZE
    );
    // Painted at the top: the rows shift down with the floor, so the smaller
    // world has nowhere to put it and the size is kept.
    const painted = createEmptyWorld(DEFAULT_SCENE_GRID_SIZE);
    painted.grid[0][0] = {image: 'ice', kind: 'block'};
    const kept = resizeWorld(painted, LEGACY_SCENE_SIZE);
    expect(sceneGridSize(kept)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(kept.grid[0][0]).toEqual({image: 'ice', kind: 'block'});
  });

  it('returns the same world when the size already matches', () => {
    const world = createEmptyWorld();
    expect(resizeWorld(world, DEFAULT_SCENE_GRID_SIZE)).toBe(world);
  });

  it('paints cells without mutating and creates the world on demand', () => {
    const first = paintWorldCell(undefined, 0, 0, {image: 'a', kind: 'block'});
    expect(first.grid[0][0]).toEqual({image: 'a', kind: 'block'});
    const second = paintWorldCell(first, 1, 1, {image: 'b', kind: 'sprite'});
    expect(second.grid[0][0]).toEqual({image: 'a', kind: 'block'});
    expect(second.grid[1][1]).toEqual({image: 'b', kind: 'sprite'});
    expect(first.grid[1][1]).toBeNull();
    expect(paintWorldCell(second, 0, 0, null).grid[0][0]).toBeNull();
  });

  it('keeps the identity of every row a paint does not touch', () => {
    const first = paintWorldCell(undefined, 0, 0, {image: 'a', kind: 'block'});
    const second = paintWorldCell(first, 1, 1, {image: 'b', kind: 'sprite'});
    expect(second.grid[0]).toBe(first.grid[0]);
    expect(second.grid[1]).not.toBe(first.grid[1]);
    expect(second.grid[2]).toBe(first.grid[2]);
  });

  it('paints over a gridless world saved by an older experiment', () => {
    const legacy = {} as Parameters<typeof paintWorldCell>[0];
    const world = paintWorldCell(legacy, 2, 3, {image: 'a', kind: 'block'});
    expect(sceneGridSize(world)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(world.grid[2][3]).toEqual({image: 'a', kind: 'block'});
  });

  it('quotes image names safely', () => {
    const world = createEmptyWorld(LEGACY_SCENE_SIZE);
    world.grid[0][0] = {image: 'say "hi"', kind: 'sprite'};
    expect(compileWorldPrelude(world)).toContain(
      'makeNewSpriteAnon("say \\"hi\\"", {x: 25, y: 25});'
    );
  });
});
