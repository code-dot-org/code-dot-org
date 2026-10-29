import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
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
  driver.setBlocks([stock.math_number, stock.text]);
});

afterAll(() => driver.deconstruct());

it("generates a stock block registered through the Driver with Blockly's own code", () => {
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
