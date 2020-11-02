import GoogleBlockly from 'blockly/core';

export default class CdoTrashcan extends GoogleBlockly.Trashcan {
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

  /** Position over the toolbox instead of the bottom corner
   * @override
   */
  position() {
    // Not yet initialized.
    if (!this.verticalSpacing_) {
      return;
    }
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
      // There are no metrics available (workspace is probably not visible).
      return;
    }

    this.left_ = Math.round(metrics.flyoutWidth / 2 - this.WIDTH_ / 2);
    this.top_ = this.verticalSpacing_;

    this.svgGroup_.setAttribute(
      'transform',
      'translate(' + this.left_ + ',' + this.top_ + ')'
    );
  }

  setDisabled(disabled) {
    const visibility = disabled ? 'visible' : 'hidden';
    this.notAllowed_.setAttribute('visibility', visibility);
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

  /** Also hide trashcan on delete
   * @override
   */
  onDelete_(event) {
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      this.workspace_.hideTrashcan();
    }
    super.onDelete_(event);
  }
}

CdoTrashcan.TRASH_URL = '/blockly/media/trash.png';
