// A root this kind of file cannot hold is an orphan with a reason.
//
// Driven the way `scopedVariableField.test` drives its handler: a bare
// workspace delivers nothing to change listeners in this harness, so the
// cases call the review directly and the event handler with a hand-made
// event. What a drag or a paste raises is Blockly's, and wants a browser.
//
// The block types are registered by mounting the generator once, which is
// how the compile harness gets them too: the palette builder describes the
// blocks, and the generator is what hands them to Blockly.

import {render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';

import {collisionsRule} from '../../rules/stock/collisions';
import {inputRule} from '../../rules/stock/input';
import BlocklyGenerator from '../BlocklyGenerator';
import {buildDomainPalette} from '../domainBlocks';
import type {FileKind} from '../fileKind';
import {
  MISPLACED,
  misplacementOf,
  onMisplacedChange,
  review,
  setFileContext,
  typesOffered,
} from '../misplacedBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

const RULES = [
  parseRuleMeta('rules/collisions', collisionsRule)!,
  parseRuleMeta('rules/input', inputRule)!,
];
registerProjectRules(RULES);

beforeAll(async () => {
  render(<BlocklyGenerator projectRules={RULES} />);
  await new Promise(resolve => setTimeout(resolve, 50));
});

/** A workspace told it is editing a file of `kind`, with that kind's toolbox. */
const fileOf = (kind: FileKind): Blockly.Workspace => {
  const workspace = new Blockly.Workspace();
  const {toolbox} = buildDomainPalette(RULES, {fileKind: kind});
  setFileContext(workspace, {kind, offered: typesOffered(toolbox)});
  return workspace;
};

/** The world's own hat, which an actor file is not offered. */
const WORLD_HAT = 'world_on_Input_IsPressedEvent';
/** An actor's hat, offered to both. */
const ACTOR_HAT = 'world_on_Input_PressesEvent';

describe('typesOffered', () => {
  it('reads a toolbox flat, whether an entry is a name or a block', () => {
    const offered = typesOffered([
      {name: 'A', blocks: ['x', {type: 'y', inputs: {}}]},
      {name: 'B', blocks: [{blocks: ['z']}]},
    ]);
    expect([...offered].sort()).toEqual(['x', 'y', 'z']);
  });
});

describe('a definition with a home elsewhere', () => {
  it('is an orphan in a world, saying where it belongs', () => {
    const world = fileOf('world');
    const actor = world.newBlock('world_actor');

    expect(misplacementOf(actor)).toMatch(/belongs in an actor file/);
    review(actor);
    expect(actor.hasDisabledReason(MISPLACED)).toBe(true);
    expect(actor.isEnabled()).toBe(false);
  });

  it('is at home in its own kind of file', () => {
    const file = fileOf('actor');
    const actor = file.newBlock('world_actor');

    expect(misplacementOf(actor)).toBeUndefined();
    review(actor);
    expect(actor.isEnabled()).toBe(true);
  });

  it('takes its rows down with it, and back up', () => {
    const world = fileOf('world');
    const actor = world.newBlock('world_actor');
    const row = world.newBlock('world_use_trait');
    actor.nextConnection!.connect(row.previousConnection!);

    review(actor);
    expect(row.hasDisabledReason(MISPLACED)).toBe(true);

    // Moved to where it may be: a world file told it is an actor file is the
    // cheapest way to say so without a second workspace.
    setFileContext(world, {
      kind: 'actor',
      offered: typesOffered(
        buildDomainPalette(RULES, {fileKind: 'actor'}).toolbox,
      ),
    });
    expect(actor.hasDisabledReason(MISPLACED)).toBe(false);
    expect(row.hasDisabledReason(MISPLACED)).toBe(false);
  });
});

describe('a root no drawer here offers', () => {
  it('is an orphan in an actor file, for a hat only the world hears', () => {
    const file = fileOf('actor');
    const hat = file.newBlock(WORLD_HAT);

    expect(misplacementOf(hat)).toMatch(/cannot hold this/);
    review(hat);
    expect(hat.hasDisabledReason(MISPLACED)).toBe(true);
  });

  it('is left to the orphan plugin when it is a row, not a root', () => {
    const file = fileOf('world');
    const row = file.newBlock('world_use_trait');

    expect(misplacementOf(row)).toBeUndefined();
  });
});

describe('a hat about `this actor` in a world', () => {
  const hatAbout = (world: Blockly.Workspace, subjectType: string) => {
    const hat = world.newBlock(ACTOR_HAT);
    const subject = world.newBlock(subjectType);
    hat.getInput('ACTOR')!.connection!.connect(subject.outputConnection!);
    return hat;
  };

  it('is an orphan until the socket says which kind', () => {
    const world = fileOf('world');
    const hat = hatAbout(world, 'world_this_actor');

    expect(misplacementOf(hat)).toMatch(/any/);
    review(hat);
    expect(hat.hasDisabledReason(MISPLACED)).toBe(true);
  });

  it('is fine about a kind, which is what a world’s hat is', () => {
    const world = fileOf('world');
    const hat = hatAbout(world, 'world_actor_kind');

    expect(misplacementOf(hat)).toBeUndefined();
  });

  it('is fine about `this actor` in an actor file', () => {
    const file = fileOf('actor');
    const hat = hatAbout(file, 'world_this_actor');

    expect(misplacementOf(hat)).toBeUndefined();
  });
});

describe('the change handler', () => {
  let world: Blockly.Workspace;
  beforeEach(() => {
    world = fileOf('world');
  });

  it('reviews the root a created block belongs to', () => {
    const actor = world.newBlock('world_actor');
    onMisplacedChange({
      type: Blockly.Events.BLOCK_CREATE,
      blockId: actor.id,
      workspaceId: world.id,
    } as unknown as Blockly.Events.Abstract);

    expect(actor.hasDisabledReason(MISPLACED)).toBe(true);
  });

  it('asks again when a child moves, which is how a socket gets fixed', () => {
    const hat = world.newBlock(ACTOR_HAT);
    const me = world.newBlock('world_this_actor');
    hat.getInput('ACTOR')!.connection!.connect(me.outputConnection!);
    review(hat);
    expect(hat.hasDisabledReason(MISPLACED)).toBe(true);

    me.outputConnection!.disconnect();
    const kind = world.newBlock('world_actor_kind');
    hat.getInput('ACTOR')!.connection!.connect(kind.outputConnection!);
    onMisplacedChange({
      type: Blockly.Events.BLOCK_MOVE,
      blockId: kind.id,
      workspaceId: world.id,
    } as unknown as Blockly.Events.Abstract);

    expect(hat.hasDisabledReason(MISPLACED)).toBe(false);
  });

  it('ignores a workspace nobody has told about its file', () => {
    const untold = new Blockly.Workspace();
    const actor = untold.newBlock('world_actor');
    onMisplacedChange({
      type: Blockly.Events.BLOCK_CREATE,
      blockId: actor.id,
      workspaceId: untold.id,
    } as unknown as Blockly.Events.Abstract);

    expect(actor.isEnabled()).toBe(true);
  });
});
