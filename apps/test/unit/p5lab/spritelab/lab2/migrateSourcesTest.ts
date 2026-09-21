import {
  migrateAnimationList,
  migrateBlockTypes,
  migrateScenes,
} from '@cdo/apps/p5lab/spritelab/lab2/migrateSources';
import {SerializedAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';

const listWith = (generation: object | undefined): SerializedAnimationList =>
  ({
    orderedKeys: ['k1'],
    propsByKey: {
      k1: {
        name: 'dragon',
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: false,
        frameDelay: 4,
        generation,
      },
    },
  } as unknown as SerializedAnimationList);

const generationOf = (list: SerializedAnimationList) =>
  list.propsByKey.k1.generation as unknown as Record<string, unknown>;

describe('migrateAnimationList', () => {
  it('renames a legacy itemType to imageType, keeping the value', () => {
    const list = listWith({prompt: 'a dragon', itemType: 'block', seed: 7});
    expect(migrateAnimationList(list)).toBe(true);
    expect(generationOf(list)).toEqual({
      prompt: 'a dragon',
      imageType: 'block',
      seed: 7,
    });
  });

  it('leaves an already-migrated animation alone', () => {
    const list = listWith({prompt: 'a dragon', imageType: 'sprite', seed: 7});
    expect(migrateAnimationList(list)).toBe(false);
    expect(generationOf(list)).toEqual({
      prompt: 'a dragon',
      imageType: 'sprite',
      seed: 7,
    });
  });

  it('prefers an existing imageType over a stale itemType', () => {
    const list = listWith({imageType: 'sprite', itemType: 'background'});
    expect(migrateAnimationList(list)).toBe(false);
    expect(generationOf(list).imageType).toBe('sprite');
  });

  it('ignores animations with no generation metadata, and an absent list', () => {
    const list = listWith(undefined);
    expect(migrateAnimationList(list)).toBe(false);
    expect(migrateAnimationList(undefined)).toBe(false);
    expect(migrateAnimationList({orderedKeys: [], propsByKey: {}})).toBe(false);
  });

  it("renames when_run to the lab's own hat, wherever it sits", () => {
    const source = {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            next: {
              block: {
                type: 'gamelab_spriteSay',
                inputs: {SPRITE: {shadow: {type: 'when_run'}}},
              },
            },
          },
          {type: 'gamelab_spriteClicked'},
        ],
      },
    };
    expect(migrateBlockTypes(source)).toBe(true);
    expect(source.blocks.blocks[0].type).toBe('spritelab2_whenRun');
    expect(source.blocks.blocks[0].next?.block.inputs.SPRITE.shadow.type).toBe(
      'spritelab2_whenRun'
    );
    expect(source.blocks.blocks[1].type).toBe('gamelab_spriteClicked');
    expect(migrateBlockTypes(source)).toBe(false);
    expect(migrateBlockTypes(undefined)).toBe(false);
    const scenes = [
      {id: 'a', name: 'A', source: {blocks: {blocks: [{type: 'when_run'}]}}},
      {id: 'b', name: 'B', source: {blocks: {blocks: []}}},
    ];
    expect(migrateScenes(scenes as never)).toBe(true);
    expect(scenes[0].source.blocks.blocks[0].type).toBe('spritelab2_whenRun');
  });
});
