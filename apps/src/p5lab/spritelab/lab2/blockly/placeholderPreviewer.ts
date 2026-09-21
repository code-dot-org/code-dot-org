// While a block is dragged onto a placeholder, keep the placeholder showing
// instead of Blockly's grey insertion marker, which would replace the
// shadow until the drop.

import * as BlocklyCore from 'blockly/core';

import {
  PLACEHOLDER_ACTIVE_CLASS,
  PLACEHOLDER_BLOCK_TYPE,
} from './blockDefinitions/placeholder';

export default class PlaceholderPreviewer extends BlocklyCore.InsertionMarkerPreviewer {
  private activePlaceholder: BlocklyCore.BlockSvg | null = null;
  // The connection the placeholder hangs from, highlighted while active.
  private activeConn: BlocklyCore.RenderedConnection | null = null;

  previewConnection(
    draggedConn: BlocklyCore.RenderedConnection,
    staticConn: BlocklyCore.RenderedConnection
  ) {
    const target = staticConn.targetBlock();
    if (target?.isShadow() && target.type === PLACEHOLDER_BLOCK_TYPE) {
      if (this.activePlaceholder === target) {
        return;
      }
      this.hidePreview();
      this.activePlaceholder = target as BlocklyCore.BlockSvg;
      this.activeConn = staticConn;
      this.activePlaceholder
        .getSvgRoot()
        .classList.add(PLACEHOLDER_ACTIVE_CLASS);
      staticConn.highlight();
      return;
    }
    super.previewConnection(draggedConn, staticConn);
  }

  hidePreview() {
    if (this.activePlaceholder) {
      this.activePlaceholder
        .getSvgRoot()
        .classList.remove(PLACEHOLDER_ACTIVE_CLASS);
      this.activeConn?.unhighlight();
      this.activePlaceholder = null;
      this.activeConn = null;
    }
    super.hidePreview();
  }
}
