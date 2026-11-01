// A named `add actor` owns its name for its `do` body, as a `let` owns one
// (specs/VARIABLE_OWNERSHIP_PLAN.md).

import {render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {createRef} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';
import {idsInScope} from '../variableScope';

const getter = (id: string) => ({
  type: 'variables_get_Actor',
  fields: {VAR: {id, name: 'ball', type: 'Actor'}},
});

/** `add actor ⟨ball⟩ as ⟨name⟩`, removing what it places, then `after`. */
const named = (id: string, after?: object) => ({
  type: 'world_add_actor',
  fields: {
    ACTOR: 'actors/ball',
    NAMED: 'named',
    VAR: {id, name: 'ball', type: 'Actor'},
  },
  extraState: {named: true},
  inputs: {
    DO: {
      block: {type: 'world_remove_actor', inputs: {ACTOR: {block: getter(id)}}},
    },
  },
  ...(after ? {next: {block: after}} : {}),
});

beforeAll(async () => {
  // Mounting the generator is what defines the lab's blocks.
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} />);
  await new Promise(resolve => setTimeout(resolve, 50));
});

const load = (blocks: object[]) => {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load({blocks: {blocks}}, workspace);
  return workspace;
};

const readers = (workspace: Blockly.Workspace) =>
  workspace.getBlocksByType('variables_get_Actor', true);

describe('a named add actor', () => {
  it('gives its name inside its body only', () => {
    const workspace = load([
      named('one', {
        type: 'world_remove_actor',
        inputs: {ACTOR: {block: getter('one')}},
      }),
    ]);
    const [inside, after] = readers(workspace);
    expect(idsInScope(inside!).has('one')).toBe(true);
    expect(idsInScope(after!).has('one')).toBe(false);
  });

  it('of the same name as another, keeps its own variable when renamed', () => {
    const workspace = load([named('one'), named('two')]);
    const [first] = workspace.getBlocksByType('world_add_actor', false);

    first!.setFieldValue('rock', 'VAR');

    const map = workspace.getVariableMap();
    expect(first!.getFieldValue('VAR')).toBe('one');
    expect(map.getVariableById('one')?.getName()).toBe('rock');
    expect(map.getVariableById('two')?.getName()).toBe('ball');
  });

  it('chosen, makes a variable of its own', () => {
    const workspace = load([named('one')]);
    const spawn = workspace.newBlock('world_add_actor');
    spawn.initModel();
    const self = spawn as unknown as {
      syncNameChoice_: (force: boolean) => void;
      syncPlacedName_: () => void;
    };
    // Offered only under an actor; forced here, as a loaded one is.
    self.syncNameChoice_(true);
    spawn.setFieldValue('named', 'NAMED');
    self.syncPlacedName_();

    const id = spawn.getFieldValue('VAR');
    expect(id).not.toBe('one');
    expect(workspace.getVariableMap().getVariableById(id)?.getName()).toBe(
      'placed',
    );
  });
});
