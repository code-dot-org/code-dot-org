import {
  compileWorldPrelude,
  createEmptyWorld,
  paintWorldCell,
  SCENE_GRID_SIZE,
  WORLD_GRID_SIZE,
} from '@cdo/apps/p5lab/spritelab/lab2/world';

describe('world', () => {
  it('creates an empty world at 3x the scene grid per side', () => {
    const world = createEmptyWorld();
    expect(WORLD_GRID_SIZE).toBe(SCENE_GRID_SIZE * 3);
    expect(world.grid).toHaveLength(WORLD_GRID_SIZE);
    expect(world.grid[0]).toHaveLength(WORLD_GRID_SIZE);
    expect(world.grid.flat().every(cell => cell === null)).toBe(true);
  });

  it('compiles nothing for an empty or missing world', () => {
    expect(compileWorldPrelude(undefined)).toBe('');
    expect(compileWorldPrelude(createEmptyWorld())).toBe('');
  });

  it('spawns blocks before sprites at cell centers, cell-sized', () => {
    const world = createEmptyWorld();
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

  it('runs only the scene-sized top-left corner of the world', () => {
    const world = createEmptyWorld();
    world.grid[SCENE_GRID_SIZE][0] = {image: 'ice', kind: 'block'};
    world.grid[0][SCENE_GRID_SIZE] = {image: 'ice', kind: 'block'};
    expect(compileWorldPrelude(world)).toBe('');
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

  it('quotes image names safely', () => {
    const world = createEmptyWorld();
    world.grid[0][0] = {image: 'say "hi"', kind: 'sprite'};
    expect(compileWorldPrelude(world)).toContain(
      'makeNewSpriteAnon("say \\"hi\\"", {x: 25, y: 25});'
    );
  });
});
