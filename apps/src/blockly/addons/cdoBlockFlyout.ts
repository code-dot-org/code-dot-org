import GoogleBlockly, {Block, IDraggable, Options} from 'blockly/core';
import {FlyoutItem} from 'blockly/core/flyout_base';
import {Svg} from 'blockly/core/utils';

import {ExtendedWorkspaceSvg} from '../types';

const svgPaths = GoogleBlockly.utils.svgPaths;
interface CdoBlockFlyoutOptions extends Options {
  minWidth: number;
  maxWidth: number;
  parentBlock: Block | null;
}

export default class CdoBlockFlyout extends GoogleBlockly.HorizontalFlyout {
  private svgClipPath_: SVGElement | undefined;
  parentBlock: GoogleBlockly.Block | null;

  /**
   * This is a customized flyout class that extends the HorizontalFlyout class.
   * This flyout is intended to be placed inside of a block's FieldFlyout.
   *
   * @param workspaceOptions - The options for constructing the class.
   */
  constructor(workspaceOptions: CdoBlockFlyoutOptions) {
    super(workspaceOptions);
    this.parentBlock = workspaceOptions.parentBlock;
    this.minWidth_ = workspaceOptions.minWidth || this.minWidth_;
    this.maxWidth_ = workspaceOptions.maxWidth || this.maxWidth_;
    (this.workspace_ as ExtendedWorkspaceSvg).flyoutParentBlock =
      this.parentBlock;
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
  createDom(tagName: string | Svg<SVGSVGElement> | Svg<SVGGElement>) {
    // super.createDom returns this.svgGroup_. Explicitly setting it here
    // so that TypeScript knows it is not null.
    this.svgGroup_ = super.createDom(tagName) as SVGGElement;
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
    // Adjust the size of the flyout for each block.
    topBlocks.forEach(block => {
      const blockHW = block.getHeightWidth();
      this.updateHeight_(blockHW.height);
      this.updateWidth_(blockHW.width);

      const rect = this.rectMap_.get(block);
      if (rect) {
        this.moveRectToBlock_(rect, block);
      }
    });
    // Adjust the size of the flyout for each button.
    this.buttons_.forEach(button => {
      this.updateHeight_(button.height);
      this.updateWidth_(button.width);
    });
    this.setBackgroundPath_(this.width_, this.height_);
    this.position();
  }

  /** Update the flyout height based on the new block height.
   *
   * @param {number} newHeight - The new block height.
   * @private
   */
  updateHeight_(newHeight: number) {
    this.height_ = Math.max(this.height_, newHeight);
  }
  /**
   * Update the flyout width based on the new block width.
   *
   * @param {number} newWidth - The new block width.
   * @private
   */
  updateWidth_(newWidth: number) {
    this.width_ += newWidth + this.GAP_X;
  }

  /**
   * Position the flyout.
   * @override
   */
  position() {
    this.isVisible() && this.positionAt_(this.width_, this.height_, 0, 0);
  }

  /**
   * Create and set the path for the visible boundaries of the flyout.
   *
   * @param {number} width The width of the flyout, not including the rounded corners.
   * @param {number} height The height of the flyout, not including rounded corners.
   * @override
   */
  setBackgroundPath_(width: number, height: number) {
    if (!this.svgClipPath_ || !this.svgBackground_) {
      return;
    }
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
  createCornerPath(cornerEndPosition: string) {
    return svgPaths.arc('a', '0,0,1', this.CORNER_RADIUS, cornerEndPosition);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wouldDelete(_element: IDraggable, _couldConnect: boolean) {
    return false;
  }

  /**
   * Lay out the blocks in the flyout.
   *
   * @param contents The blocks and buttons to lay out.
   * @param gaps The visible gaps between blocks.
   * @override
   */
  // This is copied from the core blockly repo to include a fix from this PR on Blockly:
  // https://github.com/google/blockly/pull/7333
  // This fix has since been reverted due to rtl rendering issues, but it works for this use case
  // (and in fact fixes our rtl rendering issues).
  // The link for the tracked issue is here:
  // https://github.com/google/blockly/issues/6280
  // If the issue is fixed we may be able to get rid of this override.
  layout_(contents: FlyoutItem[], gaps: number[]) {
    this.workspace_.scale = this.targetWorkspace?.scale;
    const margin = this.MARGIN;
    let cursorX = margin + this.tabWidth_;
    const cursorY = margin;
    if (this.RTL) {
      contents = contents.reverse();
    }

    for (let i = 0, item; (item = contents[i]); i++) {
      if (item.block) {
        const block = item.block;
        const allBlocks = block?.getDescendants(false);
        for (let j = 0, child; (child = allBlocks[j]); j++) {
          // Mark blocks as being inside a flyout.  This is used to detect and
          // prevent the closure of the flyout if the user right-clicks on such
          // a block.
          child.isInFlyout = true;
        }
        const root = block?.getSvgRoot();
        const blockHW = block?.getHeightWidth();
        // Figure out where to place the block.
        const tab = block?.outputConnection ? this.tabWidth_ : 0;
        let moveX;
        if (this.RTL) {
          moveX = cursorX + blockHW.width;
        } else {
          moveX = cursorX - tab;
        }
        // No 'reason' provided since events are disabled.
        block?.moveTo(new Blockly.utils.Coordinate(moveX, cursorY));

        const rect = this.createRect_(block, moveX, cursorY, blockHW, i);
        cursorX += blockHW.width + gaps[i];

        this.addBlockListeners_(root, block, rect);
      } else if (item.button) {
        const button = item.button;
        this.initFlyoutButton_(button, cursorX, cursorY);
        cursorX += button.width + gaps[i];
      }
    }
  }
}
