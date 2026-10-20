import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

// Standard block messages (e.g. text_print's `%{BKY_TEXT_PRINT_TITLE}`) resolve
// against the locale; without it block init throws on the unfilled message.
Blockly.setLocale(En as unknown as {[key: string]: string});
Blockly.defineBlocksWithJsonArray([
  {type: 'when_run', message0: 'when run', nextStatement: null},
]);

import {
  cleanUp,
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

describe('layout.md: getDefaultLocation', () => {
  it('LAY-2: is the top-left corner in an LTR workspace', () => {
    expect(getDefaultLocation(workspace)).toEqual({defaultX: 0, defaultY: 0});
  });
});

describe('layout.md: isBlockAtEdge', () => {
  it('LAY-4: is true when either coordinate sits on a default edge', () => {
    const block = addBlock('text_print');

    block.moveTo(at(0, 0));
    expect(isBlockAtEdge(block)).toBe(true);

    block.moveTo(at(120, 0)); // y on the top edge
    expect(isBlockAtEdge(block)).toBe(true);

    block.moveTo(at(120, 80)); // off both edges
    expect(isBlockAtEdge(block)).toBe(false);
  });
});

describe('layout.md: positionBlocksOnWorkspace', () => {
  it('LAY-6: separates blocks that start stacked at the origin', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(0, 0));
    b.moveTo(at(0, 0));

    positionBlocksOnWorkspace(workspace);

    expect(isOverlapping(colliderOf(a), colliderOf(b))).toBe(false);
  });

  it('LAY-4: leaves a block that already has a non-default position', () => {
    const positioned = addBlock('text_print');
    positioned.moveTo(at(200, 200));
    addBlock('text_print').moveTo(at(0, 0));

    positionBlocksOnWorkspace(workspace);

    expect(positioned.getRelativeToSurfaceXY()).toMatchObject({x: 200, y: 200});
  });
});

// The area a block covers, whichever direction the workspace runs.
const boundsOf = (b: Blockly.BlockSvg) => {
  const {left, top, right, bottom} = b.getBoundingRectangle();
  return {x: left, y: top, width: right - left, height: bottom - top};
};

