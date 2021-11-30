import GoogleBlockly from 'blockly/core';

export default class CdoTrashcan extends GoogleBlockly.DeleteArea {
  constructor(workspace) {
    super();
    this.workspace = workspace;
    this.id = 'cdoTrashcan';

    this.WIDTH_ = 47;
    this.BODY_HEIGHT_ = 44;
    this.LID_HEIGHT_ = 16;
    this.SPRITE_LEFT_ = 0;
    this.SPRITE_TOP_ = 32;
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
    this.position(this.workspace.getMetricsManager().getUiMetrics());
    this.createTrashcanSvg();

    svg.parentNode.insertBefore(this.container, svg);

    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 1,
      capabilities: [
        Blockly.ComponentManager.Capability.DELETE_AREA,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE
      ]
    });
    this.workspace.recordDragTargets();
  }

  createTrashcanSvg() {
    const svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {class: 'blocklyTrash'},
      this.container
    );
    svgGroup_.setAttribute(
      'transform',
      `translate(${this.workspace.getToolboxWidth() / 2 - this.WIDTH_ / 2}, 40)`
    );

    // Trash can body
    const bodyClipPath = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {id: 'blocklyTrashBodyClipPath'},
      svgGroup_
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
      svgGroup_
    );
    body.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      this.TRASH_URL
    );

    // Trash can lid
    const lidClipPath = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {id: 'blocklyTrashLidClipPath'},
      svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {width: this.WIDTH_, height: this.LID_HEIGHT_},
      lidClipPath
    );
    const lid = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: Blockly.SPRITE.width,
        x: -this.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashLidClipPath)'
      },
      svgGroup_
    );
    lid.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      this.TRASH_URL
    );

    // not allowed symbol for undeletable blocks. Circle with line through it
    // Store on the instance so that we can show/hide it separately from the rest of the trashcan.
    this.notAllowed_ = Blockly.utils.dom.createSvgElement('g', {}, svgGroup_);
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

    return svgGroup_;
  }

  workspaceChangeHandler(blocklyEvent) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      // blocklyEvent.isStart is true when the drag starts, false when the drag ends.
      const trashcanVisibility = blocklyEvent.isStart ? 'visible' : 'hidden';
      const toolboxVisibility = blocklyEvent.isStart ? 'hidden' : 'visible';

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

      // Show the not allowed symbol if the trashcan is visible and
      // any of the dragging blocks are undeletable. Otherwise, hide it.
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
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics) {
    this.container.style.height = metrics.viewMetrics.height + 'px';
    this.container.style.width = this.workspace.getToolboxWidth() + 'px';
    this.container.style.left = '0px';
    this.container.style.top = '0px';
    this.container.style.position = 'absolute';
    // Should be above toolbox but under drag surface
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
   * IDragTarget method
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragEnter(_dragElement) {}

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
  onDragExit(_dragElement) {}

  /**
   * IDragTarget method
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDrop(_dragElement) {}

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
