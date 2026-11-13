import * as BlocklyCore from 'blockly/core';

import {
  lockAddedBlocks,
  lockBlocks,
  ownToolboxTypes,
  withoutLocks,
} from '@cdo/apps/p5lab/spritelab/lab2/blockLocks';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

interface FakeBlock {
  type: string;
  deletable: boolean;
  shadow?: boolean;
  root?: FakeBlock;
  isShadow(): boolean;
  setDeletable(deletable: boolean): void;
  getRootBlock(): FakeBlock;
}

function fakeBlock(type: string, shadow = false): FakeBlock {
  const block: FakeBlock = {
    type,
    deletable: true,
    shadow,
    isShadow: () => shadow,
    setDeletable(deletable: boolean) {
      block.deletable = deletable;
    },
    getRootBlock: () => block.root ?? block,
  };
  return block;
}

/** A workspace of stacks, each a top block followed by its descendants. */
function fakeWorkspace(stacks: FakeBlock[][]): BlocklyCore.Workspace {
  stacks.forEach(([top, ...rest]) => rest.forEach(b => (b.root = top)));
  return {
    getTopBlocks: () =>
      stacks.map(stack => ({...stack[0], getDescendants: () => stack})),
  } as unknown as BlocklyCore.Workspace;
}

describe('ownToolboxTypes', () => {
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Sprites',
        contents: [
          {kind: 'block', type: 'spritelab2_setAsPlatformPlayer'},
          {kind: 'block', type: 'spritelab2_goToScene'},
        ],
      },
    ],
  } as BlocklyCore.utils.toolbox.ToolboxInfo;
  const earlier = {
    objectives: {
      items: [
        {
          text: 'Set the player',
          check: {
            kind: 'block',
            type: 'spritelab2_setAsPlatformPlayer',
            under: 'spritelab2_whenRun',
          },
        },
      ],
    },
  } as unknown as SpriteLab2LevelProperties;

  it('leaves out the toolbox types an earlier level required', () => {
    expect([...ownToolboxTypes(toolbox, [earlier])]).toEqual([
      'spritelab2_goToScene',
    ]);
  });

  it('keeps every toolbox type when no earlier level required any', () => {
    expect(ownToolboxTypes(toolbox, []).size).toBe(2);
  });
});

