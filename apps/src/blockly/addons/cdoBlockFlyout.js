import GoogleBlockly from 'blockly/core';

const svgPaths = GoogleBlockly.utils.svgPaths;
export default class CdoBlockFlyout extends GoogleBlockly.HorizontalFlyout {
  /**
   * This is a customized flyout class that extends the HorizontalFlyout class.
   * This flyout is intended to be placed inside of a block's FieldFlyout.
   *
   * @param {Object} workspaceOptions - The options for constructing the class.
   */
  constructor(workspaceOptions) {
    super(workspaceOptions);
    this.horizontalLayout_ = true;
    this.minWidth_ = workspaceOptions.minWidth || this.minWidth_;
    this.maxWidth_ = workspaceOptions.maxWidth || this.maxWidth_;
    this.flyoutBlockPadding = 18;
  }

  autoClose = false;
  minWidth_ = 0;
  maxWidth_ = 1000;

  /**
   * @returns True if this flyout may be scrolled with a scrollbar or
   *     by dragging.
   * @override
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
   * @override
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
   * @override
   */
  reflowInternal_() {
    this.height_ = 0;
    this.width_ = 0;
    const topBlocks = this.workspace_.getTopBlocks(false);
    topBlocks.forEach(block => {
      const blockHW = block.getHeightWidth();
      this.updateHeight_(blockHW.height);
      this.updateWidth_(blockHW.width);

      if (this.rectMap_.has(block)) {
        const rect = this.rectMap_.get(block);
        this.moveRectToBlock_(rect, block);
      }
    });

    // We need to set the flyout width based on the block itself, excluding children.
    // Using block.getHeightWidth() would include blocks connected to input and next
    // connections, which could make the flyout wider than the block that contains it.
    const topBlockWidth = this.sourceBlock_.svgGroup_
      .querySelector('path')
      .getBoundingClientRect().width;
    const blockWidthMinusPadding = topBlockWidth - this.flyoutBlockPadding * 2;
    this.width_ = Math.max(this.width_, blockWidthMinusPadding);
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
   * @override
   */
  position() {
    this.isVisible() &&
      this.positionAt_(
        this.width_,
        this.height_,
        this.RTL ? -this.flyoutBlockPadding : 0,
        0
      );
  }

  /**
   * Create and set the path for the visible boundaries of the flyout.
   *
   * @param {number} width The width of the flyout, not including the rounded corners.
   * @param {number} height The height of the flyout, not including rounded corners.
   * @override
   */
  setBackgroundPath_(width, height) {
    const path = [];
    const cornerEndPositions = [
      svgPaths.point(this.CORNER_RADIUS, -this.CORNER_RADIUS),
      svgPaths.point(this.CORNER_RADIUS, this.CORNER_RADIUS),
      svgPaths.point(-this.CORNER_RADIUS, this.CORNER_RADIUS),
      svgPaths.point(-this.CORNER_RADIUS, -this.CORNER_RADIUS),
    ];
    path.push(svgPaths.moveTo(0, this.CORNER_RADIUS));

    path.push(this.createCornerPath(cornerEndPositions[0]));
    path.push(svgPaths.lineOnAxis('h', width));
    path.push(this.createCornerPath(cornerEndPositions[1]));
    path.push(svgPaths.lineOnAxis('v', height));
    path.push(this.createCornerPath(cornerEndPositions[2]));
    path.push(svgPaths.lineOnAxis('h', -width));
    path.push(this.createCornerPath(cornerEndPositions[3]));
    path.push('z');

    this.svgClipPath_.setAttribute('d', path.join(''));
    this.svgBackground_.setAttribute('d', path.join(''));
  }

  /**
   * Creates an SVG arc path command string based on the corner radius
   * of the flyout background.
   *
   * @param {string} cornerEndPosition - The endpoint of the arc path.
   *     It should be in the format 'dx,dy' representing the relative
   *     coordinates from the current position, ex. (8,-8).
   * @returns {string} The SVG arc path command string, ex. 'a 8 8 0,0,1 8,-8'
   * @private
   */
  createCornerPath(cornerEndPosition) {
    return svgPaths.arc('a', '0,0,1', this.CORNER_RADIUS, cornerEndPosition);
  }
  /**
   * Attach this field to a block.
   *
   * @param block The block containing this field.
   * @private
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
   * @override
   */
  wouldDelete(element, _couldConnect) {
    return false;
  }
}
