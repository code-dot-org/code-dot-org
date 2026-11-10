import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import Agent, {AgentEvent} from '../Agent';
import Driver from '../Driver';
import ThrasosRenderer from '../renderers/thrasos';
import {positionBlocksOnWorkspace} from '../serialization';
import DefaultTheme from '../themes/default';
import type {BlocklySerialization, Environment, Theme} from '../types';

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

const otherTheme = {
  ...DefaultTheme,
  instance: Blockly.Theme.defineTheme('agent-test-other', {
    name: 'agent-test-other',
    base: Blockly.Themes.Classic,
  }),
} as Theme;

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

describe('workspace.md: Agent', () => {
  it('WS-3, WS-4: injects a workspace and emits Injected when given a container', () => {
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

  it('WS-9: throws if load is called before injection', () => {
    expect(() => agent.load(PROGRAM)).toThrow(/before workspace was injected/);
  });

  it('WS-9: loads serialized blocks onto the workspace', () => {
    agent.setContainer(container);
    agent.load(PROGRAM);

    const types = agent.workspace?.getAllBlocks().map(b => b.type) ?? [];
    expect(types).toContain('text_print');
    expect(types).toContain('text');
  });

  it('WS-4: relays workspace changes as BlocklyEvent', async () => {
    agent.setContainer(container);
    const evented = vi.fn();
    agent.on(AgentEvent.BlocklyEvent, evented);

    agent.load(PROGRAM);

    // Blockly fires its events asynchronously, so wait for the relay.
    await vi.waitFor(() => expect(evented).toHaveBeenCalled());
    expect(evented.mock.calls[0][1]).toBe(driver.environment);
  });

  it('WS-6: propagates a driver theme change to its workspace', () => {
    agent.setContainer(container);

    driver.setTheme(otherTheme);

    expect(agent.workspace?.getTheme()).toBe(otherTheme.instance);
  });

  it('WS-9, LAY-12: positionBlocks starts as the collision layout', () => {
    expect(agent.positionBlocks).toBe(positionBlocksOnWorkspace);
  });

  it('WS-9: arranges loaded blocks with positionBlocks, when set', () => {
    agent.setContainer(container);
    agent.load(PROGRAM);
    const positionBlocks = vi.fn();
    agent.positionBlocks = positionBlocks;

    agent.load(PROGRAM);

    expect(positionBlocks).toHaveBeenCalledTimes(1);
    expect(positionBlocks).toHaveBeenCalledWith(agent.workspace);
  });

  it('WS-9, WS-10: an inline load draws a sized copy and does not position', () => {
    const span = document.createElement('span');
    document.body.appendChild(span);
    const inline = new Agent(driver, {}, true, false, false);
    const positionBlocks = vi.fn();
    inline.positionBlocks = positionBlocks;
    try {
      inline.setContainer(span);
      inline.load(PROGRAM);

      expect(positionBlocks).not.toHaveBeenCalled();
      const copies = span.querySelectorAll(':scope > svg');
      expect(copies).toHaveLength(1);
      const svg = copies[0] as SVGElement;
      expect(parseFloat(svg.style.width)).toBeGreaterThanOrEqual(30);
      expect(parseFloat(svg.style.height)).toBeGreaterThanOrEqual(30);
      expect(svg.querySelector('.blocklyMainBackground')).toBeNull();
      // The live workspace is no longer in the document.
      expect(inline.workspace?.getInjectionDiv().isConnected).toBe(false);
    } finally {
      inline.deconstruct();
      span.remove();
    }
  });

  it('WS-8, WS-11: disposes the workspace on deconstruct', () => {
    agent.setContainer(container);
    expect(agent.workspace).toBeDefined();

    agent.deconstruct();

    expect(agent.workspace).toBeUndefined();
    expect(container.querySelector('svg.blocklySvg')).toBeNull();
  });
});
