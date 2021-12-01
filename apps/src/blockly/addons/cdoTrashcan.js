import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';

export default class CdoTrashcan extends GoogleBlockly.Trashcan {
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

CdoTrashcan.TRASH_URL = '/blockly/media/trash.png';
