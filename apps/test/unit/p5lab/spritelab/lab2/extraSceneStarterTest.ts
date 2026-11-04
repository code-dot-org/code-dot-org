import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {withStarterBlocks} from '@cdo/apps/p5lab/spritelab/lab2/extraSceneStarter';
import {Scene} from '@cdo/apps/p5lab/spritelab/lab2/types';

const WHEN_RUN = 'spritelab2_whenRun';
const SET_PLAYER = 'spritelab2_setAsPlatformPlayer';
const SAY = 'gamelab_spriteSay';
const TOUCH = 'gamelab_checkTouching';

const starter: WorkspaceSerialization = {
  blocks: {
    blocks: [
      {
        type: WHEN_RUN,
        x: 20,
        y: 20,
        deletable: false,
        movable: false,
        next: {block: {type: SET_PLAYER, id: 'starter-player'}},
      },
    ],
  },
};

type Blocks = {blocks: {blocks: {id?: string; x?: number}[]}};

const chain = (scene: Scene): string[] => {
  const source = scene.source;
  const run =
    source && 'blocks' in source
      ? source.blocks.blocks.find(block => block.type === WHEN_RUN)
      : undefined;
  const types: string[] = [];
  for (let next = run?.next?.block; next; next = next.next?.block) {
    types.push(next.type);
  }
  return types;
};

const scene = (source?: WorkspaceSerialization): Scene => ({
  id: 'second-scene',
  name: 'Scene 2',
  source,
});

describe('withStarterBlocks', () => {
  it('gives a bare when run the starter block, keeping the when run and the rest of the source', () => {
    const before = scene({
      blocks: {
        languageVersion: 0,
        blocks: [{type: WHEN_RUN, x: 5, y: 5, deletable: false}],
      },
    } as WorkspaceSerialization);
    const after = withStarterBlocks(before, starter);
    expect(chain(after)).toEqual([SET_PLAYER]);
    const blocks = after.source as unknown as Blocks & {
      blocks: {languageVersion: number};
    };
    expect(blocks.blocks.blocks[0].x).toBe(5);
    expect(blocks.blocks.languageVersion).toBe(0);
  });

  it("puts the starter block ahead of the student's own, with no id of its own", () => {
    const before = scene({
      blocks: {
        blocks: [{type: WHEN_RUN, next: {block: {type: SAY}}}],
      },
    });
    const after = withStarterBlocks(before, starter);
    expect(chain(after)).toEqual([SET_PLAYER, SAY]);
    const run = (after.source as Blocks).blocks.blocks[0] as {
      next?: {block?: {id?: string}};
    };
    expect(run.next?.block?.id).toBeUndefined();
  });

  it('is the same scene when the block is already there, wherever it is', () => {
    const underRun = scene({
      blocks: {
        blocks: [
          {
            type: WHEN_RUN,
            next: {block: {type: SAY, next: {block: {type: SET_PLAYER}}}},
          },
        ],
      },
    });
    expect(withStarterBlocks(underRun, starter)).toBe(underRun);
    // Moved to another stack by the student.
    const elsewhere = scene({
      blocks: {
        blocks: [
          {type: WHEN_RUN},
          {type: TOUCH, next: {block: {type: SET_PLAYER}}},
        ],
      },
    });
    expect(withStarterBlocks(elsewhere, starter)).toBe(elsewhere);
  });

  it('takes the starter whole for an empty scene, and leaves one with no when run', () => {
    expect(withStarterBlocks(scene({}), starter).source).toBe(starter);
    expect(withStarterBlocks(scene(undefined), starter).source).toBe(starter);
    const loose = scene({blocks: {blocks: [{type: SAY}]}});
    expect(withStarterBlocks(loose, starter)).toBe(loose);
  });

  it('is the same scene when the level gives no starter', () => {
    const before = scene({blocks: {blocks: [{type: WHEN_RUN}]}});
    expect(withStarterBlocks(before, undefined)).toBe(before);
    expect(withStarterBlocks(before, {})).toBe(before);
  });
});
