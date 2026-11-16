import {
  countImagesByType,
  countWorldCells,
  generatedOnLevel,
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

describe('generatedOnLevel', () => {
  const generation = (verdict?: 'up' | 'down') => ({
    imageType: 'sprite',
    prompt: 'A gem',
    ...(verdict && {verdict}),
  });
  const list = (propsByKey: Record<string, unknown>) =>
    ({
      orderedKeys: Object.keys(propsByKey),
      propsByKey,
    } as unknown as RuntimeAnimationList);

  it('counts a new AI-made image, and not one from before or one drawn by hand', () => {
    const images = list({
      old: {name: 'Hero', categories: [], generation: generation('up')},
      made: {name: 'Gem', categories: [], generation: generation()},
      drawn: {name: 'Doodle', categories: []},
    });
    expect(generatedOnLevel(images, new Set(['Hero']), new Set())).toEqual({
      generated: {sprite: 1, background: 0, block: 0},
      rated: false,
    });
  });

  it("counts the level's own image from an earlier visit, with the rating given since", () => {
    // Back on the level: the treasure is changed in place, so its name was
    // already in the project when the level opened.
    const before = new Set(['Hero', 'Gem']);
    const own = new Set(['Gem']);
    const unrated = list({
      hero: {name: 'Hero', categories: [], generation: generation('up')},
      gem: {name: 'Gem', categories: [], generation: generation()},
    });
    expect(generatedOnLevel(unrated, before, own)).toEqual({
      generated: {sprite: 1, background: 0, block: 0},
      rated: false,
    });
    const rated = list({
      hero: {name: 'Hero', categories: [], generation: generation('up')},
      gem: {name: 'Gem', categories: [], generation: generation('down')},
    });
    expect(generatedOnLevel(rated, before, own).rated).toBe(true);
  });
});
