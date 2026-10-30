/*
  The selector engine in apps' jsdom answers `:hover` with true and
  `:focus-visible` with false for every element, which leaves the tree's
  tooltips open when nothing is hovered and shut when a node holds keyboard
  focus. Answer both the way a browser does and leave every other selector to
  jsdom. Import this for its side effect.
*/
const matches = Element.prototype.matches;

Element.prototype.matches = function (selector) {
  if (selector === ':hover') {
    return false;
  }
  if (selector === ':focus-visible') {
    return this === document.activeElement;
  }
  return matches.call(this, selector);
};
