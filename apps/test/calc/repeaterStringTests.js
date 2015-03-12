var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var RepeaterString = require(testUtils.buildPath('/calc/repeaterString'));

RepeaterString.prototype.debug = function () {
  var str = this.beforeDecimal + '.' + this.nonRepeatingAfterDecimal;
  if (this.repeatingAfterDecimal && this.repeatingAfterDecimal !== '0') {
    str += '_' + this.repeatingAfterDecimal;
  }
  return str;
};

describe('repeaterString', function () {
  it('fromNumeratorDenominator', function () {
    assert.equal(RepeaterString.fromNumeratorDenominator(1, 9).debug(), '0._1');
    assert.equal(RepeaterString.fromNumeratorDenominator(0.1, 9).debug(), '0.0_1');
    assert.equal(RepeaterString.fromNumeratorDenominator(0.1, 0.9).debug(), '0._1');
    assert.equal(RepeaterString.fromNumeratorDenominator(1032, 990).debug(), '1.0_42');
    assert.equal(RepeaterString.fromNumeratorDenominator(10, 1), null);
    assert.equal(RepeaterString.fromNumeratorDenominator(1, 10), null);
    assert.equal(RepeaterString.fromNumeratorDenominator(1, 4), null);
    assert.equal(RepeaterString.fromNumeratorDenominator(7, 3).debug(), '2._3');
    assert.equal(RepeaterString.fromNumeratorDenominator(1, 0.9).debug(), '1._1');
  });
});
