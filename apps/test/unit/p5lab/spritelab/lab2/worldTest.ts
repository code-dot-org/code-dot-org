import {
  cellSize,
  compileWorldPrelude,
  createEmptyWorld,
  DEFAULT_SCENE_GRID_SIZE,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  WORLD_MULTIPLE,
} from '@cdo/apps/p5lab/spritelab/lab2/world';

// A legacy world: the 8-cell playfield this lab shipped with first.
const LEGACY_SCENE_SIZE = 8;

describe('world', () => {
  it('creates an empty world at a multiple of the scene grid per side', () => {
    const world = createEmptyWorld();
    const side = DEFAULT_SCENE_GRID_SIZE * WORLD_MULTIPLE;
    expect(world.grid).toHaveLength(side);
    expect(world.grid[0]).toHaveLength(side);
    expect(world.grid.flat().every(cell => cell === null)).toBe(true);
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

  it('runs only the scene-sized top-left corner of the world', () => {
    const world = createEmptyWorld();
    world.grid[DEFAULT_SCENE_GRID_SIZE][0] = {image: 'ice', kind: 'block'};
    world.grid[0][DEFAULT_SCENE_GRID_SIZE] = {image: 'ice', kind: 'block'};
    expect(compileWorldPrelude(world)).toBe('');
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
    // Painted at the very bottom of the authoring area: the smaller world has
    // nowhere to put it, even after the rows shift, so the size is kept.
    const painted = createEmptyWorld(DEFAULT_SCENE_GRID_SIZE);
    const lastRow = DEFAULT_SCENE_GRID_SIZE * WORLD_MULTIPLE - 1;
    painted.grid[lastRow][0] = {image: 'ice', kind: 'block'};
    const kept = resizeWorld(painted, LEGACY_SCENE_SIZE);
    expect(sceneGridSize(kept)).toBe(DEFAULT_SCENE_GRID_SIZE);
    expect(kept.grid[lastRow][0]).toEqual({image: 'ice', kind: 'block'});
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
