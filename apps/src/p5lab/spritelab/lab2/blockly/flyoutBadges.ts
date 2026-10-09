import * as BlocklyCore from 'blockly/core';

import moduleStyles from './flyout-badges.module.scss';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';
export const BADGE_CLASS = 'spritelab2FlyoutBadge';
// Gap between a block's right edge and its badge.
const GAP_PX = 12;
// When a block's first row cannot be measured, the badge centers this far
// down it.
const FIRST_ROW_PX = 36;
const BADGE_PX = 20;

/** A new block's badge: a filled circle with a question mark that opens
    the block's help. Bright for a standout, quiet otherwise. */
export interface FlyoutBadge {
  title: string;
  bright?: boolean;
}

export interface FlyoutBadgeOptions {
  badgeFor: (blockType: string) => FlyoutBadge | undefined;
  /** A badge was pressed; its screen rectangle comes along, for placing
      the callout. */
  onOpenHelp: (blockType: string, anchor: DOMRect) => void;
  /** The flyout changed under an open callout (scrolled, re-laid out,
      closed). */
  onInvalidate: () => void;
}

/**
 * Put a badge beside each flyout block `badgeFor` names, and keep them in
 * place as the flyout shows other categories or re-lays out. Returns a
 * disposer. Badges are SVG children of the flyout's block canvas, so they
 * scroll with the blocks.
 */
export function installFlyoutBadges(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  options: FlyoutBadgeOptions
): () => void {
  if (!workspace) {
    return () => undefined;
  }
  const flyouts = new Set(
    [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()].filter(
      (f): f is BlocklyCore.IFlyout => !!f
    )
  );
  const disposers = [...flyouts].map(flyout => decorateFlyout(flyout, options));
  return () => disposers.forEach(dispose => dispose());
}

function badgeButton(
  badge: FlyoutBadge,
  onPress: (button: HTMLButtonElement) => void
): HTMLButtonElement {
  const button = document.createElementNS(
    XHTML_NS,
    'button'
  ) as HTMLButtonElement;
  button.type = 'button';
  button.className = `${moduleStyles.badge} ${
    badge.bright ? moduleStyles.bright : moduleStyles.quiet
  }`;
  button.setAttribute('aria-label', `New block. Help: ${badge.title}`);
  // Focus leaving the toolbox tree auto-hides the flyout, badge and all, so
  // the button never takes focus: pointer only, for now.
  button.tabIndex = -1;
  const icon = document.createElementNS(XHTML_NS, 'i');
  icon.className = 'fa-solid fa-question';
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);
  // The flyout starts a block drag on any pointerdown that reaches its
  // root; the badge is not a block. Default prevented so the press does
  // not focus the button (see above).
  button.addEventListener('pointerdown', e => {
    e.stopPropagation();
    e.preventDefault();
  });
  button.addEventListener('click', e => {
    e.stopPropagation();
    onPress(button);
  });
  return button;
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
  {badgeFor, onOpenHelp, onInvalidate}: FlyoutBadgeOptions
): () => void {
  const flyoutWorkspace = flyout.getWorkspace();
  const clear = () =>
    flyoutWorkspace
      .getCanvas()
      .querySelectorAll(`.${BADGE_CLASS}`)
      .forEach(element => element.remove());

  const decorate = () => {
    clear();
    const canvas = flyoutWorkspace.getCanvas();
    // The right edge of the widest badge, in flyout coordinates.
    let badgesRight = 0;
    flyoutWorkspace.getTopBlocks(false).forEach(block => {
      const badge = badgeFor(block.type);
      if (!badge) {
        return;
      }
      const xy = block.getRelativeToSurfaceXY();
      const {height, width} = block.getHeightWidth();
      const x = xy.x + width + GAP_PX;
      const y = xy.y + firstRowMiddle(block, height) - BADGE_PX / 2;
      const group = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.G,
        {class: BADGE_CLASS, transform: `translate(${x}, ${y})`},
        canvas
      );
      const container = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.FOREIGNOBJECT,
        {width: BADGE_PX, height: BADGE_PX},
        group
      );
      container.appendChild(
        badgeButton(badge, button =>
          onOpenHelp(block.type, button.getBoundingClientRect())
        )
      );
      badgesRight = Math.max(badgesRight, x + BADGE_PX);
    });
    fitFlyout(badgesRight);
  };

  // Blockly sizes the flyout to its blocks; a badge's overhang past the
  // widest block would be clipped. Widen it the way reflowInternal_ does,
  // under the same cap CdoVerticalFlyout applies (40% of the workspace).
  const fitFlyout = (badgesRight: number) => {
    const base = flyout as BlocklyCore.Flyout;
    const scale = flyoutWorkspace.scale;
    const needed =
      (badgesRight + base.MARGIN * 1.5) * scale +
      BlocklyCore.Scrollbar.scrollbarThickness;
    const cap =
      base.targetWorkspace.getMetricsManager().getSvgMetrics().width * 0.4;
    const width = Math.min(needed, cap);
    if (width <= base.getWidth()) {
      return;
    }
    (base as unknown as {width_: number}).width_ = width;
    base.position();
    BlocklyCore.svgResize(flyoutWorkspace);
    base.targetWorkspace.resizeContents();
    base.targetWorkspace.recordDragTargets();
  };

  // Blockly lays the flyout out inside show() and reflow(); badges follow
  // both. Either also moves the blocks an open callout points at.
  const {show, hide, reflow} = flyout;
  flyout.show = function (def) {
    show.call(this, def);
    onInvalidate();
    decorate();
  };
  flyout.hide = function () {
    hide.call(this);
    onInvalidate();
  };
  flyout.reflow = function () {
    reflow.call(this);
    onInvalidate();
    decorate();
  };
  // Scrolling the flyout moves the blocks but fires no Blockly event.
  const svg = flyoutWorkspace.getParentSvg();
  svg.addEventListener('wheel', onInvalidate, {passive: true});

  if (flyout.isVisible()) {
    decorate();
  }
  return () => {
    flyout.show = show;
    flyout.hide = hide;
    flyout.reflow = reflow;
    svg.removeEventListener('wheel', onInvalidate);
    clear();
  };
}
