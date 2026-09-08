import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import DefaultTheme from '../../../themes/default';

import {ToolboxTrashcan} from '../index';

/*
 * ToolboxTrashcan draws an SVG overlay on the workspace and toggles it in
 * response to drag events, so it needs a rendered workspace — headless Chromium.
 * We construct it directly and drive workspaceChangeHandler with synthesized
 * BLOCK_DRAG events to observe the show/hide behavior deterministically.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

// Reach the private SVG bits and drag state the handler toggles, without a real
// drag gesture.
type Internals = {
  container: SVGElement;
  notAllowed: SVGElement;
  isLidOpen: boolean;
  wouldDelete_: boolean;
};
const internals = (trashcan: ToolboxTrashcan) =>
  trashcan as unknown as Internals;

// The handler reads workspace.currentGesture_?.flyout to tell a drag that
// originates in the toolbox apart from one on the workspace.
const setDraggingFromToolbox = (
  ws: Blockly.WorkspaceSvg,
  fromToolbox: boolean,
) => {
  (ws as unknown as {currentGesture_: unknown}).currentGesture_ = fromToolbox
    ? {flyout: {}}
    : null;
};

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

  it('treats a shadow block as deletable despite isDeletable() being false', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    block.setShadow(true);
    // Blockly reports shadow blocks as undeletable; the handler overrides that.
    expect(block.isDeletable()).toBe(false);
    const {notAllowed} = internals(trashcan);

    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(notAllowed.style.visibility).toBe('hidden');
  });

  it('flags "not allowed" if any block in the drag is undeletable', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const deletable = append('text_print');
    const locked = append('text_print');
    locked.setDeletable(false);
    const {notAllowed} = internals(trashcan);

    // The handler uses every(): a single undeletable block in the group flags it.
    trashcan.workspaceChangeHandler(dragEvent([deletable, locked], true));
    expect(notAllowed.style.visibility).toBe('visible');
  });

  it('keeps the trashcan hidden when the block is dragged from the toolbox', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    const {container: overlay} = internals(trashcan);

    setDraggingFromToolbox(workspace, true);
    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(overlay.style.visibility).toBe('hidden');
    setDraggingFromToolbox(workspace, false);
  });

  it('opens the lid over a delete-eligible target and closes it on exit', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const inner = internals(trashcan);
    const draggable = {} as Blockly.IDraggable;

    // wouldDelete_ is set by Blockly while a deletable block hovers the area.
    inner.wouldDelete_ = true;
    trashcan.onDragOver(draggable);
    expect(inner.isLidOpen).toBe(true);

    trashcan.onDragExit(draggable);
    expect(inner.isLidOpen).toBe(false);
  });

  it('does not open the lid over a target that would not delete', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const inner = internals(trashcan);

    inner.wouldDelete_ = false;
    trashcan.onDragOver({} as Blockly.IDraggable);
    expect(inner.isLidOpen).toBe(false);
  });

  it('hides the toolbox contents while a workspace block is dragging', () => {
    // Re-inject with a category toolbox so .blocklyToolboxContents exists; the
    // afterEach still disposes this (reassigned) workspace.
    workspace.dispose();
    workspace = Blockly.inject(container, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Text',
            contents: [{kind: 'block', type: 'text_print'}],
          },
        ],
      },
    });
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);

    const block = append('text_print');
    // In Blockly v13 the category list renders as .blocklyToolboxCategoryGroup
    // (the handler's first selector). Its second selector, .blocklyToolboxContents,
    // matches nothing in this version.
    const categoryGroup = document.querySelector<HTMLElement>(
      '.blocklyToolboxCategoryGroup',
    );
    expect(categoryGroup).not.toBeNull();

    // Dragging a workspace block (not from the toolbox) hides the toolbox...
    setDraggingFromToolbox(workspace, false);
    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(categoryGroup?.style.visibility).toBe('hidden');

    // ...and ending the drag reveals it again.
    trashcan.workspaceChangeHandler(dragEvent([block], false));
    expect(categoryGroup?.style.visibility).toBe('visible');
  });

  it('ignores events other than BLOCK_DRAG', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    const block = append('text_print');
    const {container: overlay} = internals(trashcan);

    trashcan.workspaceChangeHandler(dragEvent([block], true));
    expect(overlay.style.visibility).toBe('visible');

    // An unrelated event must leave the overlay state untouched.
    trashcan.workspaceChangeHandler({
      type: Blockly.Events.BLOCK_MOVE,
    } as Blockly.Events.Abstract);
    expect(overlay.style.visibility).toBe('visible');
  });

  it('removes the trashcan SVG on dispose', () => {
    trashcan = new ToolboxTrashcan(workspace, DefaultTheme);
    expect(document.querySelector('.blocklyTrash')).not.toBeNull();

    trashcan.dispose();
    trashcan = undefined;

    expect(document.querySelector('.blocklyTrash')).toBeNull();
  });
});
