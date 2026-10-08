import * as BlocklyCore from 'blockly/core';

import moduleStyles from './flyout-badges.module.scss';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';
export const BADGE_CLASS = 'spritelab2FlyoutBadge';
// Gap between a block's right edge and its badge.
const GAP_PX = 12;
// A badge centers on the block's first row, whatever the block's height.
const FIRST_ROW_PX = 36;
// The hollow help icon: on its own, or forming the left end of a pill, its
// circle sitting in the pill's curve.
const ICON_PX = 20;
const PILL_HEIGHT_PX = ICON_PX;
const PILL_PADDING_PX = 7;

/** What a flyout block wears: a stamp, a help button, or both in one pill. */
export interface FlyoutBadge {
  /** Short stamp text, such as "New". */
  text?: string;
  /** A bright stamp, for a block worth drawing the eye to; the rest are
      quiet. */
  bright?: boolean;
  /** A help button; the title names it for assistive technology. */
  help?: {title: string};
}

export interface FlyoutBadgeOptions {
  badgeFor: (blockType: string) => FlyoutBadge | undefined;
  /** A help button was pressed; its screen rectangle comes along, for
      placing the callout. */
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

function helpButton(
  title: string,
  className: string,
  onPress: (button: HTMLButtonElement) => void,
  text?: string
): HTMLButtonElement {
  const button = document.createElementNS(
    XHTML_NS,
    'button'
  ) as HTMLButtonElement;
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', `Help: ${title}`);
  // Focus leaving the toolbox tree auto-hides the flyout, badge and all, so
  // the button never takes focus: pointer only, for now.
  button.tabIndex = -1;
  const icon = document.createElementNS(XHTML_NS, 'i');
  icon.className = 'fa-regular fa-circle-question';
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);
  if (text) {
    const label = document.createElementNS(XHTML_NS, 'span');
    label.textContent = text;
    button.appendChild(label);
  }
  // The flyout starts a block drag on any pointerdown that reaches its
  // root; the button is not a block. Default prevented so the press does
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
      if (!badge || (!badge.text && !badge.help)) {
        return;
      }
      const {help, text, bright} = badge;
      const xy = block.getRelativeToSurfaceXY();
      const {height, width} = block.getHeightWidth();
      const x = xy.x + width + GAP_PX;
      const rowMiddle = xy.y + Math.min(height, FIRST_ROW_PX) / 2;
      const open = (button: HTMLButtonElement) =>
        onOpenHelp(block.type, button.getBoundingClientRect());

      if (!text && help) {
        const group = BlocklyCore.utils.dom.createSvgElement(
          BlocklyCore.utils.Svg.G,
          {
            class: BADGE_CLASS,
            transform: `translate(${x}, ${rowMiddle - ICON_PX / 2})`,
          },
          canvas
        );
        const container = BlocklyCore.utils.dom.createSvgElement(
          BlocklyCore.utils.Svg.FOREIGNOBJECT,
          {width: ICON_PX, height: ICON_PX},
          group
        );
        container.appendChild(
          helpButton(help.title, moduleStyles.helpButton, open)
        );
        badgesRight = Math.max(badgesRight, x + ICON_PX);
        return;
      }

      const tone = bright ? moduleStyles.bright : moduleStyles.quiet;
      if (help) {
        // A stamp with help is one button: the whole pill opens the callout.
        const group = BlocklyCore.utils.dom.createSvgElement(
          BlocklyCore.utils.Svg.G,
          {
            class: BADGE_CLASS,
            transform: `translate(${x}, ${rowMiddle - PILL_HEIGHT_PX / 2})`,
          },
          canvas
        );
        const container = BlocklyCore.utils.dom.createSvgElement(
          BlocklyCore.utils.Svg.FOREIGNOBJECT,
          {width: 1, height: PILL_HEIGHT_PX},
          group
        );
        const button = helpButton(
          help.title,
          `${moduleStyles.pillButton} ${tone}`,
          open,
          text
        );
        container.appendChild(button);
        // Sized by its own text; the foreignObject must be told.
        const pillWidth = Math.ceil(button.getBoundingClientRect().width);
        container.setAttribute('width', String(pillWidth));
        badgesRight = Math.max(badgesRight, x + pillWidth);
        return;
      }

      const group = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.G,
        {
          class: `${BADGE_CLASS} ${moduleStyles.stamp} ${tone}`,
          transform: `translate(${x}, ${rowMiddle - PILL_HEIGHT_PX / 2})`,
        },
        canvas
      );
      group.setAttribute('aria-hidden', 'true');
      const rect = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.RECT,
        {
          height: PILL_HEIGHT_PX,
          rx: PILL_HEIGHT_PX / 2,
          ry: PILL_HEIGHT_PX / 2,
        },
        group
      );
      const label = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.TEXT,
        {
          x: PILL_PADDING_PX,
          y: PILL_HEIGHT_PX / 2,
          'dominant-baseline': 'central',
        },
        group
      );
      label.textContent = text ?? '';
      const pillWidth =
        PILL_PADDING_PX * 2 + Math.ceil(label.getComputedTextLength());
      rect.setAttribute('width', String(pillWidth));
      badgesRight = Math.max(badgesRight, x + pillWidth);
    });
    fitFlyout(badgesRight);
  };

  // Blockly sizes the flyout to its blocks; a badge past the widest block
  // would be clipped. Widen it the way reflowInternal_ does, under the same
  // cap CdoVerticalFlyout applies (40% of the workspace).
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
