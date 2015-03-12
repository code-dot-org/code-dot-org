var jsnums = require('./js-numbers/js-numbers');

var RepeaterString = function (beforeDec, nonRepeat, repeat){
  this.beforeDecimal = beforeDec;
  this.nonRepeatingAfterDecimal = nonRepeat;
  this.repeatingAfterDecimal = repeat;
};

module.exports = RepeaterString;

RepeaterString.prototype.addToTextElement = function (element) {
  var tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
  tspan.textContent = this.beforeDecimal + '.' + this.nonRepeatingAfterDecimal;
  element.appendChild(tspan);
  tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
  tspan.setAttribute('style', 'text-decoration: overline');
  tspan.textContent = this.repeatingAfterDecimal;
  element.appendChild(tspan);
};

/**
 * @param {number} numerator
 * @param {number} denominator
 * @returns {RepeaterString?} Repeater string, or null if no repetition.
 */
RepeaterString.fromNumeratorDenominator = function (numerator, denominator) {
  // Convert to exact jsnum representations, i.e. 0.1 becomes 1/10
  var n = jsnums.makeFloat(numerator).toExact();
  var d = jsnums.makeFloat(denominator).toExact();

  var result = jsnums.divide(n, d);
  if (result.isInteger()) {
    return null;
  }
  var repeater = jsnums.toRepeatingDecimal(result.numerator(), result.denominator());
  if (!repeater[2] || repeater[2] === '0') {
    return null;
  }
  return new RepeaterString(repeater[0], repeater[1], repeater[2]);
};
