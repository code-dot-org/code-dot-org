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

  it("applyExpectation/getTokenList", function () {
    var node, expected, list;

    node = new ExpressionNode(0);
    expected = new ExpressionNode(0);
    assert.equal(node.valMetExpectation_, true);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, true);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "0", marked: false}
    ]);

    node = new ExpressionNode(0);
    expected = new ExpressionNode(1);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, false);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "0", marked: true}
    ]);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", 2, 1);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, true);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "(", marked: true},
      { char: "1", marked: true},
      { char: " + ", marked: false},
      { char: "2", marked: true},
      { char: ")", marked: true}
    ]);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("-", 1, 3);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, false);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "(", marked: true},
      { char: "1", marked: false},
      { char: " + ", marked: true},
      { char: "2", marked: true},
      { char: ")", marked: true}
    ]);

    node = new ExpressionNode("+", 1, 2);
    expected = new ExpressionNode("+", new ExpressionNode("+", 0, 1), 2);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, true);
    assert.equal(node.left.valMetExpectation_, false);
    assert.equal(node.right.valMetExpectation_, true);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "(", marked: true},
      { char: "1", marked: true},
      { char: " + ", marked: false},
      { char: "2", marked: false},
      { char: ")", marked: true}
    ]);

    node = new ExpressionNode("+", new ExpressionNode("+", 0, 1), 2);
    expected = new ExpressionNode("+", 1, 2);
    node.applyExpectation(expected);
    assert.equal(node.valMetExpectation_, true);
    assert.equal(node.left.valMetExpectation_, false);
    assert.equal(node.right.valMetExpectation_, true);
    list = node.getTokenList(true);
    assert.deepEqual(list, [
      { char: "(", marked: false},
      { char: "(", marked: true},
      { char: "0", marked: true},
      { char: " + ", marked: true},
      { char: "1", marked: true},
      { char: ")", marked: true},
      { char: " + ", marked: false},
      { char: "2", marked: false},
      { char: ")", marked: false}
    ]);

    // todo - more of these

  });

  it("evaluate", function () {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.evaluate(), 2);

    node = new ExpressionNode("+", 1, 2);
    assert.equal(node.evaluate(), 3);

    node = new ExpressionNode("*",
      new ExpressionNode("+", 1, 2),
      new ExpressionNode("-", 3, 1)
    );
    assert.equal(node.evaluate(), 6);
  });

  it("depth", function () {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.depth(), 0);

    node = new ExpressionNode("+", 1, 2);
    assert.equal(node.depth(), 1);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 2, 3));
    assert.equal(node.depth(), 2);

    node = new ExpressionNode("+", new ExpressionNode("+", 2, 3), 1);
    assert.equal(node.depth(), 2);

    node = new ExpressionNode("*",
      new ExpressionNode("+", 1, 2),
      new ExpressionNode("-", 3, 1)
    );
    assert.equal(node.depth(), 2);
  });

  it ("collapse", function () {
    var node, result;

    node = new ExpressionNode(2);
    result = node.collapse();
    assert.equal(result, false);
    assert.equal(node.toString(), "2");

    node = new ExpressionNode("+", 1, 2);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.toString(), "3");
    assert.equal(node.val, 3);
    assert.equal(node.left, null);
    assert.equal(node.right, null);

    node = new ExpressionNode("+", new ExpressionNode("+", 1, 2), 3);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.toString(), "(3 + 3)");


    node = new ExpressionNode("+", 1, new ExpressionNode("+", 2, 3));
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.toString(), "(1 + 5)");

    node = new ExpressionNode("*",
      new ExpressionNode("+", 1, 2),
      new ExpressionNode("-", 3, 1)
    );
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.toString(), "(3 * (3 - 1))");

    // todo - test collapsing with mistakes

  });

  it("isEquivalent", function () {
    var node, target;

    node = new ExpressionNode(0);
    target = new ExpressionNode(0);
    assert.equal(node.isEquivalent(target), true);

    node = new ExpressionNode(0);
    target = new ExpressionNode(1);
    assert.equal(node.isEquivalent(target), false);

    node = new ExpressionNode("+", 1, 2);
    target = new ExpressionNode("+", 1, 2);
    assert.equal(node.isEquivalent(target), true);

    node = new ExpressionNode(3);
    target = new ExpressionNode("+", 1, 2);
    assert.equal(node.isEquivalent(target), false);

    node = new ExpressionNode("+", 1, 2);
    target = new ExpressionNode("-", 1, 2);
    assert.equal(node.isEquivalent(target), false);

    node = new ExpressionNode("+", 1, 2);
    target = new ExpressionNode("-", 2, 1);
    assert.equal(node.isEquivalent(target), false);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 2, 3));
    target = new ExpressionNode("+", new ExpressionNode("+", 2, 3), 1);
    assert.equal(node.isEquivalent(target), true);

    node = new ExpressionNode("+", 1, new ExpressionNode("+", 2, 3));
    target = new ExpressionNode("+", new ExpressionNode("+", 2, 4), 1);
    assert.equal(node.isEquivalent(target), false);

    node = new ExpressionNode("+",
      new ExpressionNode("*", 1, 2),
      new ExpressionNode("/", 3, 4)
    );
    target = new ExpressionNode("+",
      new ExpressionNode("/", 3, 4),
      new ExpressionNode("*", 1, 2)
    );
    assert.equal(node.isEquivalent(target), true);

    // todo - more of these

  });

});
