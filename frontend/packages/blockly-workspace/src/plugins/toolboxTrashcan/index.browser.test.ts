import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import DefaultTheme from '../../themes/default';

import {ToolboxTrashcan} from './index';

/*
 * ToolboxTrashcan draws an SVG overlay on the workspace and toggles it in
 * response to drag events, so it needs a rendered workspace — headless Chromium.
 * We construct it directly and drive workspaceChangeHandler with synthesized
 * BLOCK_DRAG events to observe the show/hide behavior deterministically.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

// Reach the private SVG bits the handler toggles, without a real drag gesture.
type Internals = {container: SVGElement; notAllowed: SVGElement};
const internals = (trashcan: ToolboxTrashcan) =>
  trashcan as unknown as Internals;

const dragEvent = (blocks: Blockly.BlockSvg[], isStart: boolean) =>
  ({
    type: Blockly.Events.BLOCK_DRAG,
    isStart,
    blocks,
  }) as unknown as Blockly.Events.Abstract;

let container: HTMLDivElement;
let workspace: Blockly.WorkspaceSvg;
let trashcan: ToolboxTrashcan | undefined;

beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {});
});

afterEach(() => {
  trashcan?.dispose();
  trashcan = undefined;
  workspace.dispose();
  container.remove();
});

const append = (type: string) =>
  Blockly.serialization.blocks.append({type}, workspace) as Blockly.BlockSvg;

describe('ToolboxTrashcan', () => {
  it('renders the trashcan SVG into the page on construction', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    expect(document.querySelector('.blocklyTrash')).not.toBeNull();
  });

  it('shows the container while a deletable block is dragging and hides it after', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    const {container: overlay} = internals(trashcan);

    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(overlay.style.visibility).toBe('visible');

    trashcan.workspaceChangeHandler(dragEvent([block], false));
    expect(overlay.style.visibility).toBe('hidden');
  });

  it('flags "not allowed" when an undeletable block is dragging', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    block.setDeletable(false);
    const {notAllowed} = internals(trashcan);

    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(notAllowed.style.visibility).toBe('visible');
  });

  it('does not flag "not allowed" for a deletable block', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    const {notAllowed} = internals(trashcan);

    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(notAllowed.style.visibility).toBe('hidden');
  });

  it('removes the trashcan SVG on dispose', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    expect(document.querySelector('.blocklyTrash')).not.toBeNull();

    trashcan.dispose();
    trashcan = undefined;

    expect(document.querySelector('.blocklyTrash')).toBeNull();
  });
});
