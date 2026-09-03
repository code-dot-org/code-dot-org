import {
  countWorldCells,
  nextGuideStepIndex,
} from '@cdo/apps/p5lab/spritelab/lab2/guideSteps';
import {GuideStep} from '@cdo/apps/p5lab/spritelab/lab2/types';
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

describe('nextGuideStepIndex', () => {
  const steps: GuideStep[] = [
    {text: 'place blocks'},
    {text: 'place your character', after: {worldBlocks: 3}},
    {text: 'now add a sprite', after: {worldBlocks: 3, worldSprites: 1}},
    {text: 'press Run', after: {tab: 'Code'}},
  ];
  const none = {blocks: 0, sprites: 0};

  it('holds the first step until its successor condition is met', () => {
    expect(
      nextGuideStepIndex(steps, 0, {
        counts: none,
        activeTab: 'World',
        images: 0,
      })
    ).toBe(0);
    expect(
      nextGuideStepIndex(steps, 0, {
        counts: {blocks: 2, sprites: 0},
        activeTab: 'World',
        images: 0,
      })
    ).toBe(0);
  });

  it('advances one step when exactly its condition holds', () => {
    expect(
      nextGuideStepIndex(steps, 0, {
        counts: {blocks: 3, sprites: 0},
        activeTab: 'World',
        images: 0,
      })
    ).toBe(1);
  });

  it('advances through several steps at once when all their conditions hold', () => {
    expect(
      nextGuideStepIndex(steps, 0, {
        counts: {blocks: 5, sprites: 1},
        activeTab: 'Code',
        images: 0,
      })
    ).toBe(3);
  });

  it('requires every clause of a condition', () => {
    // Sprite placed but not enough blocks: the worldBlocks clause of step 2
    // still gates.
    expect(
      nextGuideStepIndex(steps, 1, {
        counts: {blocks: 2, sprites: 1},
        activeTab: 'World',
        images: 0,
      })
    ).toBe(1);
    expect(
      nextGuideStepIndex(steps, 2, {
        counts: {blocks: 3, sprites: 1},
        activeTab: 'World',
        images: 0,
      })
    ).toBe(2);
    expect(
      nextGuideStepIndex(steps, 2, {
        counts: {blocks: 3, sprites: 1},
        activeTab: 'Code',
        images: 0,
      })
    ).toBe(3);
  });

  it('stops at the last step and at a conditionless next step', () => {
    expect(
      nextGuideStepIndex(steps, 3, {
        counts: {blocks: 9, sprites: 9},
        activeTab: 'Code',
        images: 0,
      })
    ).toBe(3);
    const gap: GuideStep[] = [{text: 'a'}, {text: 'b'}];
    expect(
      nextGuideStepIndex(gap, 0, {
        counts: {blocks: 9, sprites: 9},
        activeTab: 'Code',
        images: 0,
      })
    ).toBe(0);
  });

  it('waits for a count of images, and for more sprites in the world', () => {
    const imageSteps: GuideStep[] = [
      {text: 'make a jewel'},
      {text: 'place it', after: {images: 4}},
      {text: 'code it', after: {worldSprites: 2}},
    ];
    expect(
      nextGuideStepIndex(imageSteps, 0, {
        counts: none,
        activeTab: 'Images',
        images: 3,
      })
    ).toBe(0);
    expect(
      nextGuideStepIndex(imageSteps, 0, {
        counts: none,
        activeTab: 'Images',
        images: 4,
      })
    ).toBe(1);
    // The player is already placed, so one sprite is not the new one.
    expect(
      nextGuideStepIndex(imageSteps, 1, {
        counts: {blocks: 7, sprites: 1},
        activeTab: 'World',
        images: 4,
      })
    ).toBe(1);
    expect(
      nextGuideStepIndex(imageSteps, 1, {
        counts: {blocks: 7, sprites: 2},
        activeTab: 'World',
        images: 4,
      })
    ).toBe(2);
  });

  it('handles absent steps', () => {
    expect(
      nextGuideStepIndex(undefined, 0, {
        counts: none,
        activeTab: 'Code',
        images: 0,
      })
    ).toBe(0);
    expect(
      nextGuideStepIndex([], 0, {counts: none, activeTab: 'Code', images: 0})
    ).toBe(0);
  });
});
