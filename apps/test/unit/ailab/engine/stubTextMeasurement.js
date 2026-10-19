/*
  jest-canvas-mock measures every string at one pixel per character, narrow
  enough that a node never reaches the tree's maximum width. Measure closer to
  the real font so widths, and the cap on them, behave as they do in a browser.
  Import this for its side effect in any suite that lays out tree nodes.
*/
HTMLCanvasElement.prototype.getContext = () => ({
  measureText: text => ({width: text.length * 8}),
});
