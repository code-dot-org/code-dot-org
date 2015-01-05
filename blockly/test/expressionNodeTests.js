var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var ExpressionNode = require('../src/calc/expressionNode');

/**
 * Get a string representation of the tree
 */
ExpressionNode.prototype.debug = function () {
  if (this.children.length === 0) {
    return this.value;
  }
  return "(" + this.value + " " +
    this.children.map(function (c) {
      return c.debug();
    }).join(' ') + ")";
};

describe("debug output of an ExpressionNode tree", function () {
  it("works in some simple cases", function () {
    var node = new ExpressionNode("+", [1, 2]);
    assert.equal(node.debug(), "(+ 1 2)");

    node = new ExpressionNode("+", [
      new ExpressionNode("-", [3, 2]),
      new ExpressionNode("*", [1, 1])
    ]);
    assert.equal(node.debug(), "(+ (- 3 2) (* 1 1))");

  });
});

describe("ExpressionNode", function () {
  describe('constructor', function () {
    var node;

    it('works with numbers', function () {
      node = new ExpressionNode(0);
      assert.equal(node.value, 0);
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      node = new ExpressionNode(1);
      assert.equal(node.value, 1);
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      // provide a blockId
      node = new ExpressionNode(1, [], 2);
      assert.equal(node.value, 1);
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 0);
      assert.equal(node.blockId, 2);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      // make sure we throw correctly
      assert.throws(function () {
        // if we provide args to a number ExpressionNode
        node = new ExpressionNode(2, [1, 2], 5);
      }, Error);
    });

    it('works with variables', function () {
      node = new ExpressionNode('x');
      assert.equal(node.value, 'x');
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.VARIABLE);

      // provide a blockId
      node = new ExpressionNode('y', [], 4);
      assert.equal(node.value, 'y');
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.VARIABLE);
      assert.equal(node.blockId, 4);
    });

    it('works with operators', function () {
      node = new ExpressionNode('+', [1, 2], 5);
      assert.equal(node.value, '+');
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 2);
      assert(node.children[0] instanceof ExpressionNode);
      assert.equal(node.children[0].value, 1);
      assert(node.children[1] instanceof ExpressionNode);
      assert.equal(node.children[1].value, 2);
      assert.equal(node.getType(), ExpressionNode.ValueType.ARITHMETIC);
      assert.equal(node.blockId, 5);

      // throw if we have the wrong number of operands
      assert.throws(function () {
        nodne = new ExpressionNode('-', [1, 2, 3]);
      }, Error);
      assert.throws(function () {
        nodne = new ExpressionNode('-', [1]);
      }, Error);
      // or forget to put them in an array
      assert.throws(function () {
        nodne = new ExpressionNode('-', 1, 2);
      }, Error);
    });

    it('works with function calls', function () {
      node = new ExpressionNode('f', [1, 2, 3], 4);
      assert.equal(node.value, 'f');
      assert(Array.isArray(node.children));
      assert.equal(node.children.length, 3);
      assert(node.children[0] instanceof ExpressionNode);
      assert.equal(node.children[0].value, 1);
      assert(node.children[1] instanceof ExpressionNode);
      assert.equal(node.children[1].value, 2);
      assert(node.children[2] instanceof ExpressionNode);
      assert.equal(node.children[2].value, 3);
      assert.equal(node.getType(), ExpressionNode.ValueType.FUNCTION_CALL);
      assert.equal(node.blockId, 4);
    });

    it('works with nested nodes', function () {
      node = new ExpressionNode('*', [
        new ExpressionNode('/', [1, 2]),
        new ExpressionNode('/', [3, 4])
      ]);
      assert.equal(node.value, '*');
      assert.equal(node.getType(), ExpressionNode.ValueType.ARITHMETIC);
    });
  });

  it("cloning", function () {
    var node = new ExpressionNode('+', [new ExpressionNode("+", [1, 2]), 3]);
    var clone = node.clone();
    assert.equal(clone.value, node.value);
    assert.equal(clone.children[1].value, node.children[1].value);
    assert.equal(clone.children[0].value, node.children[0].value);
    assert.equal(clone.children[0].children[0].value, node.children[0].children[0].value);
    assert.equal(clone.children[0].children[1].value, node.children[0].children[1].value);

    // change things. make sure they dont change on clone
    node.value= '-';
    node.children[0].value= '*';
    node.children[0].children[0].value= 4;
    node.children[0].children[1].value= 5;
    node.children[1].value= 6;

    assert.notEqual(clone.value, node.value);
    assert.notEqual(clone.children[1].value, node.children[1].value);
    assert.notEqual(clone.children[0].value, node.children[0].value);
    assert.notEqual(clone.children[0].children[0].value, node.children[0].children[0].value);
    assert.notEqual(clone.children[0].children[1].value, node.children[0].children[1].value);
  });

  it("evaluate", function () {
    var node;

    node = new ExpressionNode(1);
    assert.equal(node.evaluate(), 1);

    node = new ExpressionNode('+', [1, 2]);
    assert.equal(node.evaluate(), 3);

    node = new ExpressionNode('*', [
      new ExpressionNode('-', [5, 3]),
      new ExpressionNode('/', [8, 4])
    ]);
    assert.equal(node.evaluate(), 4);

    assert.throws(function () {
      node = new ExpressionNode('x');
      node.evaluate();
    }, Error);

    assert.throws(function () {
      node = new ExpressionNode('f', [1, 2]);
      node.evaluate();
    }, Error);
  });

  it("depth", function () {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.depth(), 0);

    node = new ExpressionNode("+", [1, 2]);
    assert.equal(node.depth(), 1);

    node = new ExpressionNode("+", [1, new ExpressionNode("+", [2, 3])]);
    assert.equal(node.depth(), 2);

    node = new ExpressionNode("+", [new ExpressionNode("+", [2, 3]), 1]);
    assert.equal(node.depth(), 2);

    node = new ExpressionNode("*", [
      new ExpressionNode("+", [1, 2]),
      new ExpressionNode("-", [3, 1])
    ]);
    assert.equal(node.depth(), 2);
  });

  it("getDeepestOperation", function () {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.getDeepestOperation(), null);

    node = new ExpressionNode("+", [1,2]);
    assert.equal(node.getDeepestOperation(), node);

    // both children have same depth
    node = new ExpressionNode("+", [
      new ExpressionNode("+", [1, 2]),
      new ExpressionNode("+", [3, 4])
    ]);
    assert.equal(node.getDeepestOperation().debug(), "(+ 1 2)");

    // left is deeper
    node = new ExpressionNode("+", [
      new ExpressionNode("+", [1, 2]),
      3
    ]);
    assert.equal(node.getDeepestOperation().debug(), "(+ 1 2)");

    // right is deeper
    node = new ExpressionNode("+", [
      1,
      new ExpressionNode("+", [3, 4])
    ]);
    assert.equal(node.getDeepestOperation().debug(), "(+ 3 4)");

  });

  it ("collapse", function () {
    var node, result;

    node = new ExpressionNode(2);
    result = node.collapse();
    assert.equal(result, false);
    assert.equal(node.debug(), "2");

    node = new ExpressionNode("+", [1, 2]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), "3");

    node = new ExpressionNode("+", [
      new ExpressionNode("+", [1, 2]),
      3
    ]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), "(+ 3 3)");

    node = new ExpressionNode("+", [
      1,
      new ExpressionNode("+", [2, 3])
    ]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), "(+ 1 5)");

    node = new ExpressionNode("*", [
      new ExpressionNode("+", [1, 2]),
      new ExpressionNode("-", [3, 1])
    ]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), "(* 3 (- 3 1))");

    // todo - test collapsing with mistakes

  });

  describe("getTokenListDiff", function () {
    var node, tokenList;
    describe("expect single value", function () {
      var expected = new ExpressionNode(1);

      it('is correct', function () {
        node = new ExpressionNode(1);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '1', marked: false}
        ]);
      });

      it('differs in value', function () {
        node = new ExpressionNode(2);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '2', marked: true}
        ]);
      });

      it('is an expression instead', function () {
        node = new ExpressionNode('+', [1, 2]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '(',  marked: true},
          { str: '1',  marked: true},
          { str:' + ', marked: true},
          { str: '2',  marked: true},
          { str: ')',  marked: true}
        ]);
      });
    });

    describe("expect simple expression", function () {
      var expected = new ExpressionNode('+', [1, 2]);

      it('is correct', function () {
        node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '(',   marked: false},
          { str: '1',   marked: false},
          { str: ' + ', marked: false},
          { str: '2',   marked: false},
          { str: ')',   marked: false}
        ]);
      });

      it('differs in value', function () {
        node = expected.clone();
        node.value = '-';
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '(',  marked: true},
          { str: '1',  marked: true},
          { str:' - ', marked: true},
          { str: '2',  marked: true},
          { str: ')',  marked: true}
        ]);
      });

      it('differs in child 1', function () {
        node = expected.clone();
        node.children[0].value = 2;
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '(',  marked: false},
          { str: '2',  marked: true},
          { str:' + ', marked: false},
          { str: '2',  marked: false},
          { str: ')',  marked: false}
        ]);
      });

      it('differs in child 2', function () {
        node = expected.clone();
        node.children[1].value = 3;
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: '(',  marked: false},
          { str: '1',  marked: false},
          { str:' + ', marked: false},
          { str: '3',  marked: true},
          { str: ')',  marked: false}
        ]);
      });
    });

    it("works with collapse", function () {
      var original = new ExpressionNode('*', [
        new ExpressionNode('+', [1, 2]),
        new ExpressionNode('+', [3, 4])
      ]);
      var node = original.clone();
      node.collapse();

      var tokenList = node.getTokenListDiff(original);
      assert.deepEqual(tokenList, [
        { str: '(',  marked: false},
        { str: '3',  marked: true},
        { str:' * ', marked: false},
        { str: '(',  marked: false},
        { str: '3',  marked: false},
        { str:' + ', marked: false},
        { str: '4',  marked: false},
        { str: ')',  marked: false},
        { str: ')',  marked: false}
      ]);
    });
  });

  describe("getTokenList", function () {
    it("single value", function () {
      var node = new ExpressionNode(1);
      assert.deepEqual(node.getTokenList(false), [
        { str: '1', marked: false }
      ]);
      assert.deepEqual(node.getTokenList(true), [
        { str: '1', marked: true }
      ]);
    });

    it("single operation", function () {
      var node = new ExpressionNode('+', [1, 2]);
      assert.deepEqual(node.getTokenList(false), [
        { str: '(', marked: false },
        { str: '1', marked: false },
        { str:' + ',marked: false },
        { str: '2', marked: false },
        { str: ')', marked: false }
      ]);
      assert.deepEqual(node.getTokenList(true), [
        { str: '(', marked: true },
        { str: '1', marked: true },
        { str:' + ',marked: true },
        { str: '2', marked: true },
        { str: ')', marked: true }
      ]);
    });

    it("left deeper", function () {
      var node = new ExpressionNode('+', [
        new ExpressionNode('*', [1, 2]),
        3
      ]);
      assert.deepEqual(node.getTokenList(false), [
        { str: '(', marked: false },
        { str: '(', marked: false },
        { str: '1', marked: false },
        { str:' * ',marked: false },
        { str: '2', marked: false },
        { str: ')', marked: false },
        { str:' + ',marked: false },
        { str: '3', marked: false },
        { str: ')', marked: false }
      ]);
      assert.deepEqual(node.getTokenList(true), [
        { str: '(', marked: false },
        { str: '(', marked: true },
        { str: '1', marked: true },
        { str:' * ',marked: true },
        { str: '2', marked: true },
        { str: ')', marked: true },
        { str:' + ',marked: false },
        { str: '3', marked: false },
        { str: ')', marked: false }
      ]);
    });
  });

  it("isEquivalentTo", function () {
    var node, target;

    node = new ExpressionNode(0);
    target = new ExpressionNode(0);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode(0);
    target = new ExpressionNode(1);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode("+", [1, 2]);
    target = new ExpressionNode("+", [1, 2]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode("+", [1, 2]);
    target = new ExpressionNode("+", [2, 1]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode(3);
    target = new ExpressionNode("+", [1, 2]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode("+", [1, 2]);
    target = new ExpressionNode("-", [1, 2]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode("+", [1, 2]);
    target = new ExpressionNode("-", [2, 1]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode("+", [
      1,
      new ExpressionNode("+", [2, 3])
    ]);
    target = new ExpressionNode("+", [
      new ExpressionNode("+", [2, 3]),
      1
    ]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode("+", [
      1,
      new ExpressionNode("+", [2, 3])
    ]);
    target = new ExpressionNode("+", [
      new ExpressionNode("+", [2, 4]),
      1
    ]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode("+", [
      new ExpressionNode("*", [1, 2]),
      new ExpressionNode("/", [3, 4])
    ]);
    target = new ExpressionNode("+", [
      new ExpressionNode("/", [3, 4]),
      new ExpressionNode("*", [1, 2])
    ]);
    assert.equal(node.isEquivalentTo(target), true);

    // todo - more of these

  });

});
