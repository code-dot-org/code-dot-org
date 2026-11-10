import * as Blockly from 'blockly/core';
import {afterEach, beforeAll, beforeEach, expect, it} from 'vitest';

import {SpriteLabConnectionChecker} from '../connectionChecker';

const checker = new SpriteLabConnectionChecker();
let workspace: Blockly.Workspace;

beforeAll(() => {
  Blockly.defineBlocksWithJsonArray([
    {type: 'test_sprite', message0: 'sprite', output: 'Sprite'},
    {type: 'test_number', message0: 'number', output: 'Number'},
    {type: 'test_any', message0: 'any', output: null},
    {
      type: 'test_sockets',
      message0: '%1 %2 %3',
      args0: [
        {type: 'input_value', name: 'SPRITE', check: 'Sprite'},
        {type: 'input_value', name: 'NUMBER', check: 'Number'},
        {type: 'input_value', name: 'ANY'},
      ],
      previousStatement: null,
      nextStatement: null,
    },
  ]);
});

beforeEach(() => {
  workspace = new Blockly.Workspace();
});

afterEach(() => {
  workspace.dispose();
});

function fits(output: string, socket: string): boolean {
  const input = workspace.newBlock('test_sockets').getInput(socket);
  return checker.doTypeChecks(
    input!.connection!,
    workspace.newBlock(output).outputConnection!,
  );
}

it('lets a custom type meet only a custom type', () => {
  expect(fits('test_sprite', 'SPRITE')).toBe(true);
  expect(fits('test_any', 'SPRITE')).toBe(false);
  expect(fits('test_sprite', 'ANY')).toBe(false);
});

it('leaves other checks to Blockly', () => {
  expect(fits('test_number', 'NUMBER')).toBe(true);
  expect(fits('test_number', 'ANY')).toBe(true);
  expect(fits('test_any', 'NUMBER')).toBe(true);
  expect(fits('test_sprite', 'NUMBER')).toBe(false);
});

it('joins statements', () => {
  const a = workspace.newBlock('test_sockets');
  const b = workspace.newBlock('test_sockets');
  expect(checker.doTypeChecks(a.nextConnection!, b.previousConnection!)).toBe(
    true,
  );
});
