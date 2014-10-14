var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var ExpressionNode = require('../src/calc/expressionNode');

describe("ExpressionNode", function () {
  it("ctor/toString", function () {
    var node;

    node = new ExpressionNode(1);
    assert.equal(node.toString(), "1");
    assert.equal(node.val, 1);
    assert.equal(node.left, null);
    assert.equal(node.right, null);

    node = new ExpressionNode("+", 1, 2);
    assert.equal(node.toString(), "(1 + 2)");
    assert.equal(node.val, "+");

    node = new ExpressionNode("+", new ExpressionNode("+", 1, 2), 3);
    assert.equal(node.toString(), "((1 + 2) + 3)");
    assert.equal(node.val, "+");

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 2, 3));
    assert.equal(node.toString() , "(1 + (2 + 3))");
    assert.equal(node.val, "+");
  });

  it("cloning", function () {
    var node = new ExpressionNode('+', new ExpressionNode('+', 1, 2), 3);
    var clone = node.clone();
    assert.equal(clone.val, node.val);
    assert.equal(clone.right.val, node.right.val);
    assert.equal(clone.left.val, node.left.val);
    assert.equal(clone.left.left.val, node.left.left.val);
    assert.equal(clone.left.right.val, node.left.right.val);

    // change things. make sure they dont change on clone
    node.val = '-';
    node.left.val = '*';
    node.left.left.val = 4;
    node.left.right.val = 5;
    node.right.val = 6;

    assert.notEqual(clone.val, node.val);
    assert.notEqual(clone.right.val, node.right.val);
    assert.notEqual(clone.left.val, node.left.val);
    assert.notEqual(clone.left.left.val, node.left.left.val);
    assert.notEqual(clone.left.right.val, node.left.right.val);
  });

  it("getNumDiffs_", function () {
    var node, expected;

    node = new ExpressionNode(0);
    expected = new ExpressionNode(0);
    assert.equal(node.getNumDiffs_(expected), 0);

    node = new ExpressionNode(0);
    expected = new ExpressionNode(1);
    assert.equal(node.getNumDiffs_(expected), 1);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", 1, 2);
    assert.equal(node.getNumDiffs_(expected), 0);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", 2, 1);
    assert.equal(node.getNumDiffs_(expected), 0);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("-", 1, 2);
    assert.equal(node.getNumDiffs_(expected), 1);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", 2, 2);
    assert.equal(node.getNumDiffs_(expected), 1);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("-", 3, 4);
    assert.equal(node.getNumDiffs_(expected), 3);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 3, 4));
    expected = new ExpressionNode("+", 1, new ExpressionNode("+", 3, 4));
    assert.equal(node.getNumDiffs_(expected), 0);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 3, 4));
    expected = new ExpressionNode("+", new ExpressionNode("+", 4, 3), 1);
    assert.equal(node.getNumDiffs_(expected), 0);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 3, 4));
    expected = new ExpressionNode("+", 1, 2);
    assert.equal(node.getNumDiffs_(expected), Infinity);


    node = new ExpressionNode("+",
      new ExpressionNode("*", 1, 2),
      new ExpressionNode("/", 3, 4)
    );
    expected = new ExpressionNode("+",
      new ExpressionNode("-", 1, 2),
      new ExpressionNode("-", 3, 5)
    );
    assert.equal(node.getNumDiffs_(expected), 3);
  });

  it("applyExpectation/getTokenList", function () {
    var node, expected, list;

    node = new ExpressionNode(0);
    expected = new ExpressionNode(0);
    assert.equal(node.valMetExpectation, null);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation, true);
    list = node.getTokenList();
    assert.deepEqual(list, [
      { char: "0", correct: true}
    ]);

    node = new ExpressionNode(0);
    expected = new ExpressionNode(1);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation, false);
    list = node.getTokenList();
    assert.deepEqual(list, [
      { char: "0", correct: false}
    ]);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", 2, 1);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation, true);
    list = node.getTokenList();
    assert.deepEqual(list, [
      { char: "(", correct: true},
      { char: "1", correct: true},
      { char: "+", correct: true},
      { char: "2", correct: true},
      { char: ")", correct: true}
    ]);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("-", 3, 1);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation, false);
    list = node.getTokenList();
    assert.deepEqual(list, [
      { char: "(", correct: true},
      { char: "1", correct: true},
      { char: "+", correct: false},
      { char: "2", correct: false},
      { char: ")", correct: true}
    ]);

    // todo - more of these
  });


});
