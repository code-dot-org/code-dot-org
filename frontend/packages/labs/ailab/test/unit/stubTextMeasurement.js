/*
  jsdom ships no canvas, so the decision tree's text measurer has nothing to
  measure with and every node collapses to the same width. Give it a width
  that grows with the text. Import this for its side effect in any suite whose
  expectations depend on text width.
*/
HTMLCanvasElement.prototype.getContext = () => ({
  measureText: text => ({width: text.length * 8}),
});
