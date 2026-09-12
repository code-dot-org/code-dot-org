import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

// Standard block messages (e.g. text_print's `%{BKY_TEXT_PRINT_TITLE}`) resolve
// against the locale; without it block init throws on the unfilled message.
Blockly.setLocale(En as unknown as {[key: string]: string});

import {
  getDefaultLocation,
  isBlockAtEdge,
  isOverlapping,
  positionBlocksOnWorkspace,
} from '../serialization';

/*
 * Browser-mode tests for the position logic: it reads block geometry
 * (getHeightWidth/getRelativeToSurfaceXY) and workspace metrics that only exist
 * in a rendered workspace, so these run in headless Chromium rather than jsdom.
 */

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

const at = (x: number, y: number) => new Blockly.utils.Coordinate(x, y);

const addBlock = (type: string) =>
  Blockly.serialization.blocks.append({type}, workspace) as Blockly.BlockSvg;

// Non-function blocks have no SVG-frame padding, so their collider is just
// position + size — mirrors getCollider for the non-frame case.
const colliderOf = (b: Blockly.BlockSvg) => ({
  ...b.getRelativeToSurfaceXY(),
  ...b.getHeightWidth(),
});

describe('getDefaultLocation', () => {
  it('is the top-left corner in an LTR workspace', () => {
    expect(getDefaultLocation(workspace)).toEqual({defaultX: 0, defaultY: 0});
  });
});

describe('isBlockAtEdge', () => {
  it('is true when either coordinate sits on a default edge', () => {
    const block = addBlock('text_print');

    block.moveTo(at(0, 0));
    expect(isBlockAtEdge(block)).toBe(true);

    block.moveTo(at(120, 0)); // y on the top edge
    expect(isBlockAtEdge(block)).toBe(true);

    block.moveTo(at(120, 80)); // off both edges
    expect(isBlockAtEdge(block)).toBe(false);
  });
});

describe('positionBlocksOnWorkspace', () => {
  it('separates blocks that start stacked at the origin', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(0, 0));
    b.moveTo(at(0, 0));

    positionBlocksOnWorkspace(workspace);

    expect(isOverlapping(colliderOf(a), colliderOf(b))).toBe(false);
  });

  it('leaves a block that already has a non-default position', () => {
    const positioned = addBlock('text_print');
    positioned.moveTo(at(200, 200));
    addBlock('text_print').moveTo(at(0, 0));

    positionBlocksOnWorkspace(workspace);

    expect(positioned.getRelativeToSurfaceXY()).toMatchObject({x: 200, y: 200});
  });
});
