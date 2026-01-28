import * as Blockly from 'blockly/core';
import type {IDraggable} from 'blockly/core';

import {PluginType, WrapPlugin} from '../../plugins';
import type {Plugin} from '../../plugins';
import type {Theme} from '../../types';
import {getToolboxWidth} from '../../utils';

const {dom, toolbox, Rect, Svg} = Blockly.utils;

/**
 * The number of frames in the animation.
 */
const ANIMATION_FRAMES = 4;

/**
 * The length of the lid open/close animation in milliseconds.
 */
const ANIMATION_LENGTH = 80;

/**
 * Distance between trashcan and top of toolbox.
 */
const MARGIN_TOP = 40;

/**
 * The maximum angle the trashcan lid can opens to. At the end of the open
 * animation the lid will be open to this angle.
 */
const MAX_LID_ANGLE = 45;

/**
 * The height of the trashcan lid.
 */
const LID_HEIGHT = 10;

/**
 * The minimum (resting) opacity of the trashcan and lid.
 */
const OPACITY_MIN = 0.8;

/**
 * The maximum (hovered) opacity of the trashcan and lid.
 */
const OPACITY_MAX = 1.0;

/**
 * Width of both the trash can and lid images.
 */
const WIDTH = 47;

/**
 * Implements a trashcan over a flyout region, when it exists.
 *
 * The traditional blockly trashcan is an animated icon on the workspace itself
 * which can remember a certain number of deleted blocks and recall them.
 *
 * This, instead, offers that animated icon over the flyout or toolbox areas.
 */
export class ToolboxTrashcan extends Blockly.DeleteArea {
  /**
   * Retains a reference to the workspace.
   */
  private workspace: Blockly.WorkspaceSvg;
  /**
   * Task ID of opening/closing animation.
   */
  private lidTask: ReturnType<typeof setTimeout> | null = null;
  /**
   * Current open/close state of the lid.
   */
  private isLidOpen: boolean = false;
  /**
   * Current state of lid opening (0.0 = closed, 1.0 = open).
   */
  private lidOpen = 0;
  /**
   * The URL of the trashcan image.
   */
  private trashcanFillColor: string;
  private container: SVGElement;
  private svgGroup?: SVGElement;
  private svgLid?: SVGGElement;
  private notAllowed?: SVGElement;

  constructor(workspace: Blockly.WorkspaceSvg, theme: Theme) {
    super();

    // Retain workspace reference
    this.workspace = workspace;

    // Determine the light/dark status of the theme
    this.trashcanFillColor = theme.definition.trashcan.fill;

    // Create an SVG to contain the area
    this.container = dom.createSvgElement(Svg.SVG, {});
    this.container.style.visibility = 'hidden';

    this.init();
  }

  setLidOpen(state: boolean) {
    if (this.isLidOpen === state) {
      return;
    }
    if (this.lidTask) {
      clearTimeout(this.lidTask);
    }
    this.isLidOpen = state;
    this.animateLid();
  }

  /**
   * Called by Blockly.inject after the workspace is created
   */
  init() {
    this.workspace.addChangeListener(this.workspaceChangeHandler.bind(this));

    const svgGroup = this.createDom();
    this.container.appendChild(svgGroup);
    this.position(this.workspace.getMetricsManager().getUiMetrics());

    // Insert the SVG for the container for this area into the workspace
    const svg = this.workspace.getParentSvg();
    svg.parentNode?.insertBefore(this.container, svg);

    this.workspace.getComponentManager().addComponent({
      component: this,
      // Weight determines the order of drag targets. The toolbox is also a drag
      // target (weight 1). onDragEnter/Exit/Over are only called for the first
      // drag target, so the trashcan needs to have a smaller weight than the toolbox.
      weight: -1,
      capabilities: [
        Blockly.ComponentManager.Capability.DELETE_AREA,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE,
      ],
    });
  }

