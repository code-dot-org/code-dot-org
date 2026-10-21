import {
  countImagesByType,
  countWorldCells,
  imageCountsDelta,
} from '@cdo/apps/p5lab/spritelab/lab2/projectCounts';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {WorldCell} from '@cdo/apps/p5lab/spritelab/lab2/world';

const block: WorldCell = {image: 'brick', kind: 'block'};
const sprite: WorldCell = {image: 'cat', kind: 'sprite'};

describe('countWorldCells', () => {
  it('tallies blocks and sprites, skipping empty cells', () => {
    const grid = [
      [block, null, sprite],
      [null, block, null],
    ];
    expect(countWorldCells(grid)).toEqual({blocks: 2, sprites: 1});
  });

  it('treats a missing grid or missing rows as empty', () => {
    expect(countWorldCells(undefined)).toEqual({blocks: 0, sprites: 0});
    expect(
      countWorldCells([undefined, [block]] as unknown as (WorldCell | null)[][])
    ).toEqual({blocks: 1, sprites: 0});
  });
});

describe('imageCountsDelta', () => {
  it('counts only images added since the baseline', () => {
    expect(
      imageCountsDelta(
        {sprite: 2, background: 1, block: 0},
        {sprite: 1, background: 1, block: 0}
      )
    ).toEqual({sprite: 1, background: 0, block: 0});
  });

  it('clamps at zero when images were deleted below the baseline', () => {
    expect(
      imageCountsDelta(
        {sprite: 0, background: 0, block: 0},
        {sprite: 2, background: 1, block: 0}
      )
    ).toEqual({sprite: 0, background: 0, block: 0});
  });
});

describe('countImagesByType', () => {
  it('sorts images into kinds by their categories', () => {
    const list = {
      orderedKeys: ['a', 'b', 'c', 'd'],
      propsByKey: {
        a: {name: 'hero'},
        b: {name: 'forest', categories: ['backgrounds']},
        c: {name: 'brick', categories: ['blocks']},
        d: {name: 'witch', categories: ['category_animals']},
      },
    } as unknown as RuntimeAnimationList;
    expect(countImagesByType(list)).toEqual({
      sprite: 2,
      background: 1,
      block: 1,
    });
  });
});
