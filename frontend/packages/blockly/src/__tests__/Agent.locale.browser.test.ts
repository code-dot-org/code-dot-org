import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {afterEach, expect, it} from 'vitest';

import Agent from '../Agent';
import Driver from '../Driver';
import ThrasosRenderer from '../renderers/thrasos';
import DefaultTheme from '../themes/default';
import type {Environment} from '../types';

// A module of its own: this test needs Blockly.Msg without a locale, which
// the other browser tests load at import.

let container: HTMLDivElement | undefined;
let agent: Agent | undefined;

afterEach(() => {
  agent?.deconstruct();
  container?.remove();
});

it('loads English when only a plugin message is set', () => {
  for (const key of Object.keys(Blockly.Msg)) {
    delete Blockly.Msg[key];
  }
  Blockly.Msg['BUTTON_LABEL_CLEAR'] = 'Clear';

  container = document.createElement('div');
  container.style.width = '400px';
  container.style.height = '300px';
  document.body.appendChild(container);
  const driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
  agent = new Agent(driver, {}, false, false, false);

  expect(() => agent?.setContainer(container as HTMLDivElement)).not.toThrow();
  expect(Blockly.Msg['WORKSPACE_LABEL_MANY_STACKS']).toBeDefined();
  expect(Blockly.Msg['BUTTON_LABEL_CLEAR']).toBe('Clear');
});
