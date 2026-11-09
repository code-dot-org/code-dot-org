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

  it('cuts out a removed block wherever it sits, and keeps what followed it', () => {
    const removed = 'spritelab2_goToExternalScene';
    const source = {
      blocks: {
        blocks: [
          // Under a hat: the title it hid takes its place in the stack.
          {
            type: 'spritelab2_whenRun',
            x: 20,
            y: 20,
            next: {
              block: {
                type: removed,
                fields: {SCENE: 'abc:def'},
                next: {block: {type: 'spritelab2_showTitle'}},
              },
            },
          },
          // At the top of a stack: the block under it becomes the top, in
          // the same place; two in a row both go.
          {
            type: removed,
            x: 200,
            y: 40,
            next: {
              block: {type: removed, next: {block: {type: 'spritelab2_burst'}}},
            },
          },
          // Inside an input, with nothing under it: the input empties.
          {
            type: 'gamelab_checkTouching',
            x: 20,
            y: 300,
            inputs: {DO: {block: {type: removed}}},
          },
          // Alone: the stack goes.
          {type: removed, x: 400, y: 400},
        ],
      },
    };
    expect(migrateBlockTypes(source)).toBe(true);
    const tops = source.blocks.blocks as {
      type: string;
      x?: number;
      y?: number;
      next?: {block: {type: string}};
      inputs?: {DO: {block?: {type: string}}};
    }[];
    expect(tops.map(top => top.type)).toEqual([
      'spritelab2_whenRun',
      'spritelab2_burst',
      'gamelab_checkTouching',
    ]);
    expect(tops[0].next?.block.type).toBe('spritelab2_showTitle');
    expect([tops[1].x, tops[1].y]).toEqual([200, 40]);
    expect(tops[2].inputs?.DO.block).toBeUndefined();
    expect(migrateBlockTypes(source)).toBe(false);
  });
});

describe('migrateScenes worlds', () => {
  const oversize = () =>
    Array.from({length: 30}, () =>
      Array.from({length: 30}, (): {image: string; kind: string} | null => null)
    );

  it('trims a world stored at three times the playfield, in place', () => {
    const grid = oversize();
    grid[9][0] = {image: 'ice', kind: 'block'};
    const scenes = [{id: 'a', name: 'A', source: {}, world: {grid}}];
    expect(migrateScenes(scenes as never)).toBe(true);
    expect(scenes[0].world.grid).toHaveLength(10);
    expect(scenes[0].world.grid[9]).toHaveLength(10);
    expect(scenes[0].world.grid[9][0]).toEqual({image: 'ice', kind: 'block'});
  });

  it('leaves a world at its playfield size alone', () => {
    const world = {grid: [[null]]};
    const scenes = [{id: 'a', name: 'A', source: {}, world}];
    expect(migrateScenes(scenes as never)).toBe(false);
    expect(scenes[0].world).toBe(world);
  });
});
