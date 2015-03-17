var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var Token = require(testUtils.buildPath('/calc/token'));
var jsnums = require(testUtils.buildPath('/calc/js-numbers/js-numbers'));

describe('Token', function () {
  it('handles repeated decimals properly', function () {
    function createJsnum(num, denom) {
      var n = jsnums.makeFloat(num).toExact();
      var d = jsnums.makeFloat(denom).toExact();
      var val = jsnums.divide(n, d);
      if (typeof(val) === 'number') {
        val = jsnums.makeFloat(val);
      }
      return val;
    }

    function validate(num, denom, nonRepeat, repeat) {
      var token = new Token(createJsnum(num, denom), false);
      assert.equal(token.nonRepeated_, nonRepeat);
      assert.equal(token.repeated_, repeat);
    }

    validate(1, 9, '0.', '1');
    validate(0.1, 9, '0.0', '1');
    validate(0.1, 0.9, '0.', '1');
    validate(1032, 990, '1.0', '42');
    validate(10, 1, '10', null);
    validate(1, 10, '0.1', null);
    validate(1, 4, '0.25', null);
    validate(7, 3, '2.', '3');
    validate(1, 0.9, '1.', '1');
  });
});
