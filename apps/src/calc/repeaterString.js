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
RepeaterString.fromJsnum = function (jsn) {
  if (jsn.isInteger()) {
    return null;
  }
  var repeater = jsnums.toRepeatingDecimal(jsn.numerator(), jsn.denominator());
  if (!repeater[2] || repeater[2] === '0') {
    return null;
  }
  return new RepeaterString(repeater[0], repeater[1], repeater[2]);
};
