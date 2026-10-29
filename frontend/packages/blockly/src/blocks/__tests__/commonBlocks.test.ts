import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import Driver from '../../Driver';
import {plugin as fieldColourPlugin} from '../../fields/fieldColour';
import ThrasosRenderer from '../../renderers/thrasos';
import DefaultTheme from '../../themes/default';
import type {Environment} from '../../types';
import BaseBlocks, {nonnegativeIntegerValidator} from '../index';

// Apps' blocksCommon blocks, registered the way a workspace registers them.
const COMMON = [
  BaseBlocks.comment,
  BaseBlocks.controls_repeat_simplified,
  BaseBlocks.controls_repeat_simplified_dropdown,
  BaseBlocks.controls_repeat_dropdown,
  BaseBlocks.math_number_dropdown,
  BaseBlocks.pick_one,
  BaseBlocks.category,
  BaseBlocks.custom_category,
  BaseBlocks.text_join_simple,
  BaseBlocks.colour_random,
];

let driver: Driver;
let workspace: Blockly.Workspace;

beforeAll(() => {
  Blockly.setLocale(En as unknown as {[key: string]: string});
  driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
  driver.setBlocks(COMMON);
});

afterAll(() => driver.deconstruct());

// Loads one block from JSON, round-trips it, and returns the reloaded code.
function roundTrip(state: Blockly.serialization.blocks.State) {
  workspace = new Blockly.Workspace();
  const block = Blockly.serialization.blocks.append(state, workspace);
  const saved = Blockly.serialization.blocks.save(block, {
    addCoordinates: true,
  });
  block.dispose();
  const reloaded = Blockly.serialization.blocks.append(
    saved as Blockly.serialization.blocks.State,
    workspace,
  );
  const code = javascriptGenerator.workspaceToCode(workspace);
  return {block: reloaded, saved, code};
}

function codeFor(state: Blockly.serialization.blocks.State) {
  const other = new Blockly.Workspace();
  Blockly.serialization.blocks.append(state, other);
  const code = javascriptGenerator.workspaceToCode(other);
  other.dispose();
  return code;
}