  /**
   * Dispose of this trash can.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose() {
    this.workspace.getComponentManager().removeComponent('trashcan');
    if (this.svgGroup) {
      dom.removeNode(this.svgGroup);
    }
    if (this.lidTask) {
      clearTimeout(this.lidTask);
    }
  }

  workspaceChangeHandler(blocklyEvent: Blockly.Events.Abstract) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      const event = blocklyEvent as Blockly.Events.BlockDrag;
      let trashcanVisibility = 'hidden';
      let toolboxVisibility = 'visible';
      // Don't show the trashcan if the block is being dragged out of the toolbox.
      // The flyout field is private, but this is the only way to find out this information.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isDraggingFromToolbox = !!(this.workspace.currentGesture_ as any)
        ?.flyout;
      if (!isDraggingFromToolbox && event.isStart) {
        trashcanVisibility = 'visible';
        toolboxVisibility = 'hidden';
      }

      // query selector for uncategorized toolbox contents
      document
        .querySelectorAll<SVGElement>(
          '.blocklyFlyout:not(.blockFieldFlyout) .blocklyWorkspace, .blocklyToolboxCategoryGroup',
        )
        .forEach(x => {
          x.style.visibility = toolboxVisibility;
        });
      // query selector for categorized toolbox contents
      document
        .querySelectorAll<SVGElement>('.blocklyToolboxContents')
        .forEach(x => {
          x.style.visibility = toolboxVisibility;
        });

      if (this.container) {
        this.container.style.visibility = trashcanVisibility;
      }

      // Shadow blocks can/should be successfully deleted
      // when dragged in conjunction with another deletable block;
      // however, isDeletable() returns false for shadow blocks,
      // so we manually override here.
      const isDeletable = event.blocks?.every(
        block => block.isDeletable() || block.isShadow(),
      );
      if (!this.notAllowed) {
        return;
      }
      if (trashcanVisibility === 'visible' && !isDeletable) {
        this.notAllowed.style.visibility = 'visible';
      } else {
        this.notAllowed.style.visibility = 'hidden';
      }
    }
  }

  /**
   * IPositionable method
   * Positions the container and the trashcan itself. Called when the window is resized and on initialization.
   *
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   */
  position(metrics: Blockly.MetricsManager.UiMetrics) {
    const toolboxWidth = getToolboxWidth(this.workspace);

    // Position container
    this.container.style.height = `${metrics.viewMetrics.height}px`;
    this.container.style.width = `${toolboxWidth}px`;
    this.container.style.left = this.workspace.RTL
      ? `${metrics.viewMetrics.width}px`
      : '0px';
    this.container.style.top = '0px';
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '75';

    // Position trashcan within container
    const left = toolboxWidth / 2 - WIDTH / 2;
    this.svgGroup?.setAttribute(
      'transform',
      `translate(${left}, ${MARGIN_TOP})`,
    );
  }

