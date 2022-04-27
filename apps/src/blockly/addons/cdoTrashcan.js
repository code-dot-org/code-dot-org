import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';

export class OldCdoTrashcan extends GoogleBlockly.Trashcan {
  /**
   * @override
   */
  init() {
    super.init();
    this.workspace_.addChangeListener(this.workspaceChangeHandler.bind(this));
  }

  workspaceChangeHandler(blocklyEvent) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      let trashcanDisplay = 'none';
      let toolboxVisibility = 'visible';
      // Don't show the trashcan if the block is being dragged out of the toolbox.
      const isDraggingFromToolbox = !!Blockly.mainBlockSpace?.currentGesture_
        ?.flyout_;
      if (!isDraggingFromToolbox && blocklyEvent.isStart) {
        trashcanDisplay = 'block';
        toolboxVisibility = 'hidden';
      }

      /**
       * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
       * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
       */
      Array.prototype.forEach.call(
        // query selector for uncategorized toolbox contents
        document.querySelectorAll('.blocklyFlyout .blocklyWorkspace'),
        function(x) {
          x.style.visibility = toolboxVisibility;
        }
      );
      Array.prototype.forEach.call(
        // query selector for categorized toolbox contents
        document.querySelectorAll('.blocklyToolboxContents'),
        function(x) {
          x.style.visibility = toolboxVisibility;
        }
      );

      document.querySelector('#trashcanHolder').style.display = trashcanDisplay;
      const isDeletable = blocklyEvent.blocks.every(block =>
        block.isDeletable()
      );
      this.notAllowed_.style.visibility = isDeletable ? 'hidden' : 'visible';
    }
  }

  /** Use our trash png and add circle with line through it for undeletable blocks
   * @override
   */
  createDom() {
    super.createDom();

    /**
     * Use our trashcan png instead of Google's
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(this.svgGroup_.childNodes, function(node) {
      if (node.nodeName === 'image') {
        node.setAttributeNS(
          Blockly.utils.dom.XLINK_NS,
          'xlink:href',
          CdoTrashcan.TRASH_URL
        );
      }
    });

    // not allowed symbol for undeletable blocks. Circle with line through it
    this.notAllowed_ = Blockly.utils.dom.createSvgElement(
      'g',
      {},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'line',
      {x1: 0, y1: 10, x2: 45, y2: 60, stroke: '#c00', 'stroke-width': 5},
      this.notAllowed_
    );
    Blockly.utils.dom.createSvgElement(
      'circle',
      {cx: 22, cy: 33, r: 33, stroke: '#c00', 'stroke-width': 5, fill: 'none'},
      this.notAllowed_
    );
    return this.svgGroup_;
  }

  /** Also dispose of circle with line through it element
   * @override
   */
  dispose() {
    super.dispose();
    this.notAllowed_ = null;
  }

  /** Position over the toolbox area instead of the bottom corner.
   * @override
   */
  position() {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
      // There are no metrics available (workspace is probably not visible).
      return;
    }

    let toolboxWidth;
    switch (this.workspace_.getToolboxType()) {
      case ToolboxType.CATEGORIZED:
        toolboxWidth = this.workspace_.toolbox_.width_;
        break;
      case ToolboxType.UNCATEGORIZED:
        toolboxWidth = metrics.flyoutWidth;
        break;
      case ToolboxType.NONE:
        toolboxWidth = 0;
        break;
    }

    this.left_ = Math.round(toolboxWidth / 2 - this.WIDTH_ / 2);
    this.top_ = this.MARGIN_VERTICAL_ * 2;

    this.svgGroup_.setAttribute(
      'transform',
      'translate(' + this.left_ + ',' + this.top_ + ')'
    );
  }

  /** Open the lid the opposite direction
   * @override
   */
  setLidAngle_(lidAngle) {
    var openAtRight = !this.workspace_.RTL;
    this.svgLid_.setAttribute(
      'transform',
      'rotate(' +
        (openAtRight ? -lidAngle : lidAngle) +
        ',' +
        (openAtRight ? 4 : this.WIDTH_ - 4) +
        ',' +
        (this.LID_HEIGHT_ - 2) +
        ')'
    );
  }
}
export default class CdoTrashcan extends GoogleBlockly.DeleteArea {
  constructor(workspace) {
    super();
    this.workspace = workspace;
    this.id = 'cdoTrashcan';

    this.WIDTH_ = 47;
    this.BODY_HEIGHT_ = 44;
    this.LID_HEIGHT_ = 16;
    this.MARGIN_TOP_ = 40;
    this.SPRITE_LEFT_ = 0;
    this.SPRITE_TOP_ = 32;
    this.ANIMATION_LENGTH_ = 80;
    this.ANIMATION_FRAMES_ = 4;
    this.MAX_LID_ANGLE_ = 45;
    this.OPACITY_MIN_ = 0.4;
    this.OPACITY_MAX_ = 0.8;
    this.TRASH_URL = '/blockly/media/trash.png';

    this.isLidOpen = false;
    this.lidTask_ = 0;
    this.lidOpen_ = 0;
  }

