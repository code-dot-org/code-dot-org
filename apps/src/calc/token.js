var jsnums = require('./js-numbers/js-numbers');
var jsnums = require('./js-numbers/js-numbers');

/**
 * A token is a value, and a boolean indicating whether or not it is "marked".
 * Marking is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 * @param {} val
 * @param {boolean} marked
 */
var Token = function (val, marked) {
  this.val_ = val;
  this.marked_ = marked;

  // Store string representation of value. In most cases this is just a
  // non repeated portion. In the case of something like 1/9 there will be both
  // a non repeated portion "0." and a repeated portion "1" - i.e. 0.1111111...
  this.nonRepeated_ = null;
  this.repeated_ = null;
  this.setStringRepresentation_();
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

  if (this.repeated_) {
    // TODO -validate we get error token
    var tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
    tspan.textContent = this.nonRepeated_;
    element.appendChild(tspan);
    tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
    tspan.setAttribute('style', 'text-decoration: overline');
    tspan.textContent = this.repeated_;
    element.appendChild(tspan);

    // TODO - validate how things look if we have another string on the same line
    // later
  } else {
    // getComputedTextLength doesn't respect trailing spaces, so we replace them
    // with _, calculate our size, then return to the version with spaces.
    text.textContent = this.nonRepeated_.replace(/ /g, '_');
  }

  element.appendChild(text);
  // getComputedTextLength isn't available to us in our mochaTests
  textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;

  if (!this.repeated_) {
    // reset to version with spaces
    text.textContent = this.nonRepeated_;
  }

  text.setAttribute('x', xPos + textLength / 2);
  text.setAttribute('text-anchor', 'middle');
  if (this.marked_ && markClass) {
    text.setAttribute('class', markClass);
  }

  return textLength;
};

/**
 * Sets string representation of value.
 */
Token.prototype.setStringRepresentation_ = function () {
  if (!jsnums.isSchemeNumber(this.val_) || typeof(this.val_) === 'number') {
    this.nonRepeated_ = this.val_;
    return;
  }

  // at this point we know we have a jsnumber
  if (this.val_.isInteger()) {
    this.nonRepeated_ = this.val_.toFixnum().toString();
    return;
  }

  // Gives us three values: Number before decimal, non-repeating portion,
  // repeating portion. If we don't have the last bit, there's no repitition.
  var repeater = jsnums.toRepeatingDecimal(this.val_.numerator(),
    this.val_.denominator());
  if (!repeater[2] || repeater[2] === '0') {
    this.nonRepeated_ = this.val_.toFixnum().toString();
    return;
  }

  this.nonRepeated_ = repeater[0] + '.' + repeater[1];
  this.repeated_ = repeater[2];
};
