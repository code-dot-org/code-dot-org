import {
  countWorldCells,
  nextGuideStepIndex,
} from '@cdo/apps/p5lab/spritelab/lab2/guideSteps';
import {SpriteLab2GuideStep} from '@cdo/apps/p5lab/spritelab/lab2/types';
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
  const steps: SpriteLab2GuideStep[] = [
    {text: 'place blocks'},
    {text: 'place your character', after: {worldBlocks: 3}},
    {text: 'now add a sprite', after: {worldBlocks: 3, worldSprite: true}},
    {text: 'press Run', after: {tab: 'Code'}},
  ];
  const none = {blocks: 0, sprites: 0};

  it('holds the first step until its successor condition is met', () => {
    expect(nextGuideStepIndex(steps, 0, none, 'World')).toBe(0);
    expect(nextGuideStepIndex(steps, 0, {blocks: 2, sprites: 0}, 'World')).toBe(
      0
    );
  });

  it('advances one step when exactly its condition holds', () => {
    expect(nextGuideStepIndex(steps, 0, {blocks: 3, sprites: 0}, 'World')).toBe(
      1
    );
  });

  it('advances through several steps at once when all their conditions hold', () => {
    expect(nextGuideStepIndex(steps, 0, {blocks: 5, sprites: 1}, 'Code')).toBe(
      3
    );
  });

  it('requires every clause of a condition', () => {
    // Sprite placed but not enough blocks: the worldBlocks clause of step 2
    // still gates.
    expect(nextGuideStepIndex(steps, 1, {blocks: 2, sprites: 1}, 'World')).toBe(
      1
    );
    expect(nextGuideStepIndex(steps, 2, {blocks: 3, sprites: 1}, 'World')).toBe(
      2
    );
    expect(nextGuideStepIndex(steps, 2, {blocks: 3, sprites: 1}, 'Code')).toBe(
      3
    );
  });

  it('stops at the last step and at a conditionless next step', () => {
    expect(nextGuideStepIndex(steps, 3, {blocks: 9, sprites: 9}, 'Code')).toBe(
      3
    );
    const gap: SpriteLab2GuideStep[] = [{text: 'a'}, {text: 'b'}];
    expect(nextGuideStepIndex(gap, 0, {blocks: 9, sprites: 9}, 'Code')).toBe(0);
  });

  it('handles absent steps', () => {
    expect(nextGuideStepIndex(undefined, 0, none, 'Code')).toBe(0);
    expect(nextGuideStepIndex([], 0, none, 'Code')).toBe(0);
  });
});
