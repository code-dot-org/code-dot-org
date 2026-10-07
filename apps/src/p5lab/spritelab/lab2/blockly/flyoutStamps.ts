import * as BlocklyCore from 'blockly/core';

import moduleStyles from './flyout-stamps.module.scss';

const STAMP_HEIGHT_PX = 18;
const STAMP_PADDING_PX = 6;
// Width per character of the stamp's bold 11px text.
const CHAR_PX = 7;
// Gap between a block's right edge and its stamp.
const GAP_PX = 12;
// The stamp centers on the block's first row, whatever the block's height.
const FIRST_ROW_PX = 36;
const STAMP_CLASS = 'spritelab2FlyoutStamp';

/**
 * Put a small text stamp beside each flyout block `stampFor` names, and keep
 * them in place as the flyout shows other categories or re-lays out. Returns
 * a disposer. The stamps are SVG children of the flyout's block canvas, so
 * they scroll with the blocks and start no drag.
 */
export function installFlyoutStamps(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  stampFor: (blockType: string) => string | undefined
): () => void {
  if (!workspace) {
    return () => undefined;
  }
  const flyouts = new Set(
    [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()].filter(
      (f): f is BlocklyCore.IFlyout => !!f
    )
  );
  const disposers = [...flyouts].map(flyout =>
    decorateFlyout(flyout, stampFor)
  );
  return () => disposers.forEach(dispose => dispose());
}

function decorateFlyout(
  flyout: BlocklyCore.IFlyout,
  stampFor: (blockType: string) => string | undefined
): () => void {
  const flyoutWorkspace = flyout.getWorkspace();
  const clear = () =>
    flyoutWorkspace
      .getCanvas()
      .querySelectorAll(`.${STAMP_CLASS}`)
      .forEach(element => element.remove());

  const decorate = () => {
    clear();
    const canvas = flyoutWorkspace.getCanvas();
    flyoutWorkspace.getTopBlocks(false).forEach(block => {
      const label = stampFor(block.type);
      if (!label) {
        return;
      }
      const xy = block.getRelativeToSurfaceXY();
      const {height, width} = block.getHeightWidth();
      const x = xy.x + width + GAP_PX;
      const y = xy.y + Math.min(height, FIRST_ROW_PX) / 2 - STAMP_HEIGHT_PX / 2;
      const stampWidth = label.length * CHAR_PX + STAMP_PADDING_PX * 2;
      const group = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.G,
        {
          class: `${STAMP_CLASS} ${moduleStyles.stamp}`,
          transform: `translate(${x}, ${y})`,
        },
        canvas
      );
      BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.RECT,
        {
          width: stampWidth,
          height: STAMP_HEIGHT_PX,
          rx: STAMP_HEIGHT_PX / 2,
          ry: STAMP_HEIGHT_PX / 2,
        },
        group
      );
      const text = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.TEXT,
        {
          x: stampWidth / 2,
          y: STAMP_HEIGHT_PX / 2,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
        },
        group
      );
      text.textContent = label;
    });
  };

  // Blockly lays the flyout out inside show() and reflow(); stamps follow
  // both.
  const {show, reflow} = flyout;
  flyout.show = function (def) {
    show.call(this, def);
    decorate();
  };
  flyout.reflow = function () {
    reflow.call(this);
    decorate();
  };
  if (flyout.isVisible()) {
    decorate();
  }
  return () => {
    flyout.show = show;
    flyout.reflow = reflow;
    clear();
  };
}
