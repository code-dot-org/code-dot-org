import {
  cellSize,
  compileWorldPrelude,
  createEmptyWorld,
  DEFAULT_SCENE_GRID_SIZE,
  isLegacyWorld,
  imagesWithOneLeft,
  paintWorldCell,
  placementsLostByResize,
  resizeWorld,
  resizeWorldScreens,
  sceneGridSize,
  trimLegacyWorld,
  worldBounds,
  worldScreens,
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
    // Only the current playfield's storage counts: a 12-cell world is not a
    // 4-cell legacy one, and the 8-cell era's 24 is history.
    expect(isLegacyWorld(createEmptyWorld(12))).toBe(false);
    expect(isLegacyWorld(oversizeWorld(LEGACY_SCENE_SIZE))).toBe(false);
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

  it('finds the images that are the only one of their kept role', () => {
    const gem: WorldCell = {image: 'Gem', kind: 'sprite'};
    const coin: WorldCell = {image: 'Coin', kind: 'sprite'};
    const pal: WorldCell = {image: 'Pal', kind: 'sprite'};
    const stone: WorldCell = {image: 'Stone', kind: 'block'};
    // Two images share the treasure role. Stone has no kept role.
    const kept = new Map([
      ['Gem', 'treasure'],
      ['Coin', 'treasure'],
      ['Pal', 'friend'],
    ]);
    // The treasure role is on two squares, so neither treasure is the
    // last. The friend is on one.
    const world = {
      grid: [
        [gem, coin, stone],
        [pal, null, null],
      ],
    };
    expect([...imagesWithOneLeft(world, kept)]).toEqual(['Pal']);
    expect(imagesWithOneLeft(undefined, kept).size).toBe(0);
  });

  it('ignores a change that would remove the last copy of a kept image', () => {
    const gem: WorldCell = {image: 'Gem', kind: 'sprite'};
    const stone: WorldCell = {image: 'Stone', kind: 'block'};
    const kept = new Map([
      ['Gem', 'treasure'],
      ['Coin', 'treasure'],
    ]);
    const one = paintWorldCell(undefined, 0, 0, gem, kept);
    expect(paintWorldCell(one, 0, 0, null, kept)).toBe(one);
    expect(paintWorldCell(one, 0, 0, stone, kept)).toBe(one);
    // With a second copy placed, either one can go, but not both.
    const two = paintWorldCell(one, 0, 1, gem, kept);
    const moved = paintWorldCell(two, 0, 0, null, kept);
    expect(moved.grid[0][0]).toBeNull();
    expect(paintWorldCell(moved, 0, 1, null, kept)).toBe(moved);
    // The role's last square can take another image of the same role.
    const coin: WorldCell = {image: 'Coin', kind: 'sprite'};
    expect(paintWorldCell(moved, 0, 1, coin, kept).grid[0][1]).toEqual(coin);
    // An image that is not kept can always be removed.
    expect(paintWorldCell(one, 0, 0, null).grid[0][0]).toBeNull();
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

describe('a world of several screens', () => {
  const stone: WorldCell = {image: 'Stone', kind: 'block'};
  const hero: WorldCell = {image: 'Hero', kind: 'sprite'};
  // One screen with a block on the floor's left end and the hero above it.
  const oneScreen = (): World => {
    const world = createEmptyWorld();
    world.grid[9][0] = stone;
    world.grid[8][0] = hero;
    return world;
  };

  it('is one screen until it is made larger', () => {
    expect(worldScreens(oneScreen())).toEqual({wide: 1, tall: 1});
    expect(worldBounds(oneScreen())).toEqual({
      left: 0,
      top: 0,
      right: 400,
      bottom: 400,
    });
  });

  it('grows to the right and upward, keeping the first screen in place', () => {
    const world = resizeWorldScreens(oneScreen(), {wide: 3, tall: 2});
    expect(world.grid).toHaveLength(20);
    expect(world.grid[0]).toHaveLength(30);
    expect(worldScreens(world)).toEqual({wide: 3, tall: 2});
    expect(sceneGridSize(world)).toBe(10);
    // The floor's left end is still the floor's left end.
    expect(world.grid[19][0]).toEqual(stone);
    expect(world.grid[18][0]).toEqual(hero);
    expect(worldBounds(world)).toEqual({
      left: 0,
      top: -400,
      right: 1200,
      bottom: 400,
    });
  });

  it('starts the scene with the first screen at the playfield coordinates', () => {
    const world = resizeWorldScreens(oneScreen(), {wide: 2, tall: 2});
    world.grid[0][19] = stone;
    const code = compileWorldPrelude(world);
    expect(code).toContain('setWorldSize(800, 800);');
    expect(code).toContain(
      'makeNewGroupSprite("Stone", \'walls\', {x: 20, y: 380});'
    );
    expect(code).toContain('makeNewSpriteAnon("Hero", {x: 20, y: 340});');
    // The far corner: the right-hand screen, above the first.
    expect(code).toContain(
      'makeNewGroupSprite("Stone", \'walls\', {x: 780, y: -380});'
    );
    expect(compileWorldPrelude(oneScreen())).not.toContain('setWorldSize');
  });

  it('counts what a smaller size would erase, and erases it', () => {
    const world = resizeWorldScreens(oneScreen(), {wide: 2, tall: 2});
    world.grid[0][0] = stone;
    world.grid[19][15] = stone;
    expect(placementsLostByResize(world, {wide: 2, tall: 2})).toBe(0);
    expect(placementsLostByResize(world, {wide: 1, tall: 2})).toBe(1);
    expect(placementsLostByResize(world, {wide: 1, tall: 1})).toBe(2);
    expect(placementsLostByResize(world, {wide: 3, tall: 3})).toBe(0);

    const back = resizeWorldScreens(world, {wide: 1, tall: 1});
    expect(back).toEqual(oneScreen());
    expect(back.screenCells).toBeUndefined();
  });

  it('keeps its size through a paint and through a level asking for its own', () => {
    const world = resizeWorldScreens(oneScreen(), {wide: 2, tall: 1});
    const painted = paintWorldCell(world, 0, 15, stone);
    expect(painted.screenCells).toBe(10);
    expect(painted.grid[0][15]).toEqual(stone);
    expect(resizeWorld(world, DEFAULT_SCENE_GRID_SIZE)).toBe(world);
  });

  it('is not taken for a legacy world at three screens tall', () => {
    const world = resizeWorldScreens(oneScreen(), {wide: 3, tall: 3});
    expect(world.grid).toHaveLength(30);
    expect(isLegacyWorld(world)).toBe(false);
  });
});
