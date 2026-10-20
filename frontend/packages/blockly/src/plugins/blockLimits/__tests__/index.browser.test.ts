import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, describe, expect, it, vi} from 'vitest';

import DefaultTheme from '../../../themes/default';
import blockLimits from '../index';

Blockly.setLocale(En as unknown as {[key: string]: string});

let container: HTMLDivElement | undefined;
let workspace: Blockly.WorkspaceSvg | undefined;
let instance: {dispose(): void} | undefined;

afterEach(() => {
  instance?.dispose();
  workspace?.dispose();
  container?.remove();
  instance = workspace = container = undefined;
});

const inject = (toolbox: Blockly.utils.toolbox.ToolboxDefinition) => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {toolbox});
  instance = new blockLimits.plugin(workspace, DefaultTheme) as {
    dispose(): void;
  };
  return workspace;
};

// The text of each limit bubble in the flyout, in flyout order.
const bubbles = (ws: Blockly.WorkspaceSvg) =>
  Array.from(
    ws.getFlyout()!.getWorkspace().getParentSvg().querySelectorAll('g > text'),
  )
    .filter(text => text.previousElementSibling?.tagName === 'rect')
    .map(text => text.textContent);

const PRINT_LIMIT_2: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'flyoutToolbox',
  contents: [{kind: 'block', type: 'text_print', extraState: {limit: 2}}],
};

describe('plugins.md: the blockLimits plugin', () => {
  it('PLG-17, PLG-V6: draws the remaining count once the flyout is laid out', async () => {
    const ws = inject(PRINT_LIMIT_2);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['2']));
  });

  it('PLG-17, PLG-V6: counts an enabled block once it moves', async () => {
    const ws = inject(PRINT_LIMIT_2);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['2']));
    const block = Blockly.serialization.blocks.append(
      {type: 'text_print'},
      ws,
    ) as Blockly.BlockSvg;
    block.moveBy(10, 10);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['1']));
  });

  it('PLG-17: does not count a disabled block', async () => {
    const ws = inject(PRINT_LIMIT_2);
    const block = Blockly.serialization.blocks.append(
      {type: 'text_print'},
      ws,
    ) as Blockly.BlockSvg;
    block.setDisabledReason(true, 'test');
    block.moveBy(10, 10);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['2']));
  });

  it('PLG-17: counts a block when it is created', async () => {
    const ws = inject(PRINT_LIMIT_2);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['2']));
    Blockly.serialization.blocks.append({type: 'text_print'}, ws);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['1']));
  });

  it('PLG-17: stops counting a block when it is deleted', async () => {
    const ws = inject(PRINT_LIMIT_2);
    const block = Blockly.serialization.blocks.append(
      {type: 'text_print'},
      ws,
    ) as Blockly.BlockSvg;
    block.moveBy(10, 10);
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['1']));
    block.dispose();
    await vi.waitFor(() => expect(bubbles(ws)).toEqual(['2']));
  });
});
