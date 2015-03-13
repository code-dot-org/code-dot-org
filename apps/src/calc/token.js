var jsnums = require('./js-numbers/js-numbers');
var RepeaterString = require('./repeaterString');

// TODO - update comment
/**
 * A token is essentially just a string that may or may not be "marked". Marking
 * is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 * @param {} val
 * @param {boolean} marked
 */
var Token = function (val, marked) {
  if (jsnums.isSchemeNumber(val)) {
    var repeater = RepeaterString.fromJsnum(val);
    if (!repeater) {
      this.str = val.toFixnum().toString();
    } else {
      this.str = repeater;
    }
  } else {
    this.str = val.toString();
  }
  this.marked = marked;
};
module.exports = Token;

/**
 * Add the given token to the parent element.
 * @param {HTMLElement} element Parent element to add to
 * @param {number} xPos X position to place element at
 * @param {string?} markClass Class name to use if token is marked
 * @returns {number} the length of hte added text element
 */
Token.prototype.addToParent = function (element, xPos, markClass) {
  var text, textLength;

  text = document.createElementNS(Blockly.SVG_NS, 'text');

  var repeater = this.str instanceof RepeaterString;
  if (repeater) {
    this.str.addToTextElement(text);
  } else {
    // getComputedTextLength doesn't respect trailing spaces, so we replace them
    // with _, calculate our size, then return to the version with spaces.
    text.textContent = this.str.replace(/ /g, '_');
  }

  element.appendChild(text);
  // getComputedTextLength isn't available to us in our mochaTests
  textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;

  if (!repeater) {
    // reset to version with spaces
    text.textContent = this.str;
  }

  text.setAttribute('x', xPos + textLength / 2);
  text.setAttribute('text-anchor', 'middle');
  if (this.marked && markClass) {
    text.setAttribute('class', markClass);
  }

  return textLength;
};
