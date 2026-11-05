import {usedBlockTypes} from '@cdo/apps/p5lab/spritelab/lab2/newBlocks';
import {Scene} from '@cdo/apps/p5lab/spritelab/lab2/types';

const scene = (id: string, blocks: unknown[]): Scene => ({
  id,
  name: id,
  source: {blocks: {blocks}} as Scene['source'],
});

describe('usedBlockTypes', () => {
  it('collects real blocks across scenes, inputs and chains, never shadows', () => {
    const scenes = [
      scene('a', [
        {
          type: 'spritelab2_whenRun',
          next: {
            shadow: {type: 'spritelab2_placeholder'},
            block: {
              type: 'gamelab_spriteSay',
              inputs: {
                TEXT: {shadow: {type: 'text'}},
                SPRITE: {block: {type: 'gamelab_allSpritesWithAnimation'}},
              },
            },
          },
        },
      ]),
      scene('b', [
        {type: 'gamelab_atTime', next: {shadow: {type: 'math_number'}}},
      ]),
      {id: 'c', name: 'c'},
    ];
    expect([...usedBlockTypes(scenes)].sort()).toEqual([
      'gamelab_allSpritesWithAnimation',
      'gamelab_atTime',
      'gamelab_spriteSay',
      'spritelab2_whenRun',
    ]);
  });

  it('is empty for a project with no scenes', () => {
    expect(usedBlockTypes([]).size).toBe(0);
  });
});
