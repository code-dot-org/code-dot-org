import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {describe, expect, it, vi} from 'vitest';

import type {BlockDefinition, Extension, Mutator} from '@code-dot-org/blockly';
import type {FieldPlugin} from '@code-dot-org/blockly/plugins';

import {SPRITELAB2_BLOCKS} from '../setup';

vi.mock('../../redux/store', () => ({
  default: {getState: () => ({lab: {}, spriteLab2: {}}), dispatch: vi.fn()},
}));

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
