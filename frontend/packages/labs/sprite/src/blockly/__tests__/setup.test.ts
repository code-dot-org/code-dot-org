import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import {describe, expect, it, vi} from 'vitest';

import type {BlockDefinition, Extension, Mutator} from '@code-dot-org/blockly';
import type {FieldPlugin} from '@code-dot-org/blockly/plugins';

import {COMMON_BLOCKS, SPRITELAB2_BLOCKS} from '../setup';

vi.mock('../../redux/store', () => ({
  default: {getState: () => ({lab: {}, spriteLab2: {}}), dispatch: vi.fn()},
}));

// A variable field's menu reads Blockly.Msg, which a workspace sets on inject.
Blockly.setLocale(En as unknown as {[key: string]: string});

const ARG_KEYS = ['args0', 'args1', 'args2', 'args3', 'args4'] as const;

// What @code-dot-org/blockly's Registry does for a workspace: register each
// field, extension and mutator the definition carries, and hand Blockly the
// JSON with those references replaced by their names.
function registerBlock(definition: BlockDefinition) {
  const json: Record<string, unknown> = {...definition};
  ARG_KEYS.forEach(key => {
    const args = definition[key] as {type: unknown}[] | undefined;
    json[key] = args?.map(arg => {
      if (typeof arg.type === 'string') {
        return arg;
      }
      const plugin = arg.type as FieldPlugin;
      if (!Blockly.registry.hasItem(Blockly.registry.Type.FIELD, plugin.name)) {
        Blockly.fieldRegistry.register(plugin.name, plugin.field!);
      }
      return {...arg, type: plugin.name};
    });
  });
  json.extensions = definition.extensions?.map(extension => {
    if (typeof extension === 'string') {
      return extension;
    }
    const {name, extension: fn} = extension as Extension;
    if (!Blockly.Extensions.isRegistered(name)) {
      Blockly.Extensions.register(name, fn as unknown as () => void);
    }
    return name;
  });
  if (definition.mutator) {
    const {name, mutator} = definition.mutator as Mutator;
    if (!Blockly.Extensions.isRegistered(name)) {
      Blockly.Extensions.registerMutator(name, mutator);
    }
    json.mutator = name;
  }
  delete json.generator;
  Blockly.common.defineBlocksWithJsonArray([json]);
  javascriptGenerator.forBlock[definition.type] = definition.generator
    .javascript as never;
}

describe('SPRITELAB2_BLOCKS', () => {
  SPRITELAB2_BLOCKS.forEach(registerBlock);

  it('defines every lab-owned block', () => {
    expect(SPRITELAB2_BLOCKS.length).toBeGreaterThan(0);
    SPRITELAB2_BLOCKS.forEach(({type}) =>
      expect(Blockly.Blocks[type]).toBeDefined(),
    );
  });

  SPRITELAB2_BLOCKS.forEach(({type}) => {
    it(`${type} builds, round-trips and generates code`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        const state = Blockly.serialization.blocks.save(block);
        expect(state?.type).toBe(type);
        const copy = Blockly.serialization.blocks.append(state!, workspace);
        expect(copy.type).toBe(type);
        javascriptGenerator.init(workspace);
        const code = javascriptGenerator.blockToCode(block);
        expect(Array.isArray(code) ? code[0] : code).toEqual(
          expect.any(String),
        );
      } finally {
        workspace.dispose();
      }
    });
  });
});

describe('sprite_variables_get', () => {
  it('reads a Sprite variable as the sprite it names', () => {
    const workspace = new Blockly.Workspace();
    try {
      const variables = workspace.getVariableMap();
      const variable = variables.createVariable('mySprite', 'Sprite');
      variables.createVariable('score', '');
      const block = Blockly.serialization.blocks.append(
        {type: 'sprite_variables_get', fields: {VAR: {id: variable.getId()}}},
        workspace,
      );
      const field = block.getField('VAR') as Blockly.FieldVariable;
      const names = field.getOptions(false).map(([name]) => name);
      expect(names).toContain('mySprite');
      expect(names).not.toContain('score');
      expect(block.outputConnection?.getCheck()).toEqual(['Sprite']);
      javascriptGenerator.init(workspace);
      expect(javascriptGenerator.blockToCode(block)).toEqual([
        "{name: 'mySprite'}",
        0,
      ]);
    } finally {
      workspace.dispose();
    }
  });
});

describe('COMMON_BLOCKS', () => {
  it('leaves out when_run and the blocks the lab defines itself', () => {
    const types = COMMON_BLOCKS.map(block => block.type);
    expect(types).toEqual([
      'comment',
      'controls_repeat_simplified',
      'controls_repeat_simplified_dropdown',
      'controls_repeat_dropdown',
      'math_number_dropdown',
      'pick_one',
      'text_join_simple',
      'colour_random',
    ]);
  });
});
