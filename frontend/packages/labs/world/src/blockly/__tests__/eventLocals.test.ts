// An event hat owns its values: each hat makes its own variable for each one
// (specs/VARIABLE_OWNERSHIP_PLAN.md, step 4).

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import '../typedVariables';
import {bindParams, type BlockPart} from '../extensions/blockDesigner';
import {
  hatFlyoutBlocks,
  registerEventFlyout,
} from '../extensions/eventActorToolbox';
import {eventLocalsExtension} from '../fields/eventLocal';
import {freshBindings} from '../ownedPaster';
import {eventLocalIds, idsInScope, registerEventLocals} from '../variableScope';

const HAT = 'test_on_hit';
const GET = 'test_read';
const LOCALS = 'world_event_locals';

beforeAll(() => {
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  registerEventLocals(HAT, [
    {name: 'who', type: 'Actor'},
    {name: 'amount', type: 'Number'},
  ]);
  if (!Blockly.Extensions.isRegistered(LOCALS)) {
    Blockly.Extensions.register(
      LOCALS,
      eventLocalsExtension.extension as never,
    );
  }
  Blockly.defineBlocksWithJsonArray([
    {
      type: HAT,
      message0: 'when hit',
      nextStatement: true,
      extensions: [LOCALS],
    },
    {
      type: GET,
      message0: 'read %1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      previousStatement: true,
      nextStatement: true,
    },
  ]);
});

/** A hat with a reader of its `amount` below it. */
const handler = (workspace: Blockly.Workspace) => {
  const hat = workspace.newBlock(HAT);
  hat.initModel();
  const reader = workspace.newBlock(GET);
  reader.setFieldValue(eventLocalIds(hat)[1]!, 'VAR');
  hat.nextConnection!.connect(reader.previousConnection!);
  return {hat, reader};
};

describe('two handlers of one event', () => {
  it('each make a variable of their own for each value', () => {
    const workspace = new Blockly.Workspace();
    const one = handler(workspace);
    const other = handler(workspace);

    const map = workspace.getVariableMap();
    const [whoA, amountA] = eventLocalIds(one.hat);
    const [whoB, amountB] = eventLocalIds(other.hat);
    expect(amountA).not.toBe(amountB);
    expect(whoA).not.toBe(whoB);
    expect(map.getVariableById(amountA!)?.getName()).toBe('amount');
    expect(map.getVariableById(amountB!)?.getType()).toBe('Number');
  });

  it('each read their own', () => {
    const workspace = new Blockly.Workspace();
    const one = handler(workspace);
    const other = handler(workspace);

    const seen = idsInScope(one.reader);
    expect(seen.has(eventLocalIds(one.hat)[1]!)).toBe(true);
    expect(seen.has(eventLocalIds(other.hat)[1]!)).toBe(false);
  });
});

describe('a hat saved and loaded', () => {
  it('keeps its variables, and its readers stay bound', () => {
    const workspace = new Blockly.Workspace();
    const {hat} = handler(workspace);
    const ids = eventLocalIds(hat);

    const loaded = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      loaded,
    );

    const again = loaded.getBlocksByType(HAT, false)[0];
    const reader = loaded.getBlocksByType(GET, false)[0];
    expect(eventLocalIds(again)).toEqual(ids);
    expect(idsInScope(reader).has(ids[1]!)).toBe(true);
  });

  it('renames its variable when the event renamed the value', () => {
    const workspace = new Blockly.Workspace();
    const {hat} = handler(workspace);
    const saved = Blockly.serialization.workspaces.save(workspace);
    const id = eventLocalIds(hat)[1]!;

    registerEventLocals(HAT, [
      {name: 'who', type: 'Actor'},
      {name: 'damage', type: 'Number'},
    ]);
    try {
      const loaded = new Blockly.Workspace();
      Blockly.serialization.workspaces.load(saved, loaded);
      expect(loaded.getVariableMap().getVariableById(id)?.getName()).toBe(
        'damage',
      );
    } finally {
      registerEventLocals(HAT, [
        {name: 'who', type: 'Actor'},
        {name: 'amount', type: 'Number'},
      ]);
    }
  });
});

describe('the `+` on a hat', () => {
  it('offers getters for that hat’s own variables', () => {
    registerEventFlyout('test_hat_flyout', {
      subject: false,
      object: false,
      values: [
        {
          type: 'variables_get_Number',
          fields: {VAR: {name: 'amount', type: 'Number'}},
        },
      ],
    });

    expect(hatFlyoutBlocks('test_hat_flyout', '', at => `id${at}`)).toEqual([
      {
        type: 'variables_get_Number',
        fields: {VAR: {name: 'amount', type: 'Number', id: 'id0'}},
      },
    ]);
  });
});

describe('a pasted hat', () => {
  it('gets fresh variables, and the readers copied with it follow', () => {
    const workspace = new Blockly.Workspace();
    const {hat} = handler(workspace);
    const amount = eventLocalIds(hat)[1]!;

    const saved = Blockly.serialization.blocks.save(hat, {
      doFullSerialization: true,
    })!;
    const {state} = freshBindings(saved, workspace);

    const copied = (state.fields!.LOCAL1 as {id: string}).id;
    expect(copied).not.toBe(amount);
    expect(
      state.next!.block!.fields!.VAR as {id: string} | string as unknown,
    ).toMatchObject({id: copied});
  });
});

describe('a member’s values', () => {
  it('keep a name another binding in the file has', () => {
    const workspace = new Blockly.Workspace();
    const map = workspace.getVariableMap();
    map.createVariable('amount', 'Number');
    const parts: BlockPart[] = [
      {kind: 'label', text: 'heal'},
      {kind: 'param', type: 'number', var: '', name: 'amount'},
    ];

    bindParams(map, parts);

    expect((parts[1] as {name: string}).name).toBe('amount');
  });
});
