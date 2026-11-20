// Droplet's replace leaves a lasso selection over the replaced tokens unable to
// reach its own end, so dragging it throws in Editor.hitTest.
export function installDropletLassoGuard(editor) {
  const replace = editor.replace;
  editor.replace = function (...args) {
    if (this.lassoSelection != null) {
      if (this.draggingBlock === this.lassoSelection) {
        this.draggingBlock = this.draggingOffset = null;
        this.lastHighlightPath?.deactivate?.();
        this.lastHighlight = this.lastHighlightPath = null;
      }
      this.lassoSelection = null;
    }
    return replace.apply(this, args);
  };
}
