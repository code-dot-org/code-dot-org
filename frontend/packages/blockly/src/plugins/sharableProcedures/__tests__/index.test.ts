import {blocks, isProcedureBlock} from '@blockly/block-shareable-procedures';
import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';

import BaseBlocks from '../../../blocks';
import Driver from '../../../Driver';
import {procedureCallerMutator} from '../../../mutators';
import {PluginType} from '../../../plugins';
import ThrasosRenderer from '../../../renderers/thrasos';
import DefaultTheme from '../../../themes/default';
import type {
  BlockDefinition,
  Environment,
  OldBlockDefinition,
} from '../../../types';
import plugin from '../index';

const shareable = blocks as Record<string, unknown>;
const stock = BaseBlocks as unknown as Record<string, OldBlockDefinition>;

const CALLER_EXTENSIONS = [
  'procedure_caller_get_def_mixin',
  'procedure_caller_var_mixin',
  'procedure_caller_update_shape_mixin',
  'procedure_caller_context_menu_mixin',
  'procedure_caller_onchange_mixin',
  'procedure_callernoreturn_get_def_block_mixin',
];

let driver: Driver | undefined;
let workspace: Blockly.Workspace | undefined;

beforeAll(() => {
  Blockly.setLocale(En as unknown as {[key: string]: string});
});

afterEach(() => {
  workspace?.dispose();
  workspace = undefined;
  driver?.deconstruct();
  driver = undefined;
});

const makeDriver = () =>
  (driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme, [
    plugin,
  ]));

// A definition `foo(x)` and a call to it.
const appendFoo = (into: Blockly.Workspace) => {
  const def = Blockly.serialization.blocks.append(
    {
      type: 'procedures_defnoreturn',
      fields: {NAME: 'foo'},
      extraState: {params: [{name: 'x', id: 'x-id'}]},
    },
    into,
  );
  const call = Blockly.serialization.blocks.append(
    {type: 'procedures_callnoreturn', extraState: {name: 'foo'}},
    into,
  );
  return {def, call};
};

describe('procedures.md: the plugin', () => {
  it('PRC-1: is a global plugin', () => {
    expect(plugin.type).toBe(PluginType.Global);
  });

  it('PRC-2: a Driver given the plugin defines the shareable procedure blocks', () => {
    makeDriver();
    for (const type of Object.keys(shareable)) {
      expect(Blockly.Blocks[type]).toBe(shareable[type]);
    }
  });

  it('PRC-2: replaces a block already defined under a procedure type', () => {
    const [type] = Object.keys(shareable);
    const placeholder = {init() {}};
    Blockly.Blocks[type] = placeholder;
    plugin.initialize();
    expect(Blockly.Blocks[type]).toBe(shareable[type]);
  });

  it('PRC-2: may be initialized repeatedly', () => {
    expect(() => {
      plugin.initialize();
      plugin.initialize();
    }).not.toThrow();
    for (const type of Object.keys(shareable)) {
      expect(Blockly.Blocks[type]).toBe(shareable[type]);
    }
  });

  it('PRC-3, PRC-V1: a call follows its definition through the procedure model', () => {
    makeDriver();
    workspace = new Blockly.Workspace();
    const {def, call} = appendFoo(workspace);
    expect(isProcedureBlock(def)).toBe(true);
    expect(workspace.getProcedureMap().getProcedures()).toHaveLength(1);
    def.setFieldValue('bar', 'NAME');
    expect(call.getFieldValue('NAME')).toBe('bar');
  });

  it('PRC-5: the blocks stay defined after the Driver is deconstructed', () => {
    makeDriver().deconstruct();
    driver = undefined;
    for (const type of Object.keys(shareable)) {
      expect(Blockly.Blocks[type]).toBe(shareable[type]);
    }
  });

  it("PRC-6: registering BaseBlocks' procedure entries puts Blockly's own blocks back", () => {
    makeDriver().setBlocks([stock.procedures_defnoreturn]);
    workspace = new Blockly.Workspace();
    expect(isProcedureBlock(workspace.newBlock('procedures_defnoreturn'))).toBe(
      false,
    );
  });
});

describe('procedures.md: the mutators', () => {
  it("PRC-7, PRC-V2: a lab's call block with procedureCallerMutator calls a definition", () => {
    const call: BlockDefinition = {
      type: 'prc_call',
      message0: '%1 %2',
      args0: [
        {type: 'field_label', name: 'NAME', text: ''},
        {type: 'input_dummy', name: 'TOPROW'},
      ],
      previousStatement: true,
      nextStatement: true,
      tooltip: '',
      extensions: CALLER_EXTENSIONS,
      mutator: procedureCallerMutator,
      generator: {javascript: () => ''},
    };
    makeDriver().setBlocks([call]);
    workspace = new Blockly.Workspace();
    const {def} = appendFoo(workspace);
    const mine = Blockly.serialization.blocks.append(
      {type: 'prc_call', extraState: {name: 'foo'}},
      workspace,
    );
    expect(isProcedureBlock(mine)).toBe(true);
    def.setFieldValue('bar', 'NAME');
    expect(mine.getFieldValue('NAME')).toBe('bar');
  });

  it('PRC-8: the Registry neither registers nor unregisters the mutators', () => {
    makeDriver().setBlocks([
      {
        type: 'prc_mutated',
        message0: '',
        tooltip: '',
        mutator: procedureCallerMutator,
        generator: {javascript: () => ''},
      },
    ]);
    driver?.deconstruct();
    driver = undefined;
    expect(Blockly.Extensions.isRegistered('procedure_caller_mutator')).toBe(
      true,
    );
    expect(Blockly.Extensions.isRegistered('procedure_def_mutator')).toBe(true);
  });
});

describe('procedures.md: saving', () => {
  it('PRC-4, PRC-V3: a definition saved as JSON and loaded again keeps its parameters', () => {
    makeDriver();
    workspace = new Blockly.Workspace();
    appendFoo(workspace);
    const saved = Blockly.serialization.workspaces.save(workspace);
    expect(saved.procedures).toEqual([
      expect.objectContaining({
        name: 'foo',
        parameters: [expect.objectContaining({name: 'x'})],
      }),
    ]);

    const loaded = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(saved, loaded);
    const [model] = loaded.getProcedureMap().getProcedures();
    expect(model.getName()).toBe('foo');
    expect(model.getParameters().map(p => p.getName())).toEqual(['x']);
    loaded.dispose();
  });

  it('PRC-4: registers the serializer again without a warning', () => {
    const warn = vi.spyOn(console, 'warn');
    plugin.initialize();
    plugin.initialize();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