describe('layout.md: placing blocks', () => {
  it('LAY-5, LAY-V1: puts a block at the origin 16 pixels in from the top and side', () => {
    const block = addBlock('text_print');
    positionBlocksOnWorkspace(workspace);
    expect(block.getRelativeToSurfaceXY()).toMatchObject({x: 16, y: 16});
  });

  it('LAY-5: keeps the coordinate that is not at the edge', () => {
    const block = addBlock('text_print');
    block.moveTo(at(120, 0));
    positionBlocksOnWorkspace(workspace);
    expect(block.getRelativeToSurfaceXY()).toMatchObject({x: 120, y: 16});
  });

  it('LAY-6, LAY-V2: puts each placed block 10 pixels below the one it would overlap', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    positionBlocksOnWorkspace(workspace);
    const first = a.getRelativeToSurfaceXY().y < b.getRelativeToSurfaceXY().y;
    const [upper, lower] = first ? [a, b] : [b, a];
    expect(lower.getRelativeToSurfaceXY().y).toBe(
      upper.getRelativeToSurfaceXY().y + upper.getHeightWidth().height + 10,
    );
  });

  it('LAY-3: places setup blocks before the others', () => {
    const other = addBlock('text_print');
    other.moveTo(at(0, 0));
    const setup = Blockly.serialization.blocks.append(
      {type: 'when_run', x: 0, y: 40},
      workspace,
    ) as Blockly.BlockSvg;
    expect(setup).toBeTruthy();
    positionBlocksOnWorkspace(workspace);
    expect(isOverlapping(boundsOf(setup), boundsOf(other))).toBe(false);
  });

  it('LAY-11, LAY-V4: moves a block beside the one it overlaps when there is room', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(100, 100));
    b.moveTo(at(110, 105));
    positionBlocksOnWorkspace(workspace);
    expect(a.getRelativeToSurfaceXY()).toMatchObject({x: 100, y: 100});
    expect(b.getRelativeToSurfaceXY()).toMatchObject({
      x: 100 + a.getHeightWidth().width + 10,
      y: 105,
    });
  });

  it('LAY-11: moves a block down when the one it overlaps is not behind it', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(110, 100));
    b.moveTo(at(100, 105));
    positionBlocksOnWorkspace(workspace);
    expect(b.getRelativeToSurfaceXY()).toMatchObject({
      x: 100,
      y: 100 + a.getHeightWidth().height + 10,
    });
  });

  it('LAY-11: moves a block down when there is no room beside', () => {
    const {viewWidth} = workspace.getMetricsManager().getMetrics();
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    const width = a.getHeightWidth().width;
    a.moveTo(at(viewWidth - width - 20, 100));
    b.moveTo(at(viewWidth - width - 10, 105));
    positionBlocksOnWorkspace(workspace);
    expect(b.getRelativeToSurfaceXY()).toMatchObject({
      x: viewWidth - width - 10,
      y: 100 + a.getHeightWidth().height + 10,
    });
  });

  it('LAY-11: does not move an immovable block', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(100, 100));
    b.moveTo(at(110, 105));
    b.setMovable(false);
    positionBlocksOnWorkspace(workspace);
    expect(b.getRelativeToSurfaceXY()).toMatchObject({x: 110, y: 105});
    expect(isOverlapping(boundsOf(a), boundsOf(b))).toBe(false);
  });

  it('LAY-13: cleanUp with includeImmovableBlocks moves immovable blocks too', () => {
    const a = addBlock('text_print');
    const b = addBlock('text_print');
    a.moveTo(at(100, 100));
    b.moveTo(at(110, 105));
    a.setMovable(false);
    b.setMovable(false);
    cleanUp(workspace, true);
    expect(isOverlapping(boundsOf(a), boundsOf(b))).toBe(false);
  });

  it('LAY-1: does nothing to a workspace that is not rendered', () => {
    const headless = new Blockly.Workspace() as unknown as Blockly.WorkspaceSvg;
    expect(() => positionBlocksOnWorkspace(headless)).not.toThrow();
    headless.dispose();
  });
});

describe('layout.md: right to left', () => {
  let rtlContainer: HTMLDivElement;
  let rtl: Blockly.WorkspaceSvg;

  beforeEach(() => {
    rtlContainer = document.createElement('div');
    rtlContainer.style.width = '800px';
    rtlContainer.style.height = '600px';
    document.body.appendChild(rtlContainer);
    rtl = Blockly.inject(rtlContainer, {rtl: true});
  });

  afterEach(() => {
    rtl.dispose();
    rtlContainer.remove();
  });

  it('LAY-2: the default location is the top-right corner', () => {
    const {viewWidth} = rtl.getMetricsManager().getMetrics();
    expect(getDefaultLocation(rtl)).toEqual({defaultX: viewWidth, defaultY: 0});
  });

  it('LAY-10, LAY-V3: a placed block clears a narrower block beside its start', () => {
    const {viewWidth} = rtl.getMetricsManager().getMetrics();
    const narrow = Blockly.serialization.blocks.append(
      {type: 'math_number'},
      rtl,
    ) as Blockly.BlockSvg;
    const wide = Blockly.serialization.blocks.append(
      {
        type: 'text_print',
        inputs: {
          TEXT: {block: {type: 'text', fields: {TEXT: 'a long line of text'}}},
        },
      },
      rtl,
    ) as Blockly.BlockSvg;
    const narrowWidth = narrow.getHeightWidth().width;
    expect(wide.getHeightWidth().width).toBeGreaterThan(narrowWidth);
    narrow.moveTo(at(viewWidth - 16 - narrowWidth, 20));
    wide.moveTo(at(viewWidth, 0));

    positionBlocksOnWorkspace(rtl);

    expect(isOverlapping(boundsOf(narrow), boundsOf(wide))).toBe(false);
  });
});