describe('lockBlocks', () => {
  it('locks every real block the level does not own, and no shadow', () => {
    const whenRun = fakeBlock('spritelab2_whenRun');
    const say = fakeBlock('gamelab_spriteSay');
    const shadow = fakeBlock('gamelab_allSpritesWithAnimation', true);
    lockBlocks(fakeWorkspace([[whenRun, say, shadow]]));
    expect([whenRun.deletable, say.deletable, shadow.deletable]).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('leaves a block the level owns deletable inside a locked stack', () => {
    const whenRun = fakeBlock('spritelab2_whenRun');
    const say = fakeBlock('gamelab_spriteSay');
    const goTo = fakeBlock('spritelab2_goToScene');
    lockBlocks(
      fakeWorkspace([[whenRun, say, goTo]]),
      block => block.type === 'spritelab2_goToScene'
    );
    expect([whenRun.deletable, say.deletable, goTo.deletable]).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('leaves a whole stack deletable when its root is owned', () => {
    const touch = fakeBlock('gamelab_checkTouching');
    const say = fakeBlock('gamelab_spriteSay');
    lockBlocks(
      fakeWorkspace([[touch, say]]),
      block => block.getRootBlock().type === 'gamelab_checkTouching'
    );
    expect([touch.deletable, say.deletable]).toEqual([true, true]);
  });
});

describe('lockAddedBlocks', () => {
  /** A block as the lock reads it: its tag, what is in its inputs, and
      what is under it. */
  function placed(
    type: string,
    parts: {
      data?: string;
      inputs?: Record<string, FakeBlock>;
      next?: FakeBlock;
    } = {}
  ) {
    return Object.assign(fakeBlock(type), {
      data: parts.data,
      getInputTargetBlock: (name: string) => parts.inputs?.[name] ?? null,
      getNextBlock: () => parts.next ?? null,
    });
  }
  const workspaceOf = (...tops: FakeBlock[]) =>
    ({getTopBlocks: () => tops} as unknown as BlocklyCore.Workspace);

  it('locks the top block the level added, and not what the student built', () => {
    const say = placed('gamelab_spriteSay');
    const event = placed('gamelab_checkTouching', {
      data: 'treasure-touch',
      next: say,
    });
    // An event of the same type the student built: it carries no tag.
    const built = placed('gamelab_checkTouching');
    lockAddedBlocks(workspaceOf(event, built), [
      {type: 'gamelab_checkTouching', data: 'treasure-touch'},
      // A placeholder hung on a stack is not a block the level added.
      {
        attachTo: 'gamelab_checkTouching',
        shadow: {type: 'spritelab2_placeholder'},
      },
    ]);
    expect(event.deletable).toBe(false);
    expect(say.deletable).toBe(true);
    expect(built.deletable).toBe(true);
  });

  it('locks one stack for an entry with no tag, and leaves a second of the type', () => {
    const added = placed('gamelab_atTime');
    const built = placed('gamelab_atTime');
    lockAddedBlocks(workspaceOf(added, built), [{type: 'gamelab_atTime'}]);
    expect([added.deletable, built.deletable]).toEqual([false, true]);
  });

  it('locks the blocks the level added inside and under an added block', () => {
    const sprite = placed('gamelab_allSpritesWithAnimation');
    const studentSay = placed('gamelab_spriteSay');
    const burst = placed('spritelab2_burst', {next: studentSay});
    const event = placed('gamelab_checkTouching', {
      data: 'treasure-touch',
      inputs: {SPRITE1: sprite},
      next: burst,
    });
    lockAddedBlocks(workspaceOf(event), [
      {
        type: 'gamelab_checkTouching',
        data: 'treasure-touch',
        inputs: {SPRITE1: {block: {type: 'gamelab_allSpritesWithAnimation'}}},
        next: {block: {type: 'spritelab2_burst'}},
      },
    ]);
    expect([event.deletable, sprite.deletable, burst.deletable]).toEqual([
      false,
      false,
      false,
    ]);
    // Under the added blocks, the student's own block can still go.
    expect(studentSay.deletable).toBe(true);
  });

  it('leaves a block the student put where an added block was', () => {
    const say = placed('gamelab_spriteSay');
    const event = placed('gamelab_checkTouching', {
      data: 'treasure-touch',
      next: say,
    });
    lockAddedBlocks(workspaceOf(event), [
      {
        type: 'gamelab_checkTouching',
        data: 'treasure-touch',
        next: {block: {type: 'spritelab2_burst'}},
      },
    ]);
    expect(say.deletable).toBe(true);
  });
});

describe('withoutLocks', () => {
  it('drops the locks from every block but when-run, through inputs and next', () => {
    const source = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_whenRun',
            deletable: false,
            movable: false,
            next: {
              block: {
                type: 'gamelab_spriteSay',
                deletable: false,
                movable: false,
                inputs: {
                  SPRITE: {
                    block: {type: 'x', deletable: false, movable: false},
                    shadow: {type: 'gamelab_allSpritesWithAnimation'},
                  },
                },
              },
            },
          },
          {type: 'gamelab_atTime', deletable: false, movable: false},
        ],
      },
    };
    expect(withoutLocks(source)).toEqual({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_whenRun',
            deletable: false,
            movable: false,
            next: {
              block: {
                type: 'gamelab_spriteSay',
                inputs: {
                  SPRITE: {
                    block: {type: 'x'},
                    shadow: {type: 'gamelab_allSpritesWithAnimation'},
                  },
                },
              },
            },
          },
          {type: 'gamelab_atTime'},
        ],
      },
    });
  });

  it('leaves a source with no blocks alone', () => {
    const source = {blocks: {languageVersion: 0}};
    expect(withoutLocks(source)).toBe(source);
  });
});
