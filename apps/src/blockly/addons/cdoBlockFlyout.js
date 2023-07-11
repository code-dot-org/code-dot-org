import GoogleBlockly from 'blockly/core';

export default class CdoBlockFlyout extends GoogleBlockly.HorizontalFlyout {
  /**
   * This is a customized flyout class that extends the HorizontalFlyout class.
   * This flyout is intended to be place inside of a block's FieldFlyout.
   *
   * @param {Object} workspaceOptions - The options for constructing the class.
   */
  constructor(workspaceOptions) {
    super(workspaceOptions);
    this.horizontalLayout_ = !0;
    this.minWidth_ = workspaceOptions.minWidth || this.minWidth_;
    this.maxWidth_ = workspaceOptions.maxWidth || this.maxWidth_;
  }

  autoClose = false;
  minWidth_ = 0;
  maxWidth_ = 1000;

  /**
   * @returns True if this flyout may be scrolled with a scrollbar or
   *     by dragging.
   */
  isScrollable() {
    return false;
  }

  /**
   * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
   * either exist as its own SVG element or be a g element nested inside a
   * separate SVG element.
   *
   * @param tagName The type of tag to
   *     put the flyout in. This should be <svg> or <g>.
   * @returns The flyout's SVG group.
   */
  createDom(tagName) {
    super.createDom(tagName);
    tagName =
      'flyoutClip' +
      Blockly.utils.idGenerator.genUid().replace(/([\(\)])/g, '');
    let definitions = Blockly.utils.dom.createSvgElement(
      'defs',
      {},
      this.svgGroup_
    );
    definitions = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {
        id: tagName,
      },
      definitions
    );
    this.svgClipPath_ = Blockly.utils.dom.createSvgElement(
      'path',
      {},
      definitions
    );
    this.svgGroup_.setAttribute('clip-path', 'url(#' + tagName + ')');
    this.svgGroup_.classList.add('blockFieldFlyout');
    return this.svgGroup_;
  }

  /**
   * Compute height of flyout.  Position mat under each block.
   * For RTL: Lay out the blocks right-aligned.
   */
  reflowInternal_() {
    this.height_ = 0;
    this.width_ = 0;
    const topBlocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = topBlocks[i]); i++) {
      const blockHW = block.getHeightWidth();
      this.updateHeight_(blockHW.height);
      this.updateWidth_(blockHW.width);
      if (this.rectMap_.has(block)) {
        this.moveRectToBlock_(this.rectMap_.get(block), block);
      }
    }
    // We need to set the flyout width based on the block itself, excluding children.
    // Using block.getHeightWidth() would include blocks connected to input and next
    // connections, which could make the flyout wider than the block that contains it.
    const topBlockWidth = this.sourceBlock_.svgGroup_
      .querySelector('path')
      .getBoundingClientRect().width;
    this.width_ = Math.max(this.width_, topBlockWidth - 36);
    this.setBackgroundPath_(this.width_, this.height_);
    this.position();
  }

  /** Update the flyout height based on the new block height.
   *
   * @param {number} newHeight - The new block height.
   * @private
   */
  updateHeight_(newHeight) {
    this.height_ = Math.max(this.height_, newHeight);
  }
  /**
   * Update the flyout width based on the new block width.
   *
   * @param {number} newWidth - The new block width.
   * @private
   */
  updateWidth_(newWidth) {
    this.width_ += newWidth + this.GAP_X;
  }

  /**
   * Position the flyout.
   */
  position() {
    this.isVisible() && this.positionAt_(this.width_, this.height_, 0, 0);
  }

  /**
   * Create and set the path for the visible boundaries of the flyout.
   *
   * @param width The width of the flyout, not including the rounded corners.
   * @param height The height of the flyout, not including rounded corners.
   */
  setBackgroundPath_(width, height) {
    const svgPaths = GoogleBlockly.utils.svgPaths;
    let path = svgPaths.moveTo(
      this.RTL ? width : 0,
      this.toolboxPosition_ === Blockly.TOOLBOX_AT_TOP ? 0 : this.CORNER_RADIUS
    );

    path += svgPaths.curve('a', [
      svgPaths.point(this.CORNER_RADIUS, this.CORNER_RADIUS),
      this.RTL ? ' 0 0 0 ' : ' 0 0 1 ',
      svgPaths.point(
        this.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
        -this.CORNER_RADIUS
      ),
    ]);

    path += svgPaths.lineOnAxis('h', this.RTL ? -width : width);

    path += svgPaths.curve('a', [
      svgPaths.point(this.CORNER_RADIUS, this.CORNER_RADIUS),
      this.RTL ? ' 0 0 0 ' : ' 0 0 1 ',
      svgPaths.point(
        this.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
        this.CORNER_RADIUS
      ),
    ]);

    path += svgPaths.lineOnAxis('v', height);

    path += svgPaths.curve('a', [
      svgPaths.point(this.CORNER_RADIUS, this.CORNER_RADIUS),
      this.RTL ? ' 0 0 0 ' : ' 0 0 1 ',
      svgPaths.point(
        this.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
        this.CORNER_RADIUS
      ),
    ]);

    path += svgPaths.lineOnAxis('h', this.RTL ? width : -width);

    path += svgPaths.curve('a', [
      svgPaths.point(this.CORNER_RADIUS, this.CORNER_RADIUS),
      this.RTL ? ' 0 0 0 ' : ' 0 0 1 ',
      svgPaths.point(
        this.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
        -this.CORNER_RADIUS
      ),
    ]);

    path += 'z';

    this.svgClipPath_.setAttribute('d', path);
    this.svgBackground_.setAttribute('d', path);
  }

  /**
   * Attach this field to a block.
   *
   * @param block The block containing this field.
   */
  setSourceBlock_(block) {
    this.sourceBlock_ = block;
  }

  /**
   * Returns whether the provided block or bubble would be deleted if dropped on
   * this area. Mini-toolboxes should never be used to delete blocks.
   * The original method checks if the element is deletable and is always called
   * before onDragEnter/onDragOver/onDragExit.
   *
   * @param element The block or bubble currently being dragged.
   * @param couldConnect Whether the element could could connect to another.
   * @returns Whether the element provided would be deleted if dropped on this
   *     area.
   */
  wouldDelete(element, _couldConnect) {
    return false;
  }
}
