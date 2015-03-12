var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var jsnums = require(testUtils.buildPath('/calc/js-numbers/js-numbers'));

/**
 * @param {number} numerator
 * @param {number} denominator
 */
function getRepeaterString(numerator, denominator) {
  // Convert to exact jsnum representations, i.e. 0.1 becomes 1/10
  var n = jsnums.makeFloat(numerator).toExact();
  var d = jsnums.makeFloat(denominator).toExact();

  var result = jsnums.divide(n, d);
  if (result.isInteger()) {
    return result.toString();
  }
  var repeater = jsnums.toRepeatingDecimal(result.numerator(), result.denominator());
  var beforeDecimal = repeater[0];
  var nonRepeatingAfterDecimal = repeater[1];
  var repeatingAfterDecimal = repeater[2];


  var str = beforeDecimal + '.' + nonRepeatingAfterDecimal;
  if (repeatingAfterDecimal && repeatingAfterDecimal !== '0') {
    // TODO - proper bar
    str += '_' + repeatingAfterDecimal + '_';
  }
  return str;
}

describe('fractions', function () {
  it('brent', function () {
    assert.equal(getRepeaterString(1, 9), '0._1_');
    assert.equal(getRepeaterString(0.1, 9), '0.0_1_');
    assert.equal(getRepeaterString(0.1, 0.9), '0._1_');
    assert.equal(getRepeaterString(1032, 990), '1.0_42_');
    assert.equal(getRepeaterString(10, 1), '10');
    assert.equal(getRepeaterString(1, 10), '0.1');
    assert.equal(getRepeaterString(1, 4), '0.25');
    assert.equal(getRepeaterString(7, 3), '2._3_');
    assert.equal(getRepeaterString(1, 0.9), '1._1_');
  });
});
