import {assert} from '../../util/deprecatedChai';

var Token = require('@cdo/apps/calc/token');
var jsnums = require('@code-dot-org/js-numbers');

describe('Token', function() {
  it('handles repeated decimals properly', function() {
    function createJsnum(num, denom) {
      var n = jsnums.makeFloat(num).toExact();
      var d = jsnums.makeFloat(denom).toExact();
      var val = jsnums.divide(n, d);
      if (typeof val === 'number') {
        val = jsnums.makeFloat(val);
      }
      return val;
    }

    function validateFromNumeratorDenominator(num, denom, nonRepeat, repeat) {
      var jsNumber = createJsnum(num, denom);
      validate(jsNumber, nonRepeat, repeat);
    }

    function validate(jsNumber, nonRepeat, repeat) {
      var token = new Token(jsNumber, false);
      assert.strictEqual(token.nonRepeated_, nonRepeat);
      assert.strictEqual(token.repeated_, repeat);
    }

    validateFromNumeratorDenominator(1, 9, '0.', '1');
    validateFromNumeratorDenominator(0.1, 9, '0.0', '1');
    validateFromNumeratorDenominator(0.1, 0.9, '0.', '1');
    validateFromNumeratorDenominator(1032, 990, '1.0', '42');
    validateFromNumeratorDenominator(10, 1, '10', null);
    validateFromNumeratorDenominator(1, 10, '0.1', null);
    validateFromNumeratorDenominator(1, 4, '0.25', null);
    validateFromNumeratorDenominator(7, 3, '2.', '3');
    validateFromNumeratorDenominator(1, 0.9, '1.', '1');

    validate(jsnums.makeFloat(0.25), '0.25', null);
  });

  it('can convert a number to a string with commas', function() {
    assert.equal(Token.numberWithCommas_(1), '1');
    assert.equal(Token.numberWithCommas_(100), '100');
    assert.equal(Token.numberWithCommas_(1000), '1,000');
    assert.equal(Token.numberWithCommas_(10000), '10,000');
    assert.equal(Token.numberWithCommas_(1000000), '1,000,000');

    assert.equal(Token.numberWithCommas_(1.123), '1.123');
    assert.equal(Token.numberWithCommas_(100.123), '100.123');
    assert.equal(Token.numberWithCommas_(1000.123), '1,000.123');
    assert.equal(Token.numberWithCommas_(10000.123), '10,000.123');
    assert.equal(Token.numberWithCommas_(1000000.123), '1,000,000.123');
  });
});
