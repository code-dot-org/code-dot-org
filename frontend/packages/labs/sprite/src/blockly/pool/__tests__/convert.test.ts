// Ported from apps' blockUtils.karma.test.js (interpolateInputs and custom
// generators). Apps called interpolateInputs on a stub block and the
// generators on stub blocks; here each config is converted, registered and
// instantiated on a headless workspace.
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {convertPool, convertPoolBlock} from '../convert';
import type {PoolBlockConfig} from '../types';

type Generator = typeof javascriptGenerator;

const TEST_SPRITES = [
  ['dog', '"dog"'],
  ['cat', '"cat"'],
];

let workspace: Blockly.Workspace;

beforeEach(() => {
  workspace = new Blockly.Workspace();
  javascriptGenerator.init(workspace);
});

afterEach(() => {
  vi.restoreAllMocks();
  workspace.dispose();
});

function register(
  type: string,
  init: () => void,
  generate: (b: Blockly.BlockSvg, g: Generator) => string | [string, number],
): void {
  Blockly.common.defineBlocks({[type]: {init}});
  javascriptGenerator.forBlock[type] = (b, g) =>
    generate(b as Blockly.BlockSvg, g as Generator);
}

/** Converts `config` in the pool 'test' and returns a new block of it. */
function createBlock(config: PoolBlockConfig): Blockly.Block {
  const {type, init, generator} = convertPoolBlock({
    pool: 'test',
    category: 'Test',
    config,
  });
  register(type, init, generator.javascript);
  return workspace.newBlock(type);
}

function code(block: Blockly.Block): string {
  const result = javascriptGenerator.blockToCode(block);
  return Array.isArray(result) ? result[0] : result;
}

function fieldTexts(input: Blockly.Input): string[] {
  return input.fieldRow.map(field => field.getText());
}

function stubValues(values: Record<string, string>) {
  return vi
    .spyOn(javascriptGenerator, 'valueToCode')
    .mockImplementation((_block, name) => values[name]);
}

describe('interpolateInputs', () => {
  it('adds a dropdown input', () => {
    const block = createBlock({
      func: 'interpDropdown',
      blockText: 'create sprite {ANIMATION}',
      args: [{name: 'ANIMATION', options: TEST_SPRITES}],
    });

    expect(block.inputList).toHaveLength(1);
    expect(block.inputList[0]).toBeInstanceOf(Blockly.inputs.EndRowInput);
    expect(block.getField('ANIMATION')).toBeInstanceOf(Blockly.FieldDropdown);
    expect(block.getField('ANIMATION')?.getParentInput()).toBe(
      block.inputList[0],
    );
  });

  it('adds a value input', () => {
    const block = createBlock({
      func: 'interpValue',
      blockText: 'block field{DISTANCE}',
      args: [{name: 'DISTANCE', type: 'Number'}],
    });

    const input = block.getInput('DISTANCE');
    expect(input).toBeInstanceOf(Blockly.inputs.ValueInput);
    expect(input?.connection?.getCheck()).toEqual(['Number']);
    expect(fieldTexts(input!)).toEqual(['block field']);
  });

  it('adds a dummy input', () => {
    const block = createBlock({
      func: 'interpDummy',
      blockText: 'block field',
    });

    expect(block.inputList).toHaveLength(1);
    expect(block.inputList[0]).toBeInstanceOf(Blockly.inputs.EndRowInput);
    expect(fieldTexts(block.inputList[0])).toEqual(['block field']);
  });

  it('adds all three', () => {
    const block = createBlock({
      func: 'interpAllThree',
      blockText: 'dropdown {ANIMATION}value label{DISTANCE}dummy label',
      args: [
        {name: 'ANIMATION', options: TEST_SPRITES},
        {name: 'DISTANCE', type: 'Number'},
      ],
    });

    expect(block.getField('ANIMATION')?.getParentInput()).toBe(
      block.getInput('DISTANCE'),
    );
    expect(fieldTexts(block.getInput('DISTANCE')!)).toContain('value label');
    expect(fieldTexts(block.inputList[1])).toEqual(['dummy label']);
  });

  it('adds labels before and after value input', () => {
    const block = createBlock({
      func: 'interpPrefixSuffix',
      blockText: 'prefix{VALUE}suffix',
      args: [{name: 'VALUE'}],
    });

    expect(block.inputList).toHaveLength(2);
    expect(block.inputList[0]).toBe(block.getInput('VALUE'));
    expect(fieldTexts(block.inputList[0])).toEqual(['prefix']);
    expect(block.inputList[1]).toBeInstanceOf(Blockly.inputs.EndRowInput);
    expect(fieldTexts(block.inputList[1])).toEqual(['suffix']);
  });
});