describe('blocksCommon blocks', () => {
  it('builds every block', () => {
    workspace = new Blockly.Workspace();
    for (const {type} of COMMON) {
      expect(workspace.newBlock(type).type).toBe(type);
    }
    workspace.dispose();
  });

  it('comment names its field TEXT and generates a line comment', () => {
    const {block, code} = roundTrip({
      type: 'comment',
      fields: {TEXT: 'hello'},
    });
    expect(block.getFieldValue('TEXT')).toBe('hello');
    expect(code).toBe('// hello\n');
    workspace.dispose();
  });

  it('controls_repeat_simplified repeats as controls_repeat does', () => {
    const {block, code} = roundTrip({
      type: 'controls_repeat_simplified',
      fields: {TIMES: '4'},
    });
    expect(block.getFieldValue('TIMES')).toBe('4');
    expect(block.getInput('DO')?.fieldRow).toEqual([]);
    expect(code).toBe(codeFor({type: 'controls_repeat', fields: {TIMES: 4}}));
    expect(code).toBe('for (var count = 0; count < 4; count++) {\n}\n');
    workspace.dispose();
  });

  it('controls_repeat_simplified keeps only nonnegative integers', () => {
    expect(nonnegativeIntegerValidator('3.7')).toBe('3');
    expect(nonnegativeIntegerValidator('-2')).toBe('0');
    expect(nonnegativeIntegerValidator('1,000')).toBe('1000');
    expect(nonnegativeIntegerValidator('1O')).toBe('10');
    expect(nonnegativeIntegerValidator('')).toBe('0');
    expect(nonnegativeIntegerValidator('abc')).toBeNull();

    workspace = new Blockly.Workspace();
    const block = workspace.newBlock('controls_repeat_simplified');
    expect(block.getFieldValue('TIMES')).toBe('10');
    block.setFieldValue('-5', 'TIMES');
    expect(block.getFieldValue('TIMES')).toBe('0');
    workspace.dispose();
  });

  for (const type of [
    'controls_repeat_simplified_dropdown',
    'controls_repeat_dropdown',
  ]) {
    it(`${type} takes its counts from config and repeats as controls_repeat does`, () => {
      const {block, saved, code} = roundTrip({
        type,
        fields: {
          TIMES:
            '<field xmlns="https://developers.google.com/blockly/xml" name="TIMES" config="2-4">3</field>',
        },
      });
      expect(block.getFieldValue('TIMES')).toBe('3');
      expect(saved?.fields?.TIMES).toContain('config="2-4"');
      expect(code).toBe('for (var count = 0; count < 3; count++) {\n}\n');
      workspace.dispose();
    });
  }

  it('controls_repeat_dropdown generates its body', () => {
    const {code} = roundTrip({
      type: 'controls_repeat_dropdown',
      fields: {
        TIMES:
          '<field xmlns="https://developers.google.com/blockly/xml" name="TIMES" config="5">5</field>',
      },
      inputs: {DO: {block: {type: 'comment', fields: {TEXT: 'x'}}}},
    });
    expect(code).toBe('for (var count = 0; count < 5; count++) {\n  // x\n}\n');
    workspace.dispose();
  });

  it('math_number_dropdown outputs a Number as math_number does', () => {
    workspace = new Blockly.Workspace();
    const block = Blockly.serialization.blocks.append(
      {
        type: 'math_number_dropdown',
        fields: {
          NUM: '<field xmlns="https://developers.google.com/blockly/xml" name="NUM" config="1,5,10">5</field>',
        },
      },
      workspace,
    );
    expect(block.outputConnection?.getCheck()).toEqual(['Number']);
    expect(javascriptGenerator.blockToCode(block)).toEqual(['5', 0]);
    workspace.dispose();
  });

  it('math_number_dropdown accepts ???', () => {
    workspace = new Blockly.Workspace();
    const block = workspace.newBlock('math_number_dropdown');
    block.setFieldValue('???', 'NUM');
    expect(block.getFieldValue('NUM')).toBe('???');
    workspace.dispose();
  });

  it('level-builder marker blocks generate a blank line', () => {
    for (const state of [
      {type: 'pick_one'},
      {type: 'category', fields: {CATEGORY: 'Sprites'}},
      {type: 'custom_category', fields: {CUSTOM: 'Behavior'}},
    ] as {type: string; fields?: {[name: string]: string}}[]) {
      const {block} = roundTrip(state);
      for (const [name, value] of Object.entries(state.fields ?? {})) {
        expect(block.getFieldValue(name)).toBe(value);
      }
      javascriptGenerator.init(workspace);
      expect(javascriptGenerator.blockToCode(block)).toBe('\n');
      workspace.dispose();
    }
  });

  it('custom_category offers the auto-populated categories', () => {
    workspace = new Blockly.Workspace();
    const field = workspace
      .newBlock('custom_category')
      .getField('CUSTOM') as Blockly.FieldDropdown;
    expect(field.getOptions().map(([, value]) => value)).toEqual([
      'VARIABLE',
      'PROCEDURE',
      'Behavior',
      'Location',
    ]);
    workspace.dispose();
  });

  it('text_join_simple is text_join', () => {
    const state = {
      extraState: {itemCount: 2},
      inputs: {
        ADD0: {block: {type: 'text', fields: {TEXT: 'a'}}},
        ADD1: {block: {type: 'text', fields: {TEXT: 'b'}}},
      },
    };
    const {block, code} = roundTrip({type: 'text_join_simple', ...state});
    expect(block.getInput('ADD1')).toBeTruthy();
    expect(code).toBe(codeFor({type: 'text_join', ...state}));
    expect(code).toBe("'a' + 'b';\n");
    workspace.dispose();
  });

  it('colour_random says color and generates a random colour', () => {
    const {block, code} = roundTrip({type: 'colour_random'});
    expect(block.toString()).toBe('random color');
    expect(block.outputConnection?.getCheck()).toEqual(['Colour']);
    expect(code).toContain('colourRandom();\n');
    expect(code).toContain('function colourRandom() {');
    workspace.dispose();
  });

  it('colour_random survives the colour field plugin', () => {
    fieldColourPlugin.initialize?.();
    workspace = new Blockly.Workspace();
    expect(workspace.newBlock('colour_random').toString()).toBe('random color');
    expect(workspace.newBlock('colour_picker').type).toBe('colour_picker');
    workspace.dispose();
  });
});
