import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {BlockTypes} from '../../constants';

import {disableOrphanBlocks, disableOrphans} from './index';

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

const blockEvent = (type: string, block: Blockly.BlockSvg) =>
  ({
    type,
    blockId: block.id,
    workspaceId: workspace.id,
  }) as unknown as Blockly.Events.Abstract;

const moveEvent = (block: Blockly.BlockSvg) =>
  blockEvent(Blockly.Events.BLOCK_MOVE, block);

// A BLOCK_CHANGE reporting a block going from disabled to enabled — the shape
// the handler keys on to undo Blockly's "procedure rename re-enables all call
// blocks" bug.
const becameEnabledEvent = (block: Blockly.BlockSvg) =>
  ({
    type: Blockly.Events.BLOCK_CHANGE,
    blockId: block.id,
    workspaceId: workspace.id,
    element: 'disabled',
    oldValue: true,
    newValue: false,
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

  it('disables a newly created orphan block', () => {
    const orphan = append('text_print');

    disableOrphans(blockEvent(Blockly.Events.BLOCK_CREATE, orphan));

    expect(orphan.isEnabled()).toBe(false);
    expect(orphan.getSvgRoot().style.opacity).toBe('0.5');
  });

  it('re-disables an orphan that reports going from disabled to enabled', () => {
    // The procedure-rename bug enables call blocks that are still orphans; the
    // handler keys on that disabled->enabled change to re-disable them.
    const orphan = append('text_print');

    disableOrphans(becameEnabledEvent(orphan));

    expect(orphan.isEnabled()).toBe(false);
    expect(orphan.getSvgRoot().style.opacity).toBe('0.5');
  });

  it('returns early when the event has no block or workspace id', () => {
    const orphan = append('text_print');

    disableOrphans({
      type: Blockly.Events.BLOCK_MOVE,
      workspaceId: workspace.id,
    } as unknown as Blockly.Events.Abstract);

    expect(orphan.isEnabled()).toBe(true);
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

  it('re-disables orphan call blocks when a procedure definition is dragged', () => {
    // Standalone (parentless) procedure-call block: an orphan.
    const call = append(BlockTypes.procedureCall);
    const definition = append(BlockTypes.procedureDefinition);
    // Force-enable the call to mimic the post-rename bug state.
    call.setDisabledReason(false, 'ORPHANED');
    expect(call.isEnabled()).toBe(true);

    disableOrphans(blockEvent(Blockly.Events.BLOCK_DRAG, definition));

    expect(call.isEnabled()).toBe(false);
  });
});

describe('disableOrphanBlocks', () => {
  it('disables a top-level orphan and clears its opacity', () => {
    const orphan = append('text_print');
    orphan.getSvgRoot().style.opacity = '0.5';

    disableOrphanBlocks(workspace);

    expect(orphan.isEnabled()).toBe(false);
    // disableOrphanBlocks always clears opacity on top blocks.
    expect(orphan.getSvgRoot().style.opacity).toBe('');
  });

  it('flags a top-level procedure-call block as orphaned', () => {
    const call = append(BlockTypes.procedureCall);
    call.setDisabledReason(false, 'ORPHANED');
    expect(call.isEnabled()).toBe(true);

    disableOrphanBlocks(workspace);

    expect(call.isEnabled()).toBe(false);
    expect(call.hasDisabledReason('ORPHANED')).toBe(true);
  });
});
