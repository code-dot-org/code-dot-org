import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import Agent, {AgentEvent} from './Agent';
import Driver from './Driver';
import ThrasosRenderer from './renderers/thrasos';
import darkTheme from './themes/dark';
import DefaultTheme from './themes/default';
import type {BlocklySerialization, Environment} from './types';

/*
 * Agent injects a real Blockly workspace into a container and wires it to the
 * driver, so its lifecycle (inject → load → theme/event propagation → dispose)
 * only exercises meaningfully in a real browser. Standard blocks need the locale
 * set or their init throws on the unresolved %{BKY_...} messages.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

const PROGRAM: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'text_print',
        inputs: {TEXT: {shadow: {type: 'text', fields: {TEXT: 'hi'}}}},
      },
    ],
  },
};

let container: HTMLDivElement;
let driver: Driver;
let agent: Agent;

beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);

  driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
  agent = new Agent(driver, {}, false, false, false);
});

afterEach(() => {
  agent.deconstruct();
  driver.deconstruct();
  container.remove();
});

describe('Agent', () => {
  it('injects a workspace and emits Injected when given a container', () => {
    const injected = vi.fn();
    agent.on(AgentEvent.Injected, injected);

    expect(agent.workspace).toBeUndefined();
    agent.setContainer(container);

    expect(agent.workspace).toBeDefined();
    expect(container.querySelector('svg.blocklySvg')).not.toBeNull();
    expect(injected).toHaveBeenCalledTimes(1);
    expect(injected.mock.calls[0][0]).toBe(agent.workspace);
    expect(injected.mock.calls[0][1]).toBe(driver.environment);
  });

  it('throws if load is called before injection', () => {
    expect(() => agent.load(PROGRAM)).toThrow(/before workspace was injected/);
  });

  it('loads serialized blocks onto the workspace', () => {
    agent.setContainer(container);
    agent.load(PROGRAM);

    const types = agent.workspace?.getAllBlocks().map(b => b.type) ?? [];
    expect(types).toContain('text_print');
    expect(types).toContain('text');
  });

  it('relays workspace changes as BlocklyEvent', async () => {
    agent.setContainer(container);
    const evented = vi.fn();
    agent.on(AgentEvent.BlocklyEvent, evented);

    agent.load(PROGRAM);

    // Blockly fires its events asynchronously, so wait for the relay.
    await vi.waitFor(() => expect(evented).toHaveBeenCalled());
    expect(evented.mock.calls[0][1]).toBe(driver.environment);
  });

  it('propagates a driver theme change to its workspace', () => {
    agent.setContainer(container);

    driver.setTheme(darkTheme);

    expect(agent.workspace?.getTheme()).toBe(darkTheme.instance);
  });

  it('disposes the workspace on deconstruct', () => {
    agent.setContainer(container);
    expect(agent.workspace).toBeDefined();

    agent.deconstruct();

    expect(agent.workspace).toBeUndefined();
    expect(container.querySelector('svg.blocklySvg')).toBeNull();
  });
});
