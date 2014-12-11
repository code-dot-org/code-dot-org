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

  describe("replaceVariables", function () {
    it("simple", function () {
      // f(x, y) =  y + x
      var node = new ExpressionNode("+", ['y', 'x']);
      node.replaceVariables({x: new ExpressionNode(1), y: new ExpressionNode(2)});

      assert.equal(node.value, '+');
      assert.equal(node.children.length, 2);
      assert.equal(node.children[0].value, 2);
      assert.equal(node.children[1].value, 1);
      assert.equal(node.evaluate(), 3);
    });

    it("more complex", function () {
      // f(x, y) = (x + 2) * (y + y)
      var node = new ExpressionNode('*', [
        new ExpressionNode('+', ['x', 2]),
        new ExpressionNode('+', ['y', 'y'])
      ]);
      node.replaceVariables({x: new ExpressionNode(3), y: new ExpressionNode(4)});
      assert.equal(node.value, '*');
      assert.equal(node.children.length, 2);
      assert.equal(node.children[0].value, '+');
      assert.equal(node.children[0].children.length, 2);
      assert.equal(node.children[0].children[0].value, 3);
      assert.equal(node.children[0].children[1].value, 2);
      assert.equal(node.children[1].value, '+');
      assert.equal(node.children[1].children.length, 2);
      assert.equal(node.children[1].children[0].value, 4);
      assert.equal(node.children[1].children[1].value, 4);
      assert.equal(node.evaluate(), 40);
    });

    it("replace with expression", function () {
      // f(x) = x + 1
      var node = new ExpressionNode("+", ['x', 1]);
      node.replaceVariables({x: new ExpressionNode("+", [3, 4])});
      // should now look like:
      // (3 + 4) + 1
      assert.equal(node.debug(), "(+ (+ 3 4) 1)");
    });

    it("replace with variable", function () {
      // f(x) = x + 1
      var node = new ExpressionNode("+", ['x', 1]);
      node.replaceVariables({x: new ExpressionNode("y")});
      // should now look like:
      // y + 1
      assert.equal(node.debug(), "(+ y 1)");
    });

    // todo - test error conditions
  });

  describe("function replacement", function () {
    it("single function, medium complexity", function () {

      // node: 1 + f(2, 3)
      var node = new ExpressionNode('+', [
        1,
        new ExpressionNode('f', [2, 3])
      ]);
      // f(x,y) = (2 * x) + y
      var functionExpression = new ExpressionNode('+', [
        new ExpressionNode('*', [2, 'x']),
        'y'
      ]);

      // f(x) = f(x + 1)
      // todo - ask josh about recursive
      node.replaceFunction('f', ['x', 'y'], functionExpression);

      // result should be (1 + ((2 * 2) + 3))
      assert.equal(node.debug(), "(+ 1 (+ (* 2 2) 3))");
      assert.equal(node.evaluate(), 8);

    });

    it("simple function, used twice", function () {
      // f(x) = x + 1
      // node: f(2) + f(3)
      var f = new ExpressionNode('+', ['x', 1]);
      var node = new ExpressionNode('+', [
        new ExpressionNode('f', [2]),
        new ExpressionNode('f', [3])
      ]);

      node.replaceFunction('f', ['x'], f);

      // result should be ((2 + 1) + (3 + 1))
      assert.equal(node.debug(), "(+ (+ 2 1) (+ 3 1))");
    });

    it("nested functions", function () {
      // f(x) = x + 1
      // g(y) = f(y) + 2
      // node: f(1) + g(2)
      // result: ((1 + 1) + ((2 + 1) + 2))
      // prefix: (+ (+ 1 1) (+ (+ 2 1) 2))
      var f = new ExpressionNode('+', ['x', 1]);
      var g = new ExpressionNode('+', [
        new ExpressionNode('f', ['y']),
        2
      ]);
      var node = new ExpressionNode('+', [
        new ExpressionNode('f', [1]),
        new ExpressionNode('g', [2])
      ]);

      assert.equal(f.debug(), "(+ x 1)");
      assert.equal(g.debug(), "(+ (f y) 2)");
      assert.equal(node.debug(), "(+ (f 1) (g 2))");

      nodeOrig = node.clone();

      // replace f, then g, then f again
      // (another option could be to replace f in g and g in f)
      node.replaceFunction('f', ['x'], f);
      assert.equal(node.debug(), "(+ (+ 1 1) (g 2))");

      node.replaceFunction('g', ['y'], g);
      assert.equal(node.debug(), "(+ (+ 1 1) (+ (f 2) 2))");

      node.replaceFunction('f', ['x'], f);
      assert.equal(node.debug(), "(+ (+ 1 1) (+ (+ 2 1) 2))");


      // reset node, then replace g, then f
      node = nodeOrig.clone();
      assert.equal(node.debug(), "(+ (f 1) (g 2))");
      node.replaceFunction('g', ['y'], g);
      assert.equal(node.debug(), "(+ (f 1) (+ (f 2) 2))");

      node.replaceFunction('f', ['x'], f);
      assert.equal(node.debug(), "(+ (+ 1 1) (+ (+ 2 1) 2))");
    });

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

  describe("getTokenList", function () {
    it("expect single value", function () {
      var expected = new ExpressionNode(1);

      var node = new ExpressionNode(1);
      var tokenList = node.getTokenList(expected);
      assert.deepEqual(tokenList, [
        { char: '1', valid: true}
      ]);

      // var node = new ExpressionNode('+', [1, 2]);
      // var tokenList = node.getTokenList(expected);
      // assert.deepEqual(tokenList, [
      //   { str: '(', valid: false},
      //   { str: '1', valid: false},
      //   { str: '+', valid: false},
      //   { str: '1', valid: false},
      //   { str: ')', valid: false}
      // ]);



    });
  });

});
