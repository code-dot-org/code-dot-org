// The block an actor's own block is written under, on its member page
// (specs/ACTOR_BLOCKS_PLAN.md, step 6).
//
// Built headless from the real mutator and extension, as `bodyOwner.test`
// builds its head: a press dragging a getter out is the browser's to check.

import {beforeAll, describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {memberHead} from '../memberHead';
import {MEMBER_HEAD, MEMBER_HEAD_ID} from '../pageHeads';
import {idsInScope} from '../variableScope';

type Head = Blockly.Block & {fill_: () => void};

beforeAll(() => {
  const {mutator, extensions} = memberHead as unknown as {
    mutator: {name: string; mutator: object};
    extensions: Array<{name: string; extension: () => void}>;
  };
  Blockly.Extensions.registerMutator(mutator.name, mutator.mutator);
  Blockly.Extensions.register(extensions[0].name, extensions[0].extension);
  Blockly.defineBlocksWithJsonArray([
    {
      type: MEMBER_HEAD,
      message0: '',
      nextStatement: null,
      mutator: mutator.name,
      extensions: [extensions[0].name],
    },
    // A stand-in getter: a variable field wants the editor's messages.
    {
      type: 'variables_get_Number',
      message0: '%1',
      args0: [{type: 'field_input', name: 'VAR'}],
      output: 'Number',
    },
    {
      type: 'world_note',
      message0: 'note',
      previousStatement: null,
      nextStatement: null,
    },
  ]);
});

const healBy = [
  {kind: 'label', text: 'heal by'},
  {kind: 'param', type: 'number', var: 'v1', name: 'amount'},
  {kind: 'row'},
  {kind: 'label', text: 'now'},
];

/** A workspace holding the head as the page writes it, and filled. */
function opened(parts: object[] = healBy) {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: MEMBER_HEAD,
            id: MEMBER_HEAD_ID,
            extraState: {parts},
            next: {block: {type: 'world_note', id: 'row1'}},
          },
        ],
      },
      variables: [{id: 'v1', name: 'amount', type: 'Number'}],
    } as never,
    workspace,
  );
  const head = workspace.getBlockById(MEMBER_HEAD_ID) as Head;
  head.fill_();
  return {workspace, head};
}

const shape = (head: Blockly.Block) =>
  head.inputList.map(input =>
    [
      ...input.fieldRow.map(field => field.getText()),
      input.type === Blockly.inputs.inputTypes.END_ROW
        ? '|'
        : input.connection
          ? `[${input.connection.targetBlock()?.type ?? ''}]`
          : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

describe('a member head', () => {
  it('is the block being made, a getter fixed in each socket', () => {
    const {head} = opened();
    expect(shape(head)).toEqual(['heal by [variables_get_Number]', '|', 'now']);
    const getter = head.getInputTargetBlock('VALUE0')!;
    expect(getter.getFieldValue('VAR')).toBe('v1');
    expect(getter.isMovable()).toBe(false);
    expect(getter.isDeletable()).toBe(false);
    expect(head.isMovable()).toBe(false);
    expect(head.isDeletable()).toBe(false);
  });

  it('carries its values into what hangs below it', () => {
    const {workspace} = opened();
    expect(idsInScope(workspace.getBlockById('row1')!).has('v1')).toBe(true);
  });

  it('binds a new value to a variable, and a renamed one renames it', () => {
    const {head, workspace} = opened();
    (head as unknown as {loadExtraState: (s: object) => void}).loadExtraState({
      parts: [
        {kind: 'label', text: 'heal by'},
        {kind: 'param', type: 'number', var: 'v1', name: 'health'},
        {kind: 'param', type: 'number', var: '', name: 'times'},
      ],
    });
    head.fill_();

    const parts = (
      head as unknown as {
        saveExtraState: () => {parts: Array<{var?: string; name?: string}>};
      }
    ).saveExtraState().parts;
    expect(workspace.getVariableMap().getVariableById('v1')?.getName()).toBe(
      'health',
    );
    expect(parts[2].var).toBeTruthy();
    expect(
      workspace.getVariableMap().getVariableById(parts[2].var!)?.getName(),
    ).toBe('times');
    expect(head.getInputTargetBlock('VALUE1')?.getFieldValue('VAR')).toBe(
      parts[2].var,
    );
  });

  it('loads back with its getters, and no second set beside them', () => {
    const {workspace} = opened();
    const saved = Blockly.serialization.workspaces.save(workspace);
    const again = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(saved, again);
    (again.getBlockById(MEMBER_HEAD_ID) as Head).fill_();

    expect(again.getTopBlocks(false)).toHaveLength(1);
    expect(
      again
        .getAllBlocks(false)
        .filter(one => one.type === 'variables_get_Number'),
    ).toHaveLength(1);
  });
});
