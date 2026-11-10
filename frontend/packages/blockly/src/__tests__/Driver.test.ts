import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import Driver, {DriverEvent} from '../Driver';
import type {WorkspaceAgent} from '../Driver';
import {simpleGenerator} from '../generators/simple';
import ThrasosRenderer from '../renderers/thrasos';
import DefaultTheme from '../themes/default';
import type {BlockDefinition, BlockSvg, Environment} from '../types';

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

const stubAgent = (workspace: Blockly.WorkspaceSvg): WorkspaceAgent => ({
  inline: false,
  hidden: false,
  workspace,
  getToolbox: () => undefined,
});

// A second theme, distinct from the default by identity.
const otherTheme = {...DefaultTheme};

let env: Environment;
let driver: Driver;

beforeEach(() => {
  env = {} as Environment;
  driver = new Driver(env, ThrasosRenderer, DefaultTheme);
});

afterEach(() => driver.deconstruct());

describe('definitions.md: block registration', () => {
  it("DEF-13: binds a block definition's javascript generator", () => {
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

  it('DEF-33: clears the registered blocks on deconstruct', () => {
    driver.setBlocks([blockDef]);
    expect(driver.blocks).toHaveLength(1);

    driver.deconstruct();

    expect(driver.blocks).toEqual([]);
  });

  it('DEF-15, DEF-33: clears retained stock-generator backups on deconstruct', () => {
    const localEnv = {} as Environment;
    const localDriver = new Driver(localEnv, ThrasosRenderer, DefaultTheme);

    localDriver.setBlocks([blockDef]);
    // setBlocks records a backup slot for the block's original generator so a
    // block overriding a stock generator can still reach it.
    expect(
      Object.keys(localEnv.originalGeneratorFunctions.javascript),
    ).toContain('driver_test_block');

    localDriver.deconstruct();
    // deconstruct drops those backups instead of letting them accumulate across
    // re-registrations.
    expect(
      Object.keys(localEnv.originalGeneratorFunctions.javascript),
    ).toHaveLength(0);
  });
});

describe('definitions.md: theme', () => {
  it('DEF-32: updates the theme and emits ThemeChanged', () => {
    const changed = vi.fn();
    driver.on(DriverEvent.ThemeChanged, changed);

    driver.setTheme(otherTheme);

    expect(driver.theme).toBe(otherTheme);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('DEF-32: falls back to the default theme when set to undefined', () => {
    driver.setTheme(undefined);
    expect(driver.theme).toBe(DefaultTheme);
  });
});

describe('definitions.md: agent lifecycle', () => {
  it('DEF-17, DEF-30: records the main workspace and emits Injected on inject', () => {
    const workspace = {} as Blockly.WorkspaceSvg;
    const agent = stubAgent(workspace);
    const injected = vi.fn();
    driver.on(DriverEvent.Injected, injected);

    driver.initialize(agent);
    driver.onInject(agent);

    expect(env.mainWorkspace).toBe(workspace);
    expect(injected).toHaveBeenCalledWith(workspace, env);
  });

  it('DEF-31: emits Removed when an agent is uninitialized', () => {
    const workspace = {} as Blockly.WorkspaceSvg;
    const agent = stubAgent(workspace);
    const removed = vi.fn();
    driver.on(DriverEvent.Removed, removed);

    driver.initialize(agent);
    driver.uninitialize(agent);

    expect(removed).toHaveBeenCalledWith(workspace);
  });

  describe('old-style block definitions', () => {
    it('DEF-1, DEF-8, DEF-12: registers a definition that builds itself in init', () => {
      driver.blocks = [
        {
          type: 'driver_test_init_block',
          init(this: Blockly.Block) {
            this.appendValueInput('X').appendField('go');
          },
          generator: {javascript: () => 'go();\n'},
        },
      ] as unknown as BlockDefinition[];
      const workspace = new Blockly.Workspace();
      const block = workspace.newBlock('driver_test_init_block');
      expect(block.inputList.map(input => input.name)).toEqual(['X']);
      javascriptGenerator.init(workspace);
      expect(javascriptGenerator.blockToCode(block)).toBe('go();\n');
      workspace.dispose();
    });
  });
});

describe('definitions.md: generators', () => {
  it('DEF-13: a generator that returns null yields an empty string', () => {
    driver.setBlocks([
      {
        ...blockDef,
        type: 'driver_test_null',
        generator: {javascript: () => null},
      },
    ] as unknown as BlockDefinition[]);
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('driver_test_null');
    expect(
      javascriptGenerator.forBlock['driver_test_null'](
        block,
        javascriptGenerator,
      ),
    ).toBe('');
    workspace.dispose();
  });

  it('DEF-14: the simple generator is the javascript one unless the definition has its own', () => {
    driver.setBlocks([
      blockDef,
      {
        ...blockDef,
        type: 'driver_test_simple',
        generator: {javascript: () => 'run();\n', simple: () => 'show();\n'},
      },
    ] as unknown as BlockDefinition[]);
    expect(simpleGenerator.forBlock['driver_test_block']).toBe(
      javascriptGenerator.forBlock['driver_test_block'],
    );
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('driver_test_simple');
    expect(
      simpleGenerator.forBlock['driver_test_simple'](block, simpleGenerator),
    ).toBe('show();\n');
    workspace.dispose();
  });
});

describe('definitions.md: block accessors', () => {
  it('DEF-10, DEF-19: a block reaches the environment and knows the main workspace', () => {
    driver.setBlocks([blockDef]);
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock(
      'driver_test_block',
    ) as unknown as BlockSvg;
    expect(block.getEnvironment()).toBe(env);
    expect(block.isWithinMainWorkspace()).toBe(false);
    env.mainWorkspace = workspace;
    expect(block.isWithinMainWorkspace()).toBe(true);
    workspace.dispose();
  });

  it('DEF-19: isWithinHiddenWorkspace reads the singular hiddenWorkspace key', () => {
    driver.setBlocks([blockDef]);
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock(
      'driver_test_block',
    ) as unknown as BlockSvg;
    env.hiddenWorkspaces = [workspace];
    expect(block.isWithinHiddenWorkspace()).toBe(false);
    env.hiddenWorkspace = workspace;
    expect(block.isWithinHiddenWorkspace()).toBe(true);
    workspace.dispose();
  });

  it('DEF-19: block.environment is unassigned on a block created fresh', () => {
    driver.setBlocks([blockDef]);
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock(
      'driver_test_block',
    ) as unknown as BlockSvg;
    expect(block.environment).toBeUndefined();
    workspace.dispose();
  });
});

describe('definitions.md: agent classification', () => {
  it('DEF-17, DEF-29, DEF-30: hidden and inline agents land in their environment lists', () => {
    const main = {} as Blockly.WorkspaceSvg;
    const hidden = {} as Blockly.WorkspaceSvg;
    const inline = {} as Blockly.WorkspaceSvg;
    const agents = [
      stubAgent(main),
      {...stubAgent(hidden), hidden: true},
      {...stubAgent(inline), inline: true},
    ];
    agents.forEach(agent => driver.initialize(agent));
    agents.forEach(agent => driver.onInject(agent));

    expect(driver.mainWorkspace).toBe(main);
    expect(env.mainWorkspace).toBe(main);
    expect(env.hiddenWorkspaces).toEqual([hidden]);
    expect(env.embeddedWorkspaces).toEqual([inline]);
    expect(env.inlineWorkspaces).toBeUndefined();
  });

  it('DEF-30: a main agent after the first only emits Injected', () => {
    const first = {} as Blockly.WorkspaceSvg;
    const second = {} as Blockly.WorkspaceSvg;
    const injected = vi.fn();
    driver.on(DriverEvent.Injected, injected);
    const agents = [stubAgent(first), stubAgent(second)];
    agents.forEach(agent => driver.initialize(agent));
    agents.forEach(agent => driver.onInject(agent));

    expect(env.mainWorkspace).toBe(first);
    expect(driver.mainWorkspace).toBe(first);
    expect(injected).toHaveBeenCalledTimes(2);
    expect(injected).toHaveBeenLastCalledWith(second, env);
  });
});
