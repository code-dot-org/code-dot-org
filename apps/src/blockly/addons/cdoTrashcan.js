import GoogleBlockly from 'blockly/core';

export default class CdoTrashcan extends GoogleBlockly.DeleteArea {
  constructor(workspace) {
    super();
    this.workspace = workspace;
    this.id = 'cdoTrashcan';

    /**
     * Current open/close state of the lid.
     */
    this.isLidOpen = false;
    /**
     * Task ID of opening/closing animation.
     */
    this.lidTask_ = 0;
    /**
     * Current state of lid opening (0.0 = closed, 1.0 = open).
     */
    this.lidOpen_ = 0;
    this.TRASH_URL = '/blockly/media/trash.png';
  }

  /**
   * Called by Blockly.inject after the workspace is created
   */
  init() {
    this.workspace.addChangeListener(this.workspaceChangeHandler.bind(this));

    const svg = this.workspace.getParentSvg();
    this.container = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.SVG);
    this.container.style.visibility = 'hidden';
    this.createTrashcanSvg();
    this.position(this.workspace.getMetricsManager().getUiMetrics());

    svg.parentNode.insertBefore(this.container, svg);

    this.workspace.getComponentManager().addComponent({
      component: this,
      // Weight determines the order of drag targets. The toolbox is also a drag
      // target (weight 1). onDragEnter/Exit/Over are only called for the first
      // drag target, so the trashcan needs to have a smaller weight than the toolbox.
      weight: 0,
      capabilities: [
        Blockly.ComponentManager.Capability.DELETE_AREA,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE,
      ],
    });
    this.workspace.recordDragTargets();
  }

  createTrashcanSvg() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {class: 'blocklyTrash'},
      this.container
    );

    // trashcan body
    const bodyClipPath = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {id: 'blocklyTrashBodyClipPath'},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        width: WIDTH,
        height: BODY_HEIGHT,
        y: LID_HEIGHT,
      },
      bodyClipPath
    );
    const SPRITE = {
      width: 96,
      height: 124,
      url: 'sprites.png',
    };
    const body = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: SPRITE.width,
        x: -SPRITE_LEFT,
        height: SPRITE.height,
        y: -SPRITE_TOP,
        'clip-path': 'url(#blocklyTrashBodyClipPath)',
      },
      this.svgGroup_
    );
    body.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      this.TRASH_URL
    );

    // trashcan lid
    const lidClipPath = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {id: 'blocklyTrashLidClipPath'},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {width: WIDTH, height: LID_HEIGHT},
      lidClipPath
    );
    this.svgLid_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: SPRITE.width,
        x: -SPRITE_LEFT,
        height: SPRITE.height,
        y: -SPRITE_TOP,
        'clip-path': 'url(#blocklyTrashLidClipPath)',
      },
      this.svgGroup_
    );
    this.svgLid_.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      this.TRASH_URL
    );

    // not allowed symbol
    this.notAllowed_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {x1: 0, y1: 10, x2: 45, y2: 60, stroke: '#c00', 'stroke-width': 5},
      this.notAllowed_
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CIRCLE,
      {
        cx: 22,
        cy: 33,
        r: 33,
        stroke: '#c00',
        'stroke-width': 5,
        fill: 'none',
      },
      this.notAllowed_
    );

    this.animateLid_();
    return this.svgGroup_;
  }

  workspaceChangeHandler(blocklyEvent) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      let trashcanVisibility = 'hidden';
      let toolboxVisibility = 'visible';
      // Don't show the trashcan if the block is being dragged out of the toolbox.
      const isDraggingFromToolbox =
        !!Blockly.mainBlockSpace?.currentGesture_?.flyout_;
      if (!isDraggingFromToolbox && blocklyEvent.isStart) {
        trashcanVisibility = 'visible';
        toolboxVisibility = 'hidden';
      }

      // query selector for uncategorized toolbox contents
      document
        .querySelectorAll(
          '.blocklyFlyout:not(.blockFieldFlyout) .blocklyWorkspace'
        )
        .forEach(x => {
          x.style.visibility = toolboxVisibility;
        });
      // query selector for categorized toolbox contents
      document.querySelectorAll('.blocklyToolboxContents').forEach(x => {
        x.style.visibility = toolboxVisibility;
      });

      this.container.style.visibility = trashcanVisibility;

      // Shadow blocks can/should be successfully deleted
      // when dragged in conjunction with another deletable block;
      // however, isDeletable() returns false for shadow blocks,
      // so we manually override here.
      const isDeletable = blocklyEvent.blocks.every(
        block => block.isDeletable() || block.isShadow()
      );
      if (trashcanVisibility === 'visible' && !isDeletable) {
        this.notAllowed_.style.visibility = 'visible';
      } else {
        this.notAllowed_.style.visibility = 'hidden';
      }
    }
  }

  /**
   * IPositionable method
   * Positions the container and the trashcan itself. Called when the window is resized and on initialization.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   */
  position(metrics) {
    const toolboxWidth = Blockly.cdoUtils.getToolboxWidth();

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
    this?.svgGroup_.setAttribute(
      'transform',
      `translate(${left}, ${MARGIN_TOP})`
    );
  }

  /**
   * IPositionable method
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Blockly.utils.Rect} The UI elements’s bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle() {
    return this.getClientRect();
  }

  /**
   * IDragTarget method
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to the Blockly injection div.
   * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
    const toolboxRect = this.container.getBoundingClientRect();
    return new Blockly.utils.Rect(
      toolboxRect.top,
      toolboxRect.bottom,
      toolboxRect.left,
      toolboxRect.right
    );
  }

  /**
   * Flip the lid open or shut.
   * @param {boolean} state True if open.
   */
  setLidOpen(state) {
    if (this.isLidOpen === state) {
      return;
    }
    clearTimeout(this.lidTask_);
    this.isLidOpen = state;
    this.animateLid_();
  }

  /**
   * Rotate the lid open or closed by one step.  Then wait and recurse.
   * @private
   */
  animateLid_() {
    const delta = 1 / (ANIMATION_FRAMES + 1);
    this.lidOpen_ += this.isLidOpen ? delta : -delta;
    this.lidOpen_ = Math.min(this.lidOpen_, 1);
    this.lidOpen_ = Math.max(this.lidOpen_, 0);

    this.setLidAngle_(this.lidOpen_ * MAX_LID_ANGLE);

    const opacity = OPACITY_MIN + this.lidOpen_ * (OPACITY_MAX - OPACITY_MIN);
    this.svgGroup_.style.opacity = opacity;

    if (this.lidOpen_ >= 0 && this.lidOpen_ < 1) {
      this.lidTask_ = setTimeout(
        this.animateLid_.bind(this),
        ANIMATION_LENGTH / ANIMATION_FRAMES
      );
    }
  }

  /**
   * Open the lid to a certain angle
   */
  setLidAngle_(lidAngle) {
    const openAtRight = !this.workspace.RTL;
    this.svgLid_.setAttribute(
      'transform',
      `rotate(${openAtRight ? -lidAngle : lidAngle}, ${
        openAtRight ? 4 : WIDTH - 4
      }, ${LID_HEIGHT - 2})`
    );
  }

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragEnter(_dragElement) {
    this.setLidOpen(_dragElement.isDeletable());
  }

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragOver(_dragElement) {}

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragExit(_dragElement) {
    this.setLidOpen(false);
  }

  /**
   * IDragTarget method
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDrop(_dragElement) {
    this.setLidOpen(false);
  }

  /**
   * IDragTarget method
   * Returns whether the provided block or bubble should not be moved after being
   * dropped on this component. If true, the element will return to where it was
   * when the drag started.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @return {boolean} Whether the block or bubble provided should be returned to
   *     drag start.
   */
  shouldPreventMove(_dragElement) {
    return false;
  }
}

CdoTrashcan.TRASH_URL = '/blockly/media/trash.png';

/**
 * Width of both the trash can and lid images.
 */
const WIDTH = 47;

/**
 * Height of the trashcan image (minus lid).
 */
const BODY_HEIGHT = 44;

/**
 * Height of the lid image.
 */
const LID_HEIGHT = 16;

/**
 * Distance between trashcan and top of toolbox.
 */
const MARGIN_TOP = 40;

/**
 * Location of trashcan in sprite image.
 */
const SPRITE_LEFT = 0;

/**
 * Location of trashcan in sprite image.
 */
const SPRITE_TOP = 32;

/**
 * The length of the lid open/close animation in milliseconds.
 */
const ANIMATION_LENGTH = 80;

/**
 * The number of frames in the animation.
 */
const ANIMATION_FRAMES = 4;

/**
 * The minimum (resting) opacity of the trashcan and lid.
 */
const OPACITY_MIN = 0.4;

/**
 * The maximum (hovered) opacity of the trashcan and lid.
 */
const OPACITY_MAX = 0.8;

/**
 * The maximum angle the trashcan lid can opens to. At the end of the open
 * animation the lid will be open to this angle.
 */
const MAX_LID_ANGLE = 45;
