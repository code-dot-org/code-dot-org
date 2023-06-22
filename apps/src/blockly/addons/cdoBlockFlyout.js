import GoogleBlockly from 'blockly/core';

const SIZING_BEHAVIOR = {
  FIT_PARENT: 'fitParent',
  FIT_CONTENT: 'fitContent',
};

export default class CdoBlockFlyout extends GoogleBlockly.HorizontalFlyout {
  constructor(workspaceOptions) {
    super(workspaceOptions);
    // this.visible_ = false;
    workspaceOptions.getMetrics = this.getMetrics_.bind(this);
    workspaceOptions.setMetrics = this.setMetrics_.bind(this);
    this.horizontalLayout_ = !0;
    this.sizingBehavior_ =
      workspaceOptions.sizingBehavior || this.sizingBehavior_;
    this.minWidth_ = workspaceOptions.minWidth || this.minWidth_;
    this.maxWidth_ = workspaceOptions.maxWidth || this.maxWidth_;
  }

  autoClose = false;
  sizingBehavior_ = SIZING_BEHAVIOR.FIT_CONTENT;
  minWidth_ = 0;
  maxWidth_ = 1e3;

  getMetrics_() {
    if (!this.isVisible()) return null;
    let blockBoundingBox;
    try {
      blockBoundingBox = this.workspace_.getCanvas().getBBox();
    } catch (e) {
      blockBoundingBox = {
        height: 0,
        y: 0,
        width: 0,
        x: 0,
      };
    }
    let viewHeight = this.height_,
      viewWidth = this.width_ + 2 * this.MARGIN;
    let contentHeight;
    if (this.sizingBehavior_ === SIZING_BEHAVIOR.FIT_CONTENT) {
      contentHeight = viewHeight;
      blockBoundingBox = viewWidth - 1;
    } else
      (contentHeight =
        (blockBoundingBox.height + 2 * this.MARGIN) * this.workspace_.scale),
        (blockBoundingBox =
          (blockBoundingBox.width + this.GAP_X + 2 * this.MARGIN) *
          this.workspace_.scale);
    return {
      viewHeight: viewHeight,
      viewWidth: viewWidth,
      contentHeight: contentHeight,
      contentWidth: blockBoundingBox,
      viewTop: -this.workspace_.scrollY,
      viewLeft: -this.workspace_.scrollX,
      contentTop: 0,
      contentLeft: 0,
      absoluteTop: this.SCROLLBAR_PADDING,
      absoluteLeft: this.SCROLLBAR_PADDING,
    };
  }

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
    var definitions = Blockly.utils.dom.createSvgElement(
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
    return this.svgGroup_;
  }

  /**
   * Initializes the flyout.
   *
   * @param targetWorkspace The workspace in which to
   *     create new blocks.
   */
  init(targetWorkspace) {
    super.init(targetWorkspace);
    this.targetWorkspace_ = targetWorkspace;
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
      var blockHW = block.getHeightWidth();
      this.updateHeight_(blockHW.height);
      this.updateWidth_(blockHW.width);
      block.flyoutRect_ && this.moveRectToBlock_(block.flyoutRect_, block);
    }
    this.width_ = Math.max(
      this.width_,
      this.sourceBlock_.getHeightWidth().width - 36
    );
    // this.height_ += 2 * this.MARGIN;
    this.setBackgroundPath_(this.width_, this.height_);
    this.position();
  }

  updateHeight_(newHeight) {
    this.height_ = Math.max(this.height_, newHeight);
  }

  updateWidth_(newWidth) {
    // this.sizingBehavior_ === SIZING_BEHAVIOR.FIT_CONTENT
    //   ? ((this.width_ += newWidth.width), (this.width_ += this.GAP_X))
    //   : 0 === this.width_ &&
    //     (this.width_ = this.sourceBlock_.getHeightWidth().width - 36);
    this.width_ += newWidth + this.GAP_X;
  }

  /** Move the flyout */
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
    var path = [
      'M 0,' +
        (this.toolboxPosition_ === Blockly.TOOLBOX_AT_TOP
          ? 0
          : this.CORNER_RADIUS),
    ];
    path.push(
      'a',
      this.CORNER_RADIUS,
      this.CORNER_RADIUS,
      0,
      0,
      1,
      this.CORNER_RADIUS,
      -this.CORNER_RADIUS
    );
    path.push('h', width);
    path.push(
      'a',
      this.CORNER_RADIUS,
      this.CORNER_RADIUS,
      0,
      0,
      1,
      this.CORNER_RADIUS,
      this.CORNER_RADIUS
    );
    path.push('v', height);
    path.push(
      'a',
      this.CORNER_RADIUS,
      this.CORNER_RADIUS,
      0,
      0,
      1,
      -this.CORNER_RADIUS,
      this.CORNER_RADIUS
    );
    path.push('h', -1 * width);
    path.push(
      'a',
      this.CORNER_RADIUS,
      this.CORNER_RADIUS,
      0,
      0,
      1,
      -this.CORNER_RADIUS,
      -this.CORNER_RADIUS
    );
    path.push('z');
    path = path.join(' ');
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
   * this area.
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
