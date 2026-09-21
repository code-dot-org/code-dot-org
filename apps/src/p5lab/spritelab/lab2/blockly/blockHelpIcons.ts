import * as BlocklyCore from 'blockly/core';

import moduleStyles from './block-help.module.scss';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const ICON_PX = 20;
// Gap between a block's right edge and its icon.
const ICON_GAP_PX = 6;
// The icon centers on the block's first row, whatever the block's height.
const FIRST_ROW_PX = 36;
const ICON_CLASS = 'spritelab2BlockHelpIcon';

export type OpenBlockHelp = (blockType: string, anchor: DOMRect) => void;

interface BlockHelpIconOptions {
  /** The help title for a block type, or nothing: only those get an icon. */
  helpTitle: (blockType: string) => string | undefined;
  onOpen: OpenBlockHelp;
  /** The flyout changed under an open callout (scrolled, re-laid out, closed). */
  onInvalidate: () => void;
}

/**
 * Put a help icon beside each flyout block that has help, and keep them in
 * place as the flyout shows other categories or re-lays out. Returns a
 * disposer. The icons are SVG children of the flyout's block canvas, so they
 * scroll with the blocks.
 */
export function installBlockHelpIcons(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  options: BlockHelpIconOptions
): () => void {
  if (!workspace) {
    return () => undefined;
  }
  const flyouts = [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()]
    .filter((f): f is BlocklyCore.IFlyout => !!f)
    .filter((f, i, all) => all.indexOf(f) === i);
  const disposers = flyouts.map(flyout => decorateFlyout(flyout, options));
  return () => disposers.forEach(dispose => dispose());
}

function decorateFlyout(
  flyout: BlocklyCore.IFlyout,
  {helpTitle, onOpen, onInvalidate}: BlockHelpIconOptions
): () => void {
  const flyoutWorkspace = flyout.getWorkspace();

  const decorate = () => {
    const canvas = flyoutWorkspace.getCanvas();
    canvas
      .querySelectorAll(`.${ICON_CLASS}`)
      .forEach(element => element.remove());
    flyoutWorkspace.getTopBlocks(false).forEach(block => {
      const title = helpTitle(block.type);
      if (!title) {
        return;
      }
      const xy = block.getRelativeToSurfaceXY();
      const {height, width} = block.getHeightWidth();
      const x = xy.x + width + ICON_GAP_PX;
      const y = xy.y + Math.min(height, FIRST_ROW_PX) / 2 - ICON_PX / 2;
      const group = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.G,
        {class: ICON_CLASS, transform: `translate(${x}, ${y})`},
        canvas
      );
      const container = BlocklyCore.utils.dom.createSvgElement(
        BlocklyCore.utils.Svg.FOREIGNOBJECT,
        {width: ICON_PX, height: ICON_PX},
        group
      );
      const button = document.createElementNS(
        XHTML_NS,
        'button'
      ) as HTMLButtonElement;
      button.type = 'button';
      button.className = moduleStyles.helpButton;
      button.setAttribute('aria-label', `Help: ${title}`);
      // Focus leaving the toolbox tree auto-hides the flyout, icon and all,
      // so the icon never takes focus: pointer only, for now.
      button.tabIndex = -1;
      const icon = document.createElementNS(XHTML_NS, 'i');
      icon.className = 'fa-regular fa-circle-question';
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(icon);
      container.appendChild(button);
      // The flyout starts a block drag on any pointerdown that reaches its
      // root; the icon is not a block. Default prevented so the press does
      // not focus the button (see above).
      button.addEventListener('pointerdown', e => {
        e.stopPropagation();
        e.preventDefault();
      });
      button.addEventListener('click', e => {
        e.stopPropagation();
        onOpen(block.type, button.getBoundingClientRect());
      });
    });
  };

  // Blockly lays the flyout out inside show() and reflow(); icons follow
  // both. Either also moves the blocks an open callout points at.
  const patched = flyout as BlocklyCore.IFlyout & {
    show: (def: unknown) => void;
    hide: () => void;
    reflow: () => void;
  };
  const {show, hide, reflow} = patched;
  patched.show = function (def: unknown) {
    show.call(this, def);
    onInvalidate();
    decorate();
  };
  patched.hide = function () {
    hide.call(this);
    onInvalidate();
  };
  patched.reflow = function () {
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
    patched.show = show;
    patched.hide = hide;
    patched.reflow = reflow;
    svg.removeEventListener('wheel', onInvalidate);
    flyoutWorkspace
      .getCanvas()
      .querySelectorAll(`.${ICON_CLASS}`)
      .forEach(element => element.remove());
  };
}
