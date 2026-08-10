// A flyout that lives INSIDE a block, rather than beside the workspace.
//
// The one property that matters: it is a real `HorizontalFlyout`, and `init`
// points it at the block's own workspace. So dragging a block out of it is the
// ordinary toolbox drag, and the block lands in the workspace. That is what a
// mutator bubble cannot do — a bubble targets its own hidden mini-workspace, so
// nothing can come out of one — and it is the whole reason this exists.
//
// Rendered into a `<g>` rather than its own `<svg>`, so it can be a field's
// content. Clipped to its own rounded background, because a flyout draws blocks
// wherever it likes and a field has to occupy a rectangle somebody else laid
// out.
//
// Ported from `apps/src/blockly/addons/cdoBlockFlyout`, which Sprite Lab has
// used for years under the name "mini toolbox". The port drops nothing of the
// mechanism; what it drops is the caller's half — see `miniToolbox`.

import * as Blockly from 'blockly/core';

const svgPaths = Blockly.utils.svgPaths;

export interface BlockFlyoutOptions extends Blockly.Options {
  minWidth: number;
  maxWidth: number;
  parentBlock: Blockly.Block | null;
}

export class BlockFlyout extends Blockly.HorizontalFlyout {
  private svgClipPath: SVGElement | undefined;
  parentBlock: Blockly.Block | null;

  override autoClose = false;
  minWidth_ = 0;
  maxWidth_ = 1000;

  constructor(options: BlockFlyoutOptions) {
    super(options);
    this.parentBlock = options.parentBlock;
    this.minWidth_ = options.minWidth || this.minWidth_;
    this.maxWidth_ = options.maxWidth || this.maxWidth_;
  }

  /** Never: the flyout is as big as its contents, inside a block. */
  override isScrollable(): boolean {
    return false;
  }

  /**
   * A `<g>` with a clip path, so it can sit inside a field.
   *
   * A flyout normally owns an `<svg>` and scrolls; this one is a shape on the
   * block. The clip is what keeps a block that renders wider than the flyout
   * from spilling over whatever the block draws next.
   */
  override createDom(
    tagName:
      | string
      | Blockly.utils.Svg<SVGSVGElement>
      | Blockly.utils.Svg<SVGGElement>,
  ): SVGElement {
    this.svgGroup_ = super.createDom(tagName) as SVGGElement;
    const clipId = `flyoutClip${Blockly.utils.idGenerator
      .genUid()
      .replace(/[()]/g, '')}`;
    const defs = Blockly.utils.dom.createSvgElement('defs', {}, this.svgGroup_);
    const clipPath = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {id: clipId},
      defs,
    );
    this.svgClipPath = Blockly.utils.dom.createSvgElement('path', {}, clipPath);
    this.svgGroup_.setAttribute('clip-path', `url(#${clipId})`);
    this.svgGroup_.classList.add('blockFieldFlyout');
    return this.svgGroup_;
  }

  /**
   * Measure the flyout from what is in it.
   *
   * Horizontal: the width is the blocks' widths plus a gap each, and the height
   * is the tallest of them. The base class measures against a workspace-sized
   * area, which is not what a field has.
   */
  override reflowInternal_(): void {
    this.height_ = 0;
    this.width_ = 0;
    for (const block of this.workspace_.getTopBlocks(false)) {
      const size = block.getHeightWidth();
      this.height_ = Math.max(this.height_, size.height);
      this.width_ += size.width + this.GAP_X;
    }
    for (const item of this.contents.filter(
      each => each.getType() === 'button',
    )) {
      const {top, bottom, left, right} = item
        .getElement()
        .getBoundingRectangle();
      this.height_ = Math.max(this.height_, bottom - top);
      this.width_ += right - left + this.GAP_X;
    }
    this.paintBackground(this.width_, this.height_);
    this.position();
  }

  override position(): void {
    if (this.isVisible()) {
      this.positionAt_(this.width_, this.height_, 0, 0);
    }
  }

  /**
   * A rounded rectangle, used as both the background and the clip.
   *
   * Our own rather than an override: Blockly 13 made `setBackgroundPath`
   * private, so a subclass cannot replace it — and a horizontal flyout's own
   * background is a tab-and-notch shape meant for the edge of a workspace,
   * which is not what a rectangle inside a block should look like. `reflow`
   * calls this instead, after measuring.
   */
  private paintBackground(width: number, height: number): void {
    if (!this.svgClipPath || !this.svgBackground_) {
      return;
    }
    const r = this.CORNER_RADIUS;
    const corner = (dx: number, dy: number) =>
      svgPaths.arc('a', '0,0,1', r, svgPaths.point(dx, dy));
    const path = [
      svgPaths.moveTo(0, r),
      corner(r, -r),
      svgPaths.lineOnAxis('h', width),
      corner(r, r),
      svgPaths.lineOnAxis('v', height),
      corner(-r, r),
      svgPaths.lineOnAxis('h', -width),
      corner(-r, -r),
      'z',
    ].join('');
    this.svgClipPath.setAttribute('d', path);
    this.svgBackground_.setAttribute('d', path);
  }

  /**
   * Never a bin.
   *
   * A flyout is normally somewhere you can throw a block away — drag one back
   * to the toolbox and it is gone. Inside a block that is a trap: the flyout is
   * sitting in the middle of the code being written, so anything dropped near
   * it while aiming for a socket would vanish.
   */
  override wouldDelete(_element: Blockly.IDraggable): boolean {
    return false;
  }
}
