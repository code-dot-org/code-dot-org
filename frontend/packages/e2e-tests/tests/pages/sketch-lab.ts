import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/** Shape node types offered by the canvas toolbar. */
export type SketchLabShapeType =
  | 'rectangle'
  | 'triangle'
  | 'circle'
  | 'diamond';

/**
 * The allthethings level backing these tests: lesson "Sketch Lab" position 54,
 * level "allthethings sketchlab 1", seeded with no start_sources so the canvas
 * is empty on load.
 */
const SKETCH_LAB_LEVEL: LabLevelUrlParams = {lesson: 54, level: 1};

/** Mouse-move steps per drag; xyflow ignores drags with a single pointermove. */
const DRAG_STEPS = 10;

/**
 * Page object for the Sketch Lab level type (React Flow canvas).
 *
 * DOM contract (see apps/src/sketchlab/reactFlow/):
 * - Nodes are added by clicking toolbar buttons, never by dragging from a
 *   palette. A new node lands at window center + a 20px stagger per node,
 *   is auto-selected, and its style toolbar opens.
 * - React Flow class names (.react-flow__node, .react-flow__edge,
 *   .react-flow__handle) come from @xyflow/react and are mirrored in
 *   apps/src/sketchlab/reactFlow/reactFlowSelectors.ts.
 */
export class SketchLab extends LessonLevelPage {
  /** Sketch Lab widget root; a11y scans scope here, not the shared chrome. */
  readonly rootSelector = '.sketchlab-react-flow-container';

  /** The React Flow canvas container. */
  readonly canvas: Locator;

  /** The vertical add-node / canvas-tool toolbar. */
  readonly canvasToolbar: Locator;

  /** All nodes on the canvas, including hidden lineAnchor nodes. */
  readonly nodes: Locator;

  /** All edges (lines/arrows) on the canvas. */
  readonly edges: Locator;

  /** The hidden 10px anchor nodes that terminate a standalone line/arrow. */
  readonly lineAnchorNodes: Locator;

  /** Text nodes on the canvas. */
  readonly textNodes: Locator;

  /** Floating style toolbar for the selected shape node. */
  readonly styleToolbar: Locator;

  constructor(page: Page) {
    super(page);
    this.canvas = page.locator(this.rootSelector);
    this.canvasToolbar = page.getByRole('toolbar', {name: 'Canvas tools'});
    this.nodes = page.locator('.react-flow__node');
    this.edges = page.locator('.react-flow__edge');
    this.lineAnchorNodes = page.locator('.react-flow__node-lineAnchor');
    this.textNodes = page.locator('.react-flow__node-text');
    this.styleToolbar = page.getByRole('toolbar', {name: 'Shape style'});
  }

  /** Navigate to the empty Sketch Lab level and wait for the canvas. */
  async gotoLevel(params: LabLevelUrlParams = SKETCH_LAB_LEVEL): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** The lab is ready once the canvas and its tools toolbar render. */
  async waitForReady(): Promise<void> {
    await expect(this.canvas).toBeVisible();
    await expect(this.canvasToolbar).toBeVisible();
  }

  /** Toolbar button that adds a node, by its accessible name. */
  addButton(name: `Add ${string}`): Locator {
    return this.canvasToolbar.getByRole('button', {name});
  }

  /** A shape node by type. The label part of the aria-label is empty for new nodes. */
  shapeNode(shapeType: SketchLabShapeType): Locator {
    return this.page.getByLabel(new RegExp(`^${shapeType} shape`));
  }

  /**
   * The SVG paint element inside a non-rectangle shape node. Background and
   * border colors land here as inline fill/stroke (ShapeNode.tsx), not on the
   * node root. Rectangles paint via a CSS-module div with background-color
   * and have no SVG.
   */
  shapePaintElement(
    shapeType: Exclude<SketchLabShapeType, 'rectangle'>,
  ): Locator {
    return this.shapeNode(shapeType).locator('svg ellipse, svg polygon');
  }

  /**
   * A connection handle on a node, e.g. handleId 'right-source' or
   * 'left-target'. Handles have no accessible role; data-handleid is the only
   * stable hook (see ConnectionHandles.tsx).
   */
  nodeHandle(node: Locator, handleId: string): Locator {
    return node.locator(`.react-flow__handle[data-handleid='${handleId}']`);
  }

  /** Add a shape node via its toolbar button and wait for it to render. */
  async addShape(shapeType: SketchLabShapeType): Promise<void> {
    await this.addButton(`Add ${shapeType}`).click();
    await expect(this.shapeNode(shapeType).last()).toBeVisible();
  }

  /** Add a text node and wait for it to render. */
  async addText(): Promise<void> {
    await this.addButton('Add text').click();
    await expect(this.textNodes.last()).toBeVisible();
  }

  /**
   * Add a standalone arrow. It renders as one edge joining two hidden
   * lineAnchor nodes, so wait on the edge, not on a visible node.
   */
  async addArrow(): Promise<void> {
    await this.addButton('Add arrow').click();
    await expect(this.edges.last()).toBeAttached();
  }

  /**
   * Nudge the currently-focused node right with the arrow key until it fully
   * clears `other`'s bounding box (plus a margin). Adding a node auto-focuses
   * it, so this needs no click of its own. Arrow-key movement
   * (useKeyboardNavigation.ts) avoids moving the wrong node in case
   * nodes are overlapping.
   */
  async nudgeFocusedNodeClearOf(
    node: Locator,
    other: Locator,
    margin = 60,
  ): Promise<void> {
    // The focusable/keyboard-navigable element is xyflow's `.react-flow__node`
    // wrapper, one level up from the shape's own aria-labeled div.
    await expect(node.locator('xpath=..')).toBeFocused();
    const maxPresses = 60;
    for (let presses = 0; presses < maxPresses; presses++) {
      const nodeBox = await node.boundingBox();
      const otherBox = await other.boundingBox();
      if (!nodeBox || !otherBox) {
        throw new Error('node has no bounding box; is it visible?');
      }
      if (nodeBox.x >= otherBox.x + otherBox.width + margin) {
        return;
      }
      await this.page.keyboard.press('ArrowRight');
    }
    throw new Error(
      `node still overlaps after ${maxPresses} ArrowRight presses`,
    );
  }

  /**
   * Connect two nodes by dragging from the source's right handle to the
   * target's left handle. Handles are opacity-0 and inert until the node is
   * hovered or a connection is in progress, so hover first and wait for the
   * handle to become interactive.
   */
  async connectNodes(source: Locator, target: Locator): Promise<void> {
    const sourceHandle = this.nodeHandle(source, 'right-source');
    const targetHandle = this.nodeHandle(target, 'left-target');

    await source.hover();
    await expect(sourceHandle).toHaveCSS('opacity', '1');

    const from = await sourceHandle.boundingBox();
    const to = await targetHandle.boundingBox();
    if (!from || !to) {
      throw new Error('connection handle has no bounding box');
    }
    await this.page.mouse.move(
      from.x + from.width / 2,
      from.y + from.height / 2,
    );
    await this.page.mouse.down();
    await this.page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: DRAG_STEPS,
    });
    await this.page.mouse.up();
  }

  /**
   * Pick a background color for the selected shape from its style toolbar.
   * The trigger's accessible name is its row label plus the current value
   * (via aria-labelledby, e.g. "Background Clear"), so match on the prefix.
   */
  async setBackgroundColor(colorName: string): Promise<void> {
    await this.styleToolbar
      .getByRole('button', {name: /^Background/})
      .click();
    await this.page
      .getByRole('button', {name: `Background: ${colorName}`})
      .click();
  }
}
