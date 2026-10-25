// An actor's code rows as roots of its code workspace
// (specs/ACTOR_EDITOR_PLAN.md, step 4c).

import * as Blockly from 'blockly/core';
import {afterEach, beforeAll, describe, expect, it} from 'vitest';

import {ACTOR_CODE_CHOICES, actorCodeChoices, rootCodeRows} from '../codeRoots';

// Shaped as the real ones are where it matters here: a row, with something
// above and below it, and a body.
beforeAll(() => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'world_trait_step',
      message0: 'each frame %1',
      args0: [{type: 'input_statement', name: 'DO'}],
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'world_print',
      message0: 'print',
      previousStatement: null,
      nextStatement: null,
    },
    {type: 'world_actor', message0: 'define actor', nextStatement: null},
  ]);
});

let workspace: Blockly.Workspace;
afterEach(() => workspace.dispose());

const load = (blocks: object[]) => {
  workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    {blocks: {languageVersion: 0, blocks}},
    workspace,
  );
};

describe('a code row at the top of an actor’s code', () => {
  it('is a root: nothing above it or below it', () => {
    const step = {
      type: 'world_trait_step',
      id: 'step',
      inputs: {DO: {block: {type: 'world_print'}}},
    };
    load([step]);
    rootCodeRows(workspace);

    const block = workspace.getBlockById('step')!;
    expect(block.previousConnection).toBeNull();
    expect(block.nextConnection).toBeNull();
    // What is saved is what was loaded: a connection is not a thing a file holds.
    const saved = Blockly.serialization.workspaces.save(workspace) as {
      blocks: {blocks: Array<{type: string; inputs?: object}>};
    };
    expect(saved.blocks.blocks[0]).toMatchObject({
      type: 'world_trait_step',
      inputs: {DO: {block: {type: 'world_print'}}},
    });
  });

  it('is left alone under a define actor, and anywhere else that is not one', () => {
    load([
      {
        type: 'world_actor',
        next: {block: {type: 'world_trait_step', id: 'under'}},
      },
      {type: 'world_print', id: 'loose'},
    ]);
    rootCodeRows(workspace);

    expect(workspace.getBlockById('under')!.previousConnection).not.toBeNull();
    expect(workspace.getBlockById('loose')!.previousConnection).not.toBeNull();
  });

  it('is enabled again, having been greyed as an orphan on its way in', () => {
    load([
      {
        type: 'world_trait_step',
        id: 'step',
        disabledReasons: [Blockly.constants.MANUALLY_DISABLED],
      },
    ]);
    rootCodeRows(workspace);
    expect(workspace.getBlockById('step')!.isEnabled()).toBe(true);
  });

  it('keeps what is chained under it', () => {
    load([
      {
        type: 'world_trait_step',
        id: 'step',
        next: {block: {type: 'world_trait_step', id: 'next'}},
      },
    ]);
    rootCodeRows(workspace);

    const block = workspace.getBlockById('step')!;
    expect(block.previousConnection).toBeNull();
    expect(block.getNextBlock()?.id).toBe('next');
  });
});

describe('a drawing added by the "+"', () => {
  const drawing = (boxed: boolean) =>
    actorCodeChoices(boxed).find(
      choice => choice.type === 'world_define_drawing',
    );

  it('starts as big as the box, in an actor with one', () => {
    // SIMPLE_INTERFACE.md, "Interface Actors": the size is read off the
    // actor, over the 32 the socket keeps for when it is emptied.
    const inputs = drawing(true)?.state?.inputs as Record<
      string,
      {block: {type: string}; shadow: {fields: {NUM: number}}}
    >;
    expect(inputs.WIDTH.block.type).toBe('world_get_Boxed_WidthProperty');
    expect(inputs.HEIGHT.block.type).toBe('world_get_Boxed_HeightProperty');
    expect(inputs.WIDTH.shadow.fields.NUM).toBe(32);
  });

  it('is the block as it always was, in an actor without one', () => {
    expect(actorCodeChoices(false)).toBe(ACTOR_CODE_CHOICES);
    expect(drawing(false)?.state).toBeUndefined();
  });
});