  /**
   * Called by Blockly.inject after the workspace is created
   */
  init() {
    this.workspace.addChangeListener(this.workspaceChangeHandler.bind(this));

    const svg = this.workspace.getParentSvg();
    this.container = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.SVG);
    this.container.style.visibility = 'hidden';
    this.position(this.workspace.getMetricsManager().getUiMetrics());
    this.createTrashcanSvg();

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
        Blockly.ComponentManager.Capability.POSITIONABLE
      ]
    });
    this.workspace.recordDragTargets();
  }

  createTrashcanSvg() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {class: 'blocklyTrash'},
      this.container
    );
    const left = Blockly.cdoUtils.getToolboxWidth() / 2 - this.WIDTH_ / 2;
    this.svgGroup_.setAttribute(
      'transform',
      `translate(${left}, ${this.MARGIN_TOP_})`
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
        width: this.WIDTH_,
        height: this.BODY_HEIGHT_,
        y: this.LID_HEIGHT_
      },
      bodyClipPath
    );
    const body = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: Blockly.SPRITE.width,
        x: -this.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashBodyClipPath)'
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
      {width: this.WIDTH_, height: this.LID_HEIGHT_},
      lidClipPath
    );
    this.svgLid_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: Blockly.SPRITE.width,
        x: -this.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashLidClipPath)'
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
        fill: 'none'
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
      const isDraggingFromToolbox = !!Blockly.mainBlockSpace?.currentGesture_
        ?.flyout_;
      if (!isDraggingFromToolbox && blocklyEvent.isStart) {
        trashcanVisibility = 'visible';
        toolboxVisibility = 'hidden';
      }

      /**
       * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
       * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
       */
      Array.prototype.forEach.call(
        // query selector for uncategorized toolbox contents
        document.querySelectorAll('.blocklyFlyout .blocklyWorkspace'),
        function(x) {
          x.style.visibility = toolboxVisibility;
        }
      );
      Array.prototype.forEach.call(
        // query selector for categorized toolbox contents
        document.querySelectorAll('.blocklyToolboxContents'),
        function(x) {
          x.style.visibility = toolboxVisibility;
        }
      );

      this.container.style.visibility = trashcanVisibility;

      const isDeletable = blocklyEvent.blocks.every(block =>
        block.isDeletable()
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
   * Positions the element. Called when the window is resized.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   */
  position(metrics) {
    this.container.style.height = `${metrics.viewMetrics.height}px`;
    this.container.style.width = `${Blockly.cdoUtils.getToolboxWidth()}px`;
    this.container.style.left = '0px';
    this.container.style.top = '0px';
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '75';
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
    const delta = 1 / (this.ANIMATION_FRAMES_ + 1);
    this.lidOpen_ += this.isLidOpen ? delta : -delta;
    this.lidOpen_ = Math.min(this.lidOpen_, 1);
    this.lidOpen_ = Math.max(this.lidOpen_, 0);

    this.setLidAngle_(this.lidOpen_ * this.MAX_LID_ANGLE_);

    const opacity =
      this.OPACITY_MIN_ +
      this.lidOpen_ * (this.OPACITY_MAX_ - this.OPACITY_MIN_);
    this.svgGroup_.style.opacity = opacity;

    if (this.lidOpen_ >= 0 && this.lidOpen_ < 1) {
      this.lidTask_ = setTimeout(
        this.animateLid_.bind(this),
        this.ANIMATION_LENGTH_ / this.ANIMATION_FRAMES_
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
        openAtRight ? 4 : this.WIDTH_ - 4
      }, ${this.LID_HEIGHT_ - 2})`
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
