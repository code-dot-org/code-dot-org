var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));

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
      assert.equal(node.value_, 0);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      node = new ExpressionNode(1);
      assert.equal(node.value_, 1);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      // provide a blockId
      node = new ExpressionNode(1, [], 2);
      assert.equal(node.value_, 1);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.blockId_, 2);
      assert.equal(node.getType(), ExpressionNode.ValueType.NUMBER);

      // make sure we throw correctly
      assert.throws(function () {
        // if we provide args to a number ExpressionNode
        node = new ExpressionNode(2, [1, 2], 5);
      }, Error);
    });

    it('works with variables', function () {
      node = new ExpressionNode('x');
      assert.equal(node.value_, 'x');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.VARIABLE);

      // provide a blockId
      node = new ExpressionNode('y', [], 4);
      assert.equal(node.value_, 'y');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.getType(), ExpressionNode.ValueType.VARIABLE);
      assert.equal(node.blockId_, 4);
    });

    it('works with operators', function () {
      node = new ExpressionNode('+', [1, 2], 5);
      assert.equal(node.value_, '+');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 2);
      assert(node.children_[0] instanceof ExpressionNode);
      assert.equal(node.children_[0].value_, 1);
      assert(node.children_[1] instanceof ExpressionNode);
      assert.equal(node.children_[1].value_, 2);
      assert.equal(node.getType(), ExpressionNode.ValueType.ARITHMETIC);
      assert.equal(node.blockId_, 5);

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
      assert.equal(node.value_, 'f');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 3);
      assert(node.children_[0] instanceof ExpressionNode);
      assert.equal(node.children_[0].value_, 1);
      assert(node.children_[1] instanceof ExpressionNode);
      assert.equal(node.children_[1].value_, 2);
      assert(node.children_[2] instanceof ExpressionNode);
      assert.equal(node.children_[2].value_, 3);
      assert.equal(node.getType(), ExpressionNode.ValueType.FUNCTION_CALL);
      assert.equal(node.blockId_, 4);
    });

    it('works with nested nodes', function () {
      node = new ExpressionNode('*', [
        new ExpressionNode('/', [1, 2]),
        new ExpressionNode('/', [3, 4])
      ]);
      assert.equal(node.value_, '*');
      assert.equal(node.getType(), ExpressionNode.ValueType.ARITHMETIC);
    });
  });

  it("cloning", function () {
    var node = new ExpressionNode('+', [new ExpressionNode("+", [1, 2]), 3]);
    var clone = node.clone();
    assert.equal(clone.value_, node.value_);
    assert.equal(clone.children_[1].value_, node.children_[1].value_);
    assert.equal(clone.children_[0].value_, node.children_[0].value_);
    assert.equal(clone.children_[0].children_[0].value_, node.children_[0].children_[0].value_);
    assert.equal(clone.children_[0].children_[1].value_, node.children_[0].children_[1].value_);

    // change things. make sure they dont change on clone
    node.value_= '-';
    node.children_[0].value_= '*';
    node.children_[0].children_[0].value_= 4;
    node.children_[0].children_[1].value_= 5;
    node.children_[1].value_= 6;

    assert.notEqual(clone.value_, node.value_);
    assert.notEqual(clone.children_[1].value_, node.children_[1].value_);
    assert.notEqual(clone.children_[0].value_, node.children_[0].value_);
    assert.notEqual(clone.children_[0].children_[0].value_, node.children_[0].children_[0].value_);
    assert.notEqual(clone.children_[0].children_[1].value_, node.children_[0].children_[1].value_);
  });

  describe("evaluate/canEvaluate", function () {
    var node;

    it("can evaluate a single number", function () {
      node = new ExpressionNode(1);
      assert.equal(node.canEvaluate({}), true);
      assert.equal(node.evaluate(), 1);
    });

    it("can evaluate a simple expression", function () {
      node = new ExpressionNode('+', [1, 2]);
      assert.equal(node.canEvaluate({}), true);
      assert.equal(node.evaluate(), 3);
    });

    it("can evaluate a more complex expression", function () {
      node = new ExpressionNode('*', [
        new ExpressionNode('-', [5, 3]),
        new ExpressionNode('/', [8, 4])
      ]);
      assert.equal(node.canEvaluate({}), true);
      assert.equal(node.evaluate(), 4);
    });

    it("can evaluate a variable with a proper mapping", function () {
      node = new ExpressionNode('x');
      assert.equal(node.canEvaluate({}), false);
      assert.equal(node.canEvaluate({x: 1}), true);
      assert.equal(node.evaluate({x: 1}), 1);
    });

    it ("can evaluate an expression with variables", function () {
      node = new ExpressionNode('+', ['x', 'y']);
      assert.equal(node.canEvaluate({}), false);
      assert.equal(node.canEvaluate({x: 1, y: 2}), true);
      assert.equal(node.evaluate({x: 1, y: 2}), 3);
    });

    it("cant evaluate a variable with no mapping", function () {
      node = new ExpressionNode('x');
      assert.equal(node.canEvaluate({}), false);
      assert.throws(function () {
        node.evaluate();
      }, Error);
    });

    it("doesnt change the node when evaluating", function () {
      node = new ExpressionNode('x');
      assert.equal(node.evaluate({x: 1}), 1);
      assert.equal(node.value_, 'x');
    });

    it("cant evaluate a function with no mapping", function () {
      node = new ExpressionNode('f', [1, 2]);
      assert.equal(node.canEvaluate({}), false);
      assert.throws(function () {
        node.evaluate();
      }, Error);
    });

    it("can evaluate a function call", function () {
      node = new ExpressionNode('f', [1, 2]);
      var mapping = {};
      // f(x, y) = x + y
      mapping.f = {
        variables: ['x', 'y'],
        expression: new ExpressionNode('+', ['x', 'y'])
      };
      assert.equal(node.canEvaluate({}), false);
      assert.equal(node.canEvaluate(mapping), true);
      assert.equal(node.evaluate(mapping), 3);
    });

    it("can evaluate a function call when param name collides with global var", function () {
      node = new ExpressionNode('f', [1]);
      var mapping = {};
      // simulate global variable x = 5
      mapping.x = 5;
      // f(x) = x
      mapping.f = {
        variables: ['x'],
        expression: new ExpressionNode('x')
      };
      assert.equal(node.canEvaluate(mapping), true);
      assert.equal(node.evaluate(mapping), 1);
    });

    it("can evaluate nested functions", function () {
      node = new ExpressionNode('f', [1]);

      var mapping = {};
      // g(y) = y + 1
      mapping.g = {
        variables: ['y'],
        expression: new ExpressionNode('+', ['y', 1])
      };
      // f(x) = g(x)
      mapping.f = {
        variables: ['x'],
        expression: new ExpressionNode('g', ['x'])
      };
      assert.equal(node.canEvaluate(mapping), true);
      assert.equal(node.evaluate(mapping), 2);
    });

    // pivotal # 87579850 - this is broken right now, because it ends up
    // evaluating y + x with the x value from f's context, instead of the global
    // context
    // it("can handle transitioning back to global var", function () {
    //   var mapping = {};
    //   // x = 1
    //   mapping['x'] = 1;
    //   // g(y) = y + x; // should use global x here
    //   mapping['g'] = {
    //     variables: ['y'],
    //     expression: new ExpressionNode('+', ['x', 'y'])
    //   };
    //   // f(x) = g(x); // should use local x here
    //   mapping['f'] = {
    //     variables: ['x'],
    //     expression: new ExpressionNode('g', ['x'])
    //   };
    //
    //   // compute f(2)
    //   node = new ExpressionNode('f', [2]);
    //   assert.equal(node.canEvaluate(mapping), true);
    //   assert.equal(node.evaluate(mapping), 3);
    // });

    it('can handle functions having the same param name', function () {
      // f(x) = x + 1
      // g(x) = x + 2
      // f(1) + g(2) --> 6
      var mapping = {
        f: {
          variables: ['x'],
          expression: new ExpressionNode('+', ['x', 1])
        },
        g: {
          variables: ['x'],
          expression: new ExpressionNode('+', ['x', 2])
        }
      };

      node = new ExpressionNode('+', [
        new ExpressionNode('f', [1]),
        new ExpressionNode('g', [2])
      ]);
      assert.equal(node.canEvaluate(mapping), true);
      assert.equal(node.evaluate(mapping), 6);
    });

    it('throws? on recursion', function () {
      // f(x) = f(x) + 1
      var mapping = {
        f: {
          variables: ['x'],
          expression: new ExpressionNode('+', [
            new ExpressionNode('f', ['x']),
            new ExpressionNode(1)
          ])
        }
      };

      node = new ExpressionNode('f', [1]);
      assert.equal(node.canEvaluate(mapping), false);
      assert.throws(function () {
        // pivotal # 87579626
        // what it throws is Maximum callstack exceeded. i wonder if i
        // can/should get it to fail earlier
        // maybe when evaluating, remove self from mapping?
        node.evaluate(mapping);
      });
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

  it("collapse", function () {
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

    describe("expect variable", function () {
      var expected = new ExpressionNode('var', []);

      it ('is correct', function () {
        var node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'var', marked: false}
        ]);
      });

      it ('has the wrong value', function () {
        var node = new ExpressionNode('different_var', []);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'different_var', marked: true}
        ]);
      });

      it ('has a function', function () {
        var node = new ExpressionNode('f', ['x', 'y']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'f', marked: true},
          { str: '(', marked: true},
          { str: 'x', marked: true},
          { str: ',', marked: true},
          { str: 'y', marked: true},
          { str: ')', marked: true}
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
        node.value_ = '-';
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
        node.children_[0].value_ = 2;
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
        node.children_[1].value_ = 3;
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

    describe("function calls", function () {
      var node, tokenList;
      var expected = new ExpressionNode('f', ['1', '2', '3']);

      it("marks nothing when calls are identical", function () {
        node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'f',  marked: false},
          { str: '(',  marked: false},
          { str: '1',  marked: false},
          { str: ',',  marked: false},
          { str: '2',  marked: false},
          { str: ',',  marked: false},
          { str: '3',  marked: false},
          { str: ')',  marked: false},
        ]);
      });

      it("marks everything when calling function of wrong name", function () {
        node = new ExpressionNode('g', ['1', '2', '3']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'g',  marked: true},
          { str: '(',  marked: true},
          { str: '1',  marked: true},
          { str: ',',  marked: true},
          { str: '2',  marked: true},
          { str: ',',  marked: true},
          { str: '3',  marked: true},
          { str: ')',  marked: true},
        ]);
      });

      it ("marks only one param when one param is wrong", function () {
        node = new ExpressionNode('f', ['1', '2', '4']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'f',  marked: false},
          { str: '(',  marked: false},
          { str: '1',  marked: false},
          { str: ',',  marked: false},
          { str: '2',  marked: false},
          { str: ',',  marked: false},
          { str: '4',  marked: true},
          { str: ')',  marked: false},
        ]);
      });

      it ("marks all params when all are wrong", function () {
        node = new ExpressionNode('f', ['4', '5', '6']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'f',  marked: false},
          { str: '(',  marked: false},
          { str: '4',  marked: true},
          { str: ',',  marked: false},
          { str: '5',  marked: true},
          { str: ',',  marked: false},
          { str: '6',  marked: true},
          { str: ')',  marked: false},
        ]);
      });

      it ("marks everything but the function when wrong number of params", function () {
        node = new ExpressionNode('f', ['1', '2', '3', '4']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          { str: 'f',  marked: false},
          { str: '(',  marked: true},
          { str: '1',  marked: true},
          { str: ',',  marked: true},
          { str: '2',  marked: true},
          { str: ',',  marked: true},
          { str: '3',  marked: true},
          { str: ',',  marked: true},
          { str: '4',  marked: true},
          { str: ')',  marked: true},
        ]);
      });
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
  });

  describe('hasSameSignature', function () {
    it('fails if other is null', function () {
      var node = new ExpressionNode('f', [1]);
      assert.equal(node.hasSameSignature(null), false);
      assert.equal(node.hasSameSignature(), false);
    });

    it('fails if same, but not function calls', function () {
      var node = new ExpressionNode(1);
      var other = node.clone();
      assert.equal(node.hasSameSignature(other), false);
    });

    it('fails if calling different functions', function () {
      var node = new ExpressionNode('f', [1]);
      var other = new ExpressionNode('g', [1]);
      assert.equal(node.hasSameSignature(other), false);
    });

    it('fails if number of children differ', function () {
      var node = new ExpressionNode('f', [1, 2]);
      var other = new ExpressionNode('f', [1, 2, 3]);
      assert.equal(node.hasSameSignature(other), false);

      other = new ExpressionNode('f', [1]);
      assert.equal(node.hasSameSignature(other), false);
    });

    it('succeeds if identical', function () {
      var node = new ExpressionNode('f', [1, 2]);
      var other = node.clone();
      assert.equal(node.hasSameSignature(other), true);
    });

    it('succeeds if has same signature but different params', function () {
      var node = new ExpressionNode('f', [1, 2]);
      var other = new ExpressionNode('f', [3, 4]);
      assert.equal(node.hasSameSignature(other), true);
    });
  });

});