  /**
   * IPositionable method
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   *
   * @return {?Blockly.utils.Rect} The UI elements’s bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle(): Blockly.utils.Rect | null {
    return this.getClientRect();
  }

  /**
   * IDragTarget method
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to the Blockly injection div.
   *
   * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect(): Blockly.utils.Rect | null {
    if (!this.container) {
      return null;
    }

    const toolboxRect = this.container.getBoundingClientRect();
    return new Rect(
      toolboxRect.top,
      toolboxRect.bottom,
      toolboxRect.left,
      toolboxRect.right,
    );
  }

  /**
   * Create the trash can elements.
   *
   * @returns The trash can's SVG group.
   */
  createDom(): SVGElement {
    /*
     * This is the sprites.svg trashcan SVG content:
     *  <g class="trash">
     *    <!-- trashcan lid -->
     *    <path d="M 2,41 v 6 h 42 v -6 h -10.5 l -3,-3 h -15 l -3,3 z" />
     *    <!-- trashcan body (top half without rounded corners and bottom half with) -->
     *    <rect width="36" height="20" x="5" y="50" />
     *    <rect width="36" height="42" x="5" y="50" rx="4" ry="4" />
     *  </g>
     */
    this.svgGroup = dom.createSvgElement(Svg.G, {class: 'blocklyTrash'});
    const body = dom.createSvgElement(
      Svg.G,
      {
        fill: this.trashcanFillColor,
      },
      this.svgGroup,
    );

    dom.createSvgElement(
      Svg.RECT,
      {
        width: 36,
        height: 20,
        x: 5,
        y: LID_HEIGHT + 2,
      },
      body,
    );

    dom.createSvgElement(
      Svg.RECT,
      {
        width: 36,
        height: 42,
        x: 5,
        y: LID_HEIGHT + 2,
        rx: 4,
        ry: 4,
      },
      body,
    );

    this.svgLid = dom.createSvgElement(
      Svg.G,
      {
        fill: this.trashcanFillColor,
      },
      this.svgGroup,
    );

    /*
     * The normal path for the lid is:
     *
     *    <path d="M 2,41 v 6 h 42 v -6 h -10.5 l -3,-3 h -15 l -3,3 z" />
     *
     * But we will set the initial point to '(2, 4)' via 'M' to fit it into
     * a particular space.
     */
    dom.createSvgElement(
      Svg.PATH,
      {
        d: 'M 2,4 v 6 h 42 v -6 h -10.5 l -3,-3 h -15 l -3,3 z',
      },
      this.svgLid,
    );

    // not allowed symbol
    this.notAllowed = dom.createSvgElement(
      Svg.G,
      {
        y: -10,
      },
      this.svgGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {x1: 0, y1: 5, x2: 45, y2: 55, stroke: '#c00', 'stroke-width': 5},
      this.notAllowed,
    );
    dom.createSvgElement(
      Svg.CIRCLE,
      {
        cx: 22,
        cy: 28,
        r: 33,
        stroke: '#c00',
        'stroke-width': 5,
        fill: 'none',
      },
      this.notAllowed,
    );

    this.animateLid();
    return this.svgGroup;
  }

  /**
   * Rotate the lid open or closed by one step.
   *
   * Then wait and recurse.
   * */
  animateLid() {
    const frames = ANIMATION_FRAMES;

    const delta = 1 / (frames + 1);
    this.lidOpen += this.isLidOpen ? delta : -delta;
    this.lidOpen = Math.min(Math.max(this.lidOpen, 0), 1);

    this.setLidAngle(this.lidOpen * MAX_LID_ANGLE);

    // Linear interpolation between min and max.
    const opacity = OPACITY_MIN + this.lidOpen * (OPACITY_MAX - OPACITY_MIN);
    if (this.svgGroup) {
      this.svgGroup.style.opacity = `${opacity}`;
    }

    if (this.lidOpen > 0 && this.lidOpen < 1) {
      this.lidTask = setTimeout(
        this.animateLid.bind(this),
        ANIMATION_LENGTH / frames,
      );
    }
  }

  setLidAngle(lidAngle: number) {
    const openAtRight = !(
      this.workspace.toolboxPosition === toolbox.Position.RIGHT ||
      (this.workspace.horizontalLayout && this.workspace.RTL)
    );

    this.svgLid?.setAttribute(
      'transform',
      'rotate(' +
        (openAtRight ? -lidAngle : lidAngle) +
        ' ' +
        (openAtRight ? 4 : WIDTH - 4) +
        ' ' +
        LID_HEIGHT +
        ')',
    );
  }

  /**
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   *
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDragOver(_dragElement: IDraggable) {
    this.setLidOpen(this.wouldDelete_);
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   *
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDragExit(_dragElement: IDraggable) {
    this.setLidOpen(false);
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   *
   * @param _dragElement The block or bubble currently being dragged.
   */
  override onDrop(_dragElement: IDraggable) {
    setTimeout(this.setLidOpen.bind(this, false), 100);
  }
}

export const plugin: Plugin = {
  type: PluginType.Inject,
  instantiate: WrapPlugin(ToolboxTrashcan),
};

export default plugin;
