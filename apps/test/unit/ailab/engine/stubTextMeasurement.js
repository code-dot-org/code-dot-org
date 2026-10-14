/*
  jest-canvas-mock measures every string as zero width, which collapses the
  decision tree's node widths. Import this for its side effect in any suite
  whose expectations depend on text width.
*/
HTMLCanvasElement.prototype.getContext = () => ({
  measureText: text => ({width: text.length * 8}),
});
