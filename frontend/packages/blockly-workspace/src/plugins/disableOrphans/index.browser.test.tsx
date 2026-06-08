import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {disableOrphans} from './index';

/*
 * disableOrphans updates enabled state and then fades the block via
 * getSvgRoot().style.opacity, so it needs rendered blocks — headless Chromium,
 * not jsdom. We invoke the handler directly with a minimal move event rather
 * than wiring it as a listener, to keep what triggers it deterministic.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

let container: HTMLDivElement;
let workspace: Blockly.WorkspaceSvg;

beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {});
});

afterEach(() => {
  workspace.dispose();
  container.remove();
});

// Append renders the block into the workspace, giving it an SVG root.
const append = (type: string) =>
  Blockly.serialization.blocks.append({type}, workspace) as Blockly.BlockSvg;

const moveEvent = (block: Blockly.BlockSvg) =>
  ({
    type: Blockly.Events.BLOCK_MOVE,
    blockId: block.id,
    workspaceId: workspace.id,
  }) as unknown as Blockly.Events.Abstract;

describe('disableOrphans', () => {
  it('disables and fades an orphan statement block', () => {
    // text_print has a previous connection but no parent: an orphan.
    const orphan = append('text_print');

    disableOrphans(moveEvent(orphan));

    expect(orphan.isEnabled()).toBe(false);
    expect(orphan.getSvgRoot().style.opacity).toBe('0.5');
  });

  it('re-enables a block attached under an enabled parent', () => {
    const parent = append('text_print');
    const child = append('text_print');
    parent.nextConnection.connect(child.previousConnection);
    // Simulate the stale-disabled state the handler should clear.
    child.setDisabledReason(true, Blockly.constants.MANUALLY_DISABLED);

    disableOrphans(moveEvent(child));

    expect(child.isEnabled()).toBe(true);
    expect(child.getSvgRoot().style.opacity).toBe('');
  });

  it('ignores unrelated event types', () => {
    const orphan = append('text_print');

    disableOrphans({
      type: Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE,
      blockId: orphan.id,
      workspaceId: workspace.id,
    } as unknown as Blockly.Events.Abstract);

    expect(orphan.isEnabled()).toBe(true);
  });
});
