import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type Agent from './Agent';
import Driver, {DriverEvent} from './Driver';
import ThrasosRenderer from './renderers/thrasos';
import darkTheme from './themes/dark';
import DefaultTheme from './themes/default';
import type {BlockDefinition, Environment} from './types';

/*
 * Driver orchestrates block/generator registration, theme state, and agent
 * bookkeeping. None of that needs a rendered workspace — the only methods that
 * touch one (initialize/onInject/uninitialize) read a handful of fields off the
 * agent, so a stub agent and stub workspace exercise them in jsdom.
 */

// A block whose only job is to emit a fixed line of generated code.
const blockDef = {
  type: 'driver_test_block',
  tooltip: '',
  message0: 'go',
  generator: {javascript: () => 'go();\n'},
} as unknown as BlockDefinition;

// Driver's agent methods read only these fields.
const stubAgent = (workspace: Blockly.WorkspaceSvg) =>
  ({
    inline: false,
    hidden: false,
    workspace,
    getToolbox: () => undefined,
  }) as unknown as Agent;

let env: Environment;
let driver: Driver;

beforeEach(() => {
  env = {} as Environment;
  driver = new Driver(env, ThrasosRenderer, DefaultTheme);
});

afterEach(() => driver.deconstruct());

describe('block registration', () => {
  it("binds a block definition's javascript generator", () => {
    driver.setBlocks([blockDef]);

    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('driver_test_block');
    const code = javascriptGenerator.forBlock['driver_test_block'](
      block,
      javascriptGenerator,
    );
    expect(code).toBe('go();\n');
    workspace.dispose();
  });

  it('clears the registered blocks on deconstruct', () => {
    driver.setBlocks([blockDef]);
    expect(driver.blocks).toHaveLength(1);

    driver.deconstruct();

    expect(driver.blocks).toEqual([]);
  });
});

describe('theme', () => {
  it('updates the theme and emits ThemeChanged', () => {
    const changed = vi.fn();
    driver.on(DriverEvent.ThemeChanged, changed);

    driver.setTheme(darkTheme);

    expect(driver.theme).toBe(darkTheme);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('falls back to the default theme when set to undefined', () => {
    driver.setTheme(undefined);
    expect(driver.theme).toBe(DefaultTheme);
  });
});

describe('agent lifecycle', () => {
  it('records the main workspace and emits Injected on inject', () => {
    const workspace = {} as Blockly.WorkspaceSvg;
    const agent = stubAgent(workspace);
    const injected = vi.fn();
    driver.on(DriverEvent.Injected, injected);

    driver.initialize(agent);
    driver.onInject(agent);

    expect(env.mainWorkspace).toBe(workspace);
    expect(injected).toHaveBeenCalledWith(workspace, env);
  });

  it('emits Removed when an agent is uninitialized', () => {
    const workspace = {} as Blockly.WorkspaceSvg;
    const agent = stubAgent(workspace);
    const removed = vi.fn();
    driver.on(DriverEvent.Removed, removed);

    driver.initialize(agent);
    driver.uninitialize(agent);

    expect(removed).toHaveBeenCalledWith(workspace);
  });
});
