var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var Expression = require('../src/calc/expression.js');

it('simple expressions to strings', function () {
  var expr1 = new Expression('+', 1, 2);
  var expr2 = new Expression('+', 2, 1);

  assert.equal(expr1.toString(), "(1 + 2)");
  assert.equal(expr2.toString(), "(2 + 1)");
  assert.equal(expr1.toString(true), "(1 + 2)");
  assert.equal(expr2.toString(true), "(1 + 2)");
});

describe("getDiff", function () {
  it("of numbers", function () {
    assert.deepEqual(Expression.getDiff(0, 0), { numDiffs: 0 });
    assert.deepEqual(Expression.getDiff(0, 1), { numDiffs: 1, val: 1 });
    assert.deepEqual(Expression.getDiff(1, 0), { numDiffs: 1, val: 0 });
  });

  describe("of single level expressions", function () {
    it("that are the same", function () {
      var expected = {
        numDiffs: 0,
        args: [
          { numDiffs: 0 },
          { numDiffs: 0 }
        ]
      };

      var diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('+', 1, 2));
      assert.deepEqual(diff, expected);

      diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('+', 2, 1));
      assert.deepEqual(diff, expected);
    });

    it("that only differ by operator", function () {
      var expected = {
        numDiffs: 1,
        operator: "-",
        args: [
          { numDiffs: 0 },
          { numDiffs: 0 }
        ]
      };

      var diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('-', 1, 2));
      assert.deepEqual(diff, expected);
      diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('-', 2, 1));
      assert.deepEqual(diff, expected);
    });

    it("that only differ in a single arg", function () {
      var expected = {
        numDiffs: 1,
        args: [
          { numDiffs: 1, val: 3 },
          { numDiffs: 0 }
        ]
      };

      var diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('+', 3, 2));
      assert.deepEqual(diff, expected);

      expected = {
        numDiffs: 1,
        args: [
          { numDiffs: 0 },
          { numDiffs: 1, val: 3 },
        ]
      };

      diff = Expression.getDiff(
        new Expression('+', 1, 2),
        new Expression('+', 1, 3));
      assert.deepEqual(diff, expected);
    });
  });
});
