import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import {blocks as Blocks} from 'blockly/blocks';
import {afterAll, beforeAll, expect, it} from 'vitest';

import Driver from '../../Driver';
import ThrasosRenderer from '../../renderers/thrasos';
import DefaultTheme from '../../themes/default';
import type {Environment, OldBlockDefinition} from '../../types';
import BaseBlocks from '../index';

// The stock blocks are spread in by type, so the map's type does not name them.
const stock = BaseBlocks as unknown as Record<string, OldBlockDefinition>;

let driver: Driver;

beforeAll(() => {
  Blockly.setLocale(En as unknown as {[key: string]: string});
  driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
  driver.setBlocks([stock.math_number, stock.text, stock.lists_create_with]);
});

afterAll(() => driver.deconstruct());

it("CMN-11: generates a stock block registered through the Driver with Blockly's own code", () => {
  const workspace = new Blockly.Workspace();
  javascriptGenerator.init(workspace);
  const number = workspace.newBlock('math_number');
  number.setFieldValue('42', 'NUM');
  const text = workspace.newBlock('text');
  text.setFieldValue('hi', 'TEXT');
  expect(javascriptGenerator.blockToCode(number)).toEqual([
    '42',
    expect.any(Number),
  ]);
  expect(javascriptGenerator.blockToCode(text)).toEqual([
    "'hi'",
    expect.any(Number),
  ]);
  workspace.dispose();
});

it('CMN-11: offers each stock block with every method Blockly gives it', () => {
  for (const [type, definition] of Object.entries(Blocks)) {
    for (const [key, value] of Object.entries(definition as object)) {
      expect([type, key, stock[type][key as keyof OldBlockDefinition]]).toEqual(
        [type, key, value],
      );
    }
  }
});

it('CMN-11: a stock block registered through the Driver keeps its extra state', () => {
  const workspace = new Blockly.Workspace();
  const list = Blockly.serialization.blocks.append(
    {type: 'lists_create_with', extraState: {itemCount: 5}},
    workspace,
  );
  expect(list.getInput('ADD4')).not.toBeNull();
  expect(Blockly.serialization.blocks.save(list)).toMatchObject({
    extraState: {itemCount: 5},
  });
  workspace.dispose();
});
