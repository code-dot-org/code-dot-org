// var chai = require('chai');
// chai.config.includeStack = true;
// var assert = chai.assert;
//
// var testUtils = require('../util/testUtils');
//
// var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
// var RepeaterString = require(testUtils.buildPath('/calc/repeaterString'));
// var jsnums = require(testUtils.buildPath('/calc/js-numbers/js-numbers'));
//
// RepeaterString.prototype.debug = function () {
//   var str = this.beforeDecimal + '.' + this.nonRepeatingAfterDecimal;
//   if (this.repeatingAfterDecimal && this.repeatingAfterDecimal !== '0') {
//     str += '_' + this.repeatingAfterDecimal;
//   }
//   return str;
// };
//
// describe('repeaterString', function () {
//   it('given a numerator and denominator', function () {
//     function createJsnum(num, denom) {
//       var n = jsnums.makeFloat(num).toExact();
//       var d = jsnums.makeFloat(denom).toExact();
//       var val = jsnums.divide(n, d);
//       if (typeof(val) === 'number') {
//         val = jsnums.makeFloat(val);
//       }
//       return val;
//     }
//
//     assert.equal(RepeaterString.fromJsnum(createJsnum(1, 9)).debug(), '0._1');
//     assert.equal(RepeaterString.fromJsnum(createJsnum(0.1, 9)).debug(), '0.0_1');
//     assert.equal(RepeaterString.fromJsnum(createJsnum(0.1, 0.9)).debug(), '0._1');
//     assert.equal(RepeaterString.fromJsnum(createJsnum(1032, 990)).debug(), '1.0_42');
//     assert.equal(RepeaterString.fromJsnum(createJsnum(10, 1)), null);
//     assert.equal(RepeaterString.fromJsnum(createJsnum(1, 10)), null);
//     assert.equal(RepeaterString.fromJsnum(createJsnum(1, 4)), null);
//     assert.equal(RepeaterString.fromJsnum(createJsnum(7, 3)).debug(), '2._3');
//     assert.equal(RepeaterString.fromJsnum(createJsnum(1, 0.9)).debug(), '1._1');
//   });
// });