describe('custom generators', () => {
  describe('assignment', () => {
    it('generates code for a single assignment', () => {
      const block = createBlock({
        func: 'foo',
        blockText: 'set {NAME} to foo()',
        args: [{name: 'NAME', assignment: true, field: true}],
      });
      block.setFieldValue('someVar', 'NAME');

      expect(code(block)).toBe('someVar = foo(someVar);\n');
    });

    it('generates code for a double assignment', () => {
      const block = createBlock({
        func: 'fooTwice',
        blockText: 'set {NAME1} and {NAME2} to fooTwice()',
        args: [
          {name: 'NAME1', assignment: true, field: true},
          {name: 'NAME2', assignment: true, field: true},
        ],
      });
      block.setFieldValue('a', 'NAME1');
      block.setFieldValue('b', 'NAME2');

      expect(code(block)).toBe('a = b = fooTwice(a, b);\n');
    });
  });

  describe('deferred input', () => {
    it('generates code for a deferred input', () => {
      const block = createBlock({
        func: 'yellAt',
        blockText: '{NAME1} yells at {NAME2}',
        args: [
          {name: 'NAME1', defer: true},
          {name: 'NAME2', defer: true},
        ],
      });
      stubValues({NAME1: 'elrond', NAME2: 'isildur'});

      expect(code(block).trim()).toBe(
        [
          'yellAt(function () {',
          '  return elrond;',
          '}, function () {',
          '  return isildur;',
          '});',
        ].join('\n'),
      );
    });
  });

  describe('simpleValue', () => {
    it('generates code for a simple value with return value', () => {
      const block = createBlock({
        simpleValue: true,
        name: 'simpleValue',
        blockText: '{VAL}',
        args: [{name: 'VAL'}],
        returnType: 'String',
      });
      stubValues({VAL: '"a string value"'});

      expect(code(block)).toBe('"a string value"');
    });

    it('generates code for a simple value assignment', () => {
      const block = createBlock({
        simpleValue: true,
        name: 'simpleAssignment',
        blockText: '{VAR} = {VAL}',
        args: [{name: 'VAL'}, {name: 'VAR', assignment: true}],
      });
      stubValues({VAR: 'myVariable', VAL: '"some other value"'});

      expect(code(block).trim()).toBe('myVariable = "some other value";');
    });

    it('generates code for a simple value double assignment', () => {
      const block = createBlock({
        simpleValue: true,
        name: 'simpleDoubleAssignment',
        blockText: '{VAR1} = {VAR2} = {VAL}',
        args: [
          {name: 'VAL'},
          {name: 'VAR1', assignment: true},
          {name: 'VAR2', assignment: true},
        ],
      });
      stubValues({VAR1: 'i', VAR2: 'j', VAL: '"yet another value"'});

      expect(code(block).trim()).toBe('i = j = "yet another value";');
    });

    it('throws for a simpleValue block with too many args', () => {
      expect(() =>
        convertPoolBlock({
          pool: 'test',
          config: {
            simpleValue: true,
            name: 'simpleValueTooMany',
            blockText: '{VAL1} {VAL2}',
            args: [{name: 'VAL1'}, {name: 'VAL2'}],
            returnType: 'String',
          },
        }),
      ).toThrow(Error);
    });

    it('throws for a simple assignment block with too many args', () => {
      expect(() =>
        convertPoolBlock({
          pool: 'test',
          config: {
            simpleValue: true,
            name: 'simpleAssignmentTooMany',
            blockText: '{VAR} = {VAL1} {VAL2}',
            args: [
              {name: 'VAR', assignment: true},
              {name: 'VAL1'},
              {name: 'VAL2'},
            ],
            returnType: 'String',
          },
        }),
      ).toThrow(Error);
    });

    it('reports a malformed block from convertPool', () => {
      const {definitions, errors} = convertPool([
        {
          pool: 'test',
          config: {
            simpleValue: true,
            name: 'simpleValueReported',
            blockText: '{VAL1} {VAL2}',
            args: [{name: 'VAL1'}, {name: 'VAL2'}],
            returnType: 'String',
          },
        },
      ]);
      expect(definitions).toEqual([]);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toBeInstanceOf(Error);
    });
  });

  describe('methodCall', () => {
    it('generates code for a method call', () => {
      const block = createBlock({
        func: 'bark',
        methodCall: true,
        blockText: '{THIS} barks',
        args: [],
      });
      stubValues({THIS: 'myDog'});

      expect(code(block).trim()).toBe('myDog.bark();');
    });

    it('generates code for a method call with specific this object', () => {
      const block = createBlock({
        func: 'sayHi',
        methodCall: true,
        thisObject: 'spot',
        blockText: 'say hi',
        args: [],
      });

      expect(code(block).trim()).toBe('spot.sayHi();');
    });

    it('generates code for a object property', () => {
      const block = createBlock({
        name: 'getToy',
        expression: 'favoriteToy',
        methodCall: true,
        blockText: "{THIS}'s favorite toy",
        args: [],
        returnType: 'String',
      });
      stubValues({THIS: 'myDog'});

      expect(code(block).trim()).toBe('myDog.favoriteToy');
    });
  });

  describe('eventBlock', () => {
    // Apps stubbed blockToCode for the handler; here a real block hangs below.
    it('generates code for an event block', () => {
      // Installs the generation that leaves the handler to the event block.
      convertPool([]);
      const event = createBlock({
        func: 'whenJump',
        blockText: 'when jump',
        args: [],
        eventBlock: true,
      });
      const handler = createBlock({
        func: 'someHandlerCode',
        blockText: 'handle',
        args: [],
      });
      event.nextConnection!.connect(handler.previousConnection!);

      expect(code(event).trim()).toBe(
        ['whenJump(function () {', '  someHandlerCode();', '});'].join('\n'),
      );
    });
  });

  describe('expression blocks', () => {
    it('generates code for an expression block', () => {
      const block = createBlock({
        name: 'useStrict',
        expression: 'use strict;',
        blockText: 'run this program in strict mode',
        args: [],
      });

      expect(code(block).trim()).toBe('use strict;');
    });

    it('generates code for an expression block with a return value', () => {
      const block = createBlock({
        name: 'window',
        expression: 'window',
        blockText: 'window object',
        args: [],
        returnType: 'Object',
      });

      expect(code(block).trim()).toBe('window');
    });
  });

  describe('custom inputs', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('generates code for a statement input', () => {
      const block = createBlock({
        func: 'runThisCallback',
        blockText: 'run this callback {STATEMENT}',
        args: [{name: 'STATEMENT', statement: true}],
      });
      vi.spyOn(javascriptGenerator, 'statementToCode').mockReturnValue(
        `  console.log("I'm in a callback!");\n`,
      );

      expect(code(block).trim()).toBe(
        [
          'runThisCallback(function () {',
          `  console.log("I'm in a callback!");`,
          '});',
        ].join('\n'),
      );
    });

    it('generates no code for an empty input', () => {
      const block = createBlock({
        func: 'skyscraper',
        blockText: "woo {EMTPY} it's a skyscraper",
        args: [{name: 'EMTPY', customInput: 'dummy'}],
      });

      expect(code(block).trim()).toBe('skyscraper();');
    });

    it('generates code for a dropdown input', () => {
      // Apps' option value was the number 7; Blockly's dropdown takes strings.
      const block = createBlock({
        func: 'selectOne',
        blockText: 'select one of {DROPDOWN}',
        args: [{name: 'DROPDOWN', options: [['someOption', '7']]}],
      });

      expect(code(block).trim()).toBe('selectOne(7);');
    });

    it('generates code for a field input', () => {
      const block = createBlock({
        func: 'processValue',
        blockText: 'do something with {INPUT}',
        args: [{name: 'INPUT', field: true}],
      });
      block.setFieldValue('42', 'INPUT');

      expect(code(block).trim()).toBe('processValue(42);');
    });

    it('wraps field input value in quotes if it is a string type', () => {
      const block = createBlock({
        func: 'processStringValue',
        blockText: 'do something with string {INPUT}',
        args: [{name: 'INPUT', field: true, type: 'String'}],
      });
      block.setFieldValue('some input', 'INPUT');

      expect(code(block).trim()).toBe('processStringValue("some input");');
    });

    it('escapes quotes in string field inputs', () => {
      const block = createBlock({
        func: 'processAnotherStringValue',
        blockText: 'do something with another string {INPUT}',
        args: [{name: 'INPUT', field: true, type: 'String'}],
      });
      block.setFieldValue('some input with a "quote" in it', 'INPUT');

      expect(code(block).trim()).toBe(
        'processAnotherStringValue("some input with a \\"quote\\" in it");',
      );
    });

    it('does not throw when there are extra args', () => {
      const block = createBlock({
        name: 'extraArgsTest',
        expression: 'extraArgsTest;',
        blockText: 'run this program in strict mode',
        args: [{name: 'EXTRA'}],
      });

      expect(code(block).trim()).toBe('extraArgsTest;');
    });
  });
});
