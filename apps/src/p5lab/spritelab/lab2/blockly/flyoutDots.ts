import * as BlocklyCore from 'blockly/core';

import moduleStyles from './flyout-dots.module.scss';

export const DOT_CLASS = 'spritelab2FlyoutDot';
// When a block's first row cannot be measured, the dot centers this far
// down it.
const FIRST_ROW_PX = 36;
const DOT_RADIUS_PX = 3.5;

/**
 * Put a dot in the flyout's margin beside each block `dotFor` names, and
 * keep them in place as the flyout shows other categories or re-lays out.
 * Returns a disposer. Dots are SVG children of the flyout's block canvas,
 * so they scroll with the blocks.
 */
export function installFlyoutDots(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  dotFor: (blockType: string) => boolean
): () => void {
  if (!workspace) {
    return () => undefined;
  }
  const flyouts = new Set(
    [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()].filter(
      (f): f is BlocklyCore.IFlyout => !!f
    )
  );
  const disposers = [...flyouts].map(flyout => decorateFlyout(flyout, dotFor));
  return () => disposers.forEach(dispose => dispose());
}

// How far down a block its first row's middle sits, in the block's own
// units: measured from its first field, since a hat or a notch above the
// row makes the block's top a poor guide.
function firstRowMiddle(block: BlocklyCore.BlockSvg, height: number): number {
  const field = block.inputList[0]?.fieldRow[0];
  const fieldRect = field?.getSvgRoot()?.getBoundingClientRect();
  const blockRect = block.getSvgRoot().getBoundingClientRect();
  if (!fieldRect || !fieldRect.height || !blockRect.height) {
    return Math.min(height, FIRST_ROW_PX) / 2;
  }
  const scale = blockRect.height / height;
  return (fieldRect.top + fieldRect.height / 2 - blockRect.top) / scale;
}

function decorateFlyout(
  flyout: BlocklyCore.IFlyout,
  dotFor: (blockType: string) => boolean
): () => void {
  const flyoutWorkspace = flyout.getWorkspace();
  const clear = () =>
    flyoutWorkspace
      .getCanvas()
      .querySelectorAll(`.${DOT_CLASS}`)
      .forEach(element => element.remove());

  const decorate = () => {
    clear();
    const canvas = flyoutWorkspace.getCanvas();
    flyoutWorkspace.getTopBlocks(false).forEach(block => {
      if (!dotFor(block.type)) {
        return;
      }
      const xy = block.getRelativeToSurfaceXY();
      const {height} = block.getHeightWidth();
      // Centered in the margin between the flyout's edge and the block.
      BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.CIRCLE,
        {
          class: `${DOT_CLASS} ${moduleStyles.dot}`,
          cx: xy.x / 2,
          cy: xy.y + firstRowMiddle(block, height),
          r: DOT_RADIUS_PX,
        },
        canvas
      );
    });
  };

  // Blockly lays the flyout out inside show() and reflow(); dots follow
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
