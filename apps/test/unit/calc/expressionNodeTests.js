import {assert} from '../../util/deprecatedChai';

var ExpressionNode = require('@cdo/apps/calc/expressionNode');
var Token = require('@cdo/apps/calc/token');
var jsnums = require('@code-dot-org/js-numbers');

function isJsNumber(val) {
  return (
    val instanceof jsnums.Rational ||
    val instanceof jsnums.FloatPoint ||
    val instanceof jsnums.Complex ||
    val instanceof jsnums.BigInteger
  );
}

describe('debug output of an ExpressionNode tree', function() {
  it('works in some simple cases', function() {
    var node = new ExpressionNode('+', [1, 2]);
    assert.equal(node.debug(), '(+ 1 2)');

    node = new ExpressionNode('+', [
      new ExpressionNode('-', [3, 2]),
      new ExpressionNode('*', [1, 1])
    ]);
    assert.equal(node.debug(), '(+ (- 3 2) (* 1 1))');
  });
});

describe('ExpressionNode', function() {
  describe('the constructor', function() {
    var node;

    it('works with numbers', function() {
      node = new ExpressionNode(0);
      assert.equal(node.value_, 0);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert(node.isNumber());

      node = new ExpressionNode(1);
      assert.equal(node.value_, 1);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert(node.isNumber());

      // provide a blockId
      node = new ExpressionNode(1, [], 2);
      assert.equal(node.value_, 1);
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert.equal(node.blockId_, 2);
      assert(node.isNumber());

      // make sure we throw correctly
      assert.throws(function() {
        // if we provide args to a number ExpressionNode
        node = new ExpressionNode(2, [1, 2], 5);
      }, Error);
    });

    it('works with variables', function() {
      node = new ExpressionNode('x');
      assert.equal(node.value_, 'x');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert(node.isVariable());

      // provide a blockId
      node = new ExpressionNode('y', [], 4);
      assert.equal(node.value_, 'y');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 0);
      assert(node.isVariable());
      assert.equal(node.blockId_, 4);
    });

    it('works with operators', function() {
      node = new ExpressionNode('+', [1, 2], 5);
      assert.equal(node.value_, '+');
      assert(Array.isArray(node.children_));
      assert.equal(node.children_.length, 2);
      assert(node.children_[0] instanceof ExpressionNode);
      assert.equal(node.children_[0].value_, 1);
      assert(node.children_[1] instanceof ExpressionNode);
      assert.equal(node.children_[1].value_, 2);
      assert(node.isArithmetic());
      assert.equal(node.blockId_, 5);

      // throw if we have the wrong number of operands
      assert.throws(function() {
        node = new ExpressionNode('-', [1, 2, 3]);
      }, Error);
      // or forget to put them in an array
      assert.throws(function() {
        node = new ExpressionNode('-', 1, 2);
      }, Error);
    });

    it('works with function calls', function() {
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
      assert(node.isFunctionCall());
      assert.equal(node.blockId_, 4);
    });

    it('works with nested nodes', function() {
      node = new ExpressionNode('*', [
        new ExpressionNode('/', [1, 2]),
        new ExpressionNode('/', [3, 4])
      ]);
      assert.equal(node.value_, '*');
      assert(node.isArithmetic());
    });
  });

  it('cloning', function() {
    var node = new ExpressionNode('+', [new ExpressionNode('+', [1, 2]), 3]);
    var clone = node.clone();
    assert.equal(clone.value_, node.value_);
    assert.equal(clone.children_[1].value_, node.children_[1].value_);
    assert.equal(clone.children_[0].value_, node.children_[0].value_);
    assert.equal(
      clone.children_[0].children_[0].value_,
      node.children_[0].children_[0].value_
    );
    assert.equal(
      clone.children_[0].children_[1].value_,
      node.children_[0].children_[1].value_
    );

    // change things. make sure they dont change on clone
    node.value_ = '-';
    node.children_[0].value_ = '*';
    node.children_[0].children_[0].value_ = 4;
    node.children_[0].children_[1].value_ = 5;
    node.children_[1].value_ = 6;

    assert.notEqual(clone.value_, node.value_);
    assert.notEqual(clone.children_[1].value_, node.children_[1].value_);
    assert.notEqual(clone.children_[0].value_, node.children_[0].value_);
    assert.notEqual(
      clone.children_[0].children_[0].value_,
      node.children_[0].children_[0].value_
    );
    assert.notEqual(
      clone.children_[0].children_[1].value_,
      node.children_[0].children_[1].value_
    );
  });

  describe('evaluate', function() {
    var node, evaluation;

    it('can evaluate a single number', function() {
      node = new ExpressionNode(1);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 1));
    });

    it('can evaluate a simple expression', function() {
      node = new ExpressionNode('+', [1, 2]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 3));
    });

    it('can evaluate a pow', function() {
      node = new ExpressionNode('pow', [2, 3]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 8));
    });

    it('can evaluate a sqr', function() {
      node = new ExpressionNode('sqr', [2]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert.equal(evaluation.result.toExact(), 4);
    });

    it('can evaluate a sqrt', function() {
      node = new ExpressionNode('sqrt', [4]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert.equal(evaluation.result.toExact(), 2);
    });

    it('can evaluate nested sqrt/sqr', function() {
      node = new ExpressionNode('sqrt', [
        new ExpressionNode('+', [
          new ExpressionNode('sqr', [3]),
          new ExpressionNode('sqr', [4])
        ])
      ]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert.equal(evaluation.result.toExact(), 5);
    });

    it('can evaluate a more complex expression', function() {
      node = new ExpressionNode('*', [
        new ExpressionNode('-', [5, 3]),
        new ExpressionNode('/', [8, 4])
      ]);
      evaluation = node.evaluate({});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 4));
    });

    it('can evaluate a variable with a proper mapping', function() {
      node = new ExpressionNode('x');
      evaluation = node.evaluate({});
      assert(evaluation.err);

      evaluation = node.evaluate({x: jsnums.makeFloat(1)});
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 1));
    });

    it('can evaluate an expression with variables', function() {
      node = new ExpressionNode('+', ['x', 'y']);
      evaluation = node.evaluate({});
      assert(evaluation.err);

      evaluation = node.evaluate({
        x: jsnums.makeFloat(1),
        y: jsnums.makeFloat(2)
      });
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 3));
    });

    it('cant evaluate a variable with no mapping', function() {
      node = new ExpressionNode('x');
      evaluation = node.evaluate({});
      assert(evaluation.err);
    });

    it('doesnt change the node when evaluating', function() {
      node = new ExpressionNode('x');
      evaluation = node.evaluate({x: jsnums.makeFloat(1)});
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 1));
      assert.equal(node.value_, 'x');
    });

    it('cant evaluate a function with no mapping', function() {
      node = new ExpressionNode('f', [1, 2]);
      evaluation = node.evaluate({});
      assert(evaluation.err);
    });

    it('can evaluate a function call', function() {
      node = new ExpressionNode('f', [1, 2]);
      var mapping = {};
      // f(x, y) = x + y
      mapping.f = {
        variables: ['x', 'y'],
        expression: new ExpressionNode('+', ['x', 'y'])
      };
      evaluation = node.evaluate({});
      assert(evaluation.err);

      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 3));
    });

    it('can evaluate a function call when param name collides with global var', function() {
      node = new ExpressionNode('f', [1]);
      var mapping = {};
      // simulate global variable x = 5
      mapping.x = 5;
      // f(x) = x
      mapping.f = {
        variables: ['x'],
        expression: new ExpressionNode('x')
      };
      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 1));
    });

    it('can evaluate nested functions', function() {
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
      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 2));
    });

    it('can handle transitioning back to global var', function() {
      var mapping = {};
      // x = 1
      // g(y) = y + x; // should use global x here
      // f(x) = g(x); // should use local x here
      mapping.x = jsnums.makeFloat(1);
      mapping.g = {
        variables: ['y'],
        expression: new ExpressionNode('+', ['x', 'y'])
      };
      mapping.f = {
        variables: ['x'],
        expression: new ExpressionNode('g', ['x'])
      };

      // compute f(2)
      node = new ExpressionNode('f', [2]);
      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 3));
    });

    it('can handle transitioning back to global var with more complexity', function() {
      var mapping = {};
      // x = 1
      // g(y) = y + x; // should use global x here
      // f(x) = g(x) + x; // should use local x here
      mapping.x = jsnums.makeFloat(1);
      mapping.g = {
        variables: ['y'],
        expression: new ExpressionNode('+', ['x', 'y'])
      };
      mapping.f = {
        variables: ['x'],
        expression: new ExpressionNode('+', [
          new ExpressionNode('g', ['x']),
          new ExpressionNode('x')
        ])
      };

      // compute f(2)
      // f(2) = g(2) + 2
      // f(2) = 3 + 2 = 5
      node = new ExpressionNode('f', [2]);
      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 5));
    });

    it('can handle functions having the same param name', function() {
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
      evaluation = node.evaluate(mapping);
      assert(!evaluation.err);
      assert(isJsNumber(evaluation.result));
      assert(jsnums.equals(evaluation.result, 6));
    });

    it('generates error on infinite recursion', function() {
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
      evaluation = node.evaluate(mapping);

      assert(evaluation.err);
    });

    it('cant evaluate an expression that becomes a div zero', function() {
      var node = new ExpressionNode('/', [
        new ExpressionNode(6),
        new ExpressionNode('-', [5, 5])
      ]);
      evaluation = node.evaluate();
      assert(evaluation.err);
      assert(evaluation.err instanceof ExpressionNode.DivideByZeroError);
    });

    it("can't evaluate an expression that becomes an imaginary number (sqrt -1)", function() {
      var node = new ExpressionNode('sqrt', [-1]);
      evaluation = node.evaluate();
      assert(evaluation.err);
      assert(evaluation.err instanceof ExpressionNode.ImaginaryNumberError);
    });
  });

  it('depth', function() {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.depth(), 0);

    node = new ExpressionNode('+', [1, 2]);
    assert.equal(node.depth(), 1);

    node = new ExpressionNode('+', [1, new ExpressionNode('+', [2, 3])]);
    assert.equal(node.depth(), 2);

    node = new ExpressionNode('+', [new ExpressionNode('+', [2, 3]), 1]);
    assert.equal(node.depth(), 2);

    node = new ExpressionNode('*', [
      new ExpressionNode('+', [1, 2]),
      new ExpressionNode('-', [3, 1])
    ]);
    assert.equal(node.depth(), 2);
  });

  it('getDeepestOperation', function() {
    var node;

    node = new ExpressionNode(2);
    assert.equal(node.getDeepestOperation(), null);

    node = new ExpressionNode('+', [1, 2]);
    assert.equal(node.getDeepestOperation(), node);

    // both children have same depth
    node = new ExpressionNode('+', [
      new ExpressionNode('+', [1, 2]),
      new ExpressionNode('+', [3, 4])
    ]);
    assert.equal(node.getDeepestOperation().debug(), '(+ 1 2)');

    // left is deeper
    node = new ExpressionNode('+', [new ExpressionNode('+', [1, 2]), 3]);
    assert.equal(node.getDeepestOperation().debug(), '(+ 1 2)');

    // right is deeper
    node = new ExpressionNode('+', [1, new ExpressionNode('+', [3, 4])]);
    assert.equal(node.getDeepestOperation().debug(), '(+ 3 4)');
  });

  it('collapse', function() {
    var node, result;

    node = new ExpressionNode(2);
    result = node.collapse();
    assert.equal(result, false);
    assert.equal(node.debug(), '2');

    node = new ExpressionNode('+', [1, 2]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), '3');

    node = new ExpressionNode('+', [new ExpressionNode('+', [1, 2]), 3]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), '(+ 3 3)');

    node = new ExpressionNode('+', [1, new ExpressionNode('+', [2, 3])]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), '(+ 1 5)');

    node = new ExpressionNode('*', [
      new ExpressionNode('+', [1, 2]),
      new ExpressionNode('-', [3, 1])
    ]);
    result = node.collapse();
    assert.equal(result, true);
    assert.equal(node.debug(), '(* 3 (- 3 1))');
  });

  describe('getTokenListDiff', function() {
    var node, tokenList;
    describe('expect single value', function() {
      var expected = new ExpressionNode(1);

      it('is correct', function() {
        node = new ExpressionNode(1);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [new Token(jsnums.makeFloat(1), false)]);
      });

      it('differs in value', function() {
        node = new ExpressionNode(2);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [new Token(jsnums.makeFloat(2), true)]);
      });

      it('is an expression instead', function() {
        node = new ExpressionNode('+', [1, 2]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('(', true),
          new Token(jsnums.makeFloat(1), true),
          new Token(' + ', true),
          new Token(jsnums.makeFloat(2), true),
          new Token(')', true)
        ]);
      });
    });

    describe('expect variable', function() {
      var expected = new ExpressionNode('var', []);

      it('is correct', function() {
        var node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [new Token('var', false)]);
      });

      it('has the wrong value', function() {
        var node = new ExpressionNode('different_var', []);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [new Token('different_var', true)]);
      });

      it('has a function', function() {
        var node = new ExpressionNode('f', ['x', 'y']);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('f', true),
          new Token('(', true),
          new Token('x', true),
          new Token(',', true),
          new Token('y', true),
          new Token(')', true)
        ]);
      });
    });

    describe('expect simple expression', function() {
      var expected = new ExpressionNode('+', [1, 2]);

      it('is correct', function() {
        node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('(', false),
          new Token(jsnums.makeFloat(1), false),
          new Token(' + ', false),
          new Token(jsnums.makeFloat(2), false),
          new Token(')', false)
        ]);
      });

      it('differs in value', function() {
        node = expected.clone();
        node.value_ = '-';
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('(', true),
          new Token(jsnums.makeFloat(1), true),
          new Token(' - ', true),
          new Token(jsnums.makeFloat(2), true),
          new Token(')', true)
        ]);
      });

      it('differs in child 1', function() {
        node = expected.clone();
        node.children_[0].value_ = jsnums.makeFloat(2);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('(', false),
          new Token(jsnums.makeFloat(2), true),
          new Token(' + ', false),
          new Token(jsnums.makeFloat(2), false),
          new Token(')', false)
        ]);
      });

      it('differs in child 2', function() {
        node = expected.clone();
        node.children_[1].value_ = jsnums.makeFloat(3);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('(', false),
          new Token(jsnums.makeFloat(1), false),
          new Token(' + ', false),
          new Token(jsnums.makeFloat(3), true),
          new Token(')', false)
        ]);
      });
    });

    it('works with collapse', function() {
      var original = new ExpressionNode('*', [
        new ExpressionNode('+', [1, 2]),
        new ExpressionNode('+', [3, 4])
      ]);
      var node = original.clone();
      node.collapse();

      var tokenList = node.getTokenListDiff(original);
      assert.deepEqual(tokenList, [
        new Token('(', false),
        new Token(jsnums.makeFloat(3), true),
        new Token(' * ', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(3), false),
        new Token(' + ', false),
        new Token(jsnums.makeFloat(4), false),
        new Token(')', false),
        new Token(')', false)
      ]);
    });

    describe('function calls', function() {
      var node, tokenList;
      var expected = new ExpressionNode('f', [
        new ExpressionNode(1),
        new ExpressionNode(2),
        new ExpressionNode(3)
      ]);

      it('marks nothing when calls are identical', function() {
        node = expected.clone();
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('f', false),
          new Token('(', false),
          new Token(jsnums.makeFloat(1), false),
          new Token(',', false),
          new Token(jsnums.makeFloat(2), false),
          new Token(',', false),
          new Token(jsnums.makeFloat(3), false),
          new Token(')', false)
        ]);
      });

      it('marks everything when calling function of wrong name', function() {
        node = new ExpressionNode('g', [
          new ExpressionNode(1),
          new ExpressionNode(2),
          new ExpressionNode(3)
        ]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('g', true),
          new Token('(', true),
          new Token(jsnums.makeFloat(1), true),
          new Token(',', true),
          new Token(jsnums.makeFloat(2), true),
          new Token(',', true),
          new Token(jsnums.makeFloat(3), true),
          new Token(')', true)
        ]);
      });

      it('marks only one param when one param is wrong', function() {
        node = new ExpressionNode('f', [
          new ExpressionNode(1),
          new ExpressionNode(2),
          new ExpressionNode(4)
        ]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('f', false),
          new Token('(', false),
          new Token(jsnums.makeFloat(1), false),
          new Token(',', false),
          new Token(jsnums.makeFloat(2), false),
          new Token(',', false),
          new Token(jsnums.makeFloat(4), true),
          new Token(')', false)
        ]);
      });

      it('marks all params when all are wrong', function() {
        node = new ExpressionNode('f', [
          new ExpressionNode(4),
          new ExpressionNode(5),
          new ExpressionNode(6)
        ]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('f', false),
          new Token('(', false),
          new Token(jsnums.makeFloat(4), true),
          new Token(',', false),
          new Token(jsnums.makeFloat(5), true),
          new Token(',', false),
          new Token(jsnums.makeFloat(6), true),
          new Token(')', false)
        ]);
      });

      it('marks everything but the function when wrong number of params', function() {
        node = new ExpressionNode('f', [
          new ExpressionNode(1),
          new ExpressionNode(2),
          new ExpressionNode(3),
          new ExpressionNode(4)
        ]);
        tokenList = node.getTokenListDiff(expected);
        assert.deepEqual(tokenList, [
          new Token('f', false),
          new Token('(', true),
          new Token(jsnums.makeFloat(1), true),
          new Token(',', true),
          new Token(jsnums.makeFloat(2), true),
          new Token(',', true),
          new Token(jsnums.makeFloat(3), true),
          new Token(',', true),
          new Token(jsnums.makeFloat(4), true),
          new Token(')', true)
        ]);
      });
    });

    it('diff repeaters that are the same', function() {
      var node = new ExpressionNode('/', [1, 9]);
      assert(node.collapse());
      var expected = node.clone();
      var tokenList = node.getTokenListDiff(expected);

      var jsnumber = jsnums.divide(
        jsnums.makeFloat(1).toExact(),
        jsnums.makeFloat(9).toExact()
      );

      assert.deepEqual(tokenList, [new Token(jsnumber, false)]);
    });

    it('diff repeaters with something different', function() {
      var node = new ExpressionNode('/', [1, 9]);
      assert(node.collapse());
      var expected = new ExpressionNode(0.1);
      var tokenList = node.getTokenListDiff(expected);

      var jsnumber = jsnums.divide(
        jsnums.makeFloat(1).toExact(),
        jsnums.makeFloat(9).toExact()
      );

      assert.deepEqual(tokenList, [new Token(jsnumber, true)]);
    });
  });

  describe('getTokenList', function() {
    it('single value', function() {
      var node = new ExpressionNode(1);
      assert.deepEqual(node.getTokenList(false), [
        new Token(jsnums.makeFloat(1), false)
      ]);
      assert.deepEqual(node.getTokenList(true), [
        new Token(jsnums.makeFloat(1), true)
      ]);
    });

    it('single operation', function() {
      var node = new ExpressionNode('+', [1, 2]);
      assert.deepEqual(node.getTokenList(false), [
        new Token('(', false),
        new Token(jsnums.makeFloat(1), false),
        new Token(' + ', false),
        new Token(jsnums.makeFloat(2), false),
        new Token(')', false)
      ]);
      assert.deepEqual(node.getTokenList(true), [
        new Token('(', true),
        new Token(jsnums.makeFloat(1), true),
        new Token(' + ', true),
        new Token(jsnums.makeFloat(2), true),
        new Token(')', true)
      ]);
    });

    it('left deeper', function() {
      var node = new ExpressionNode('+', [new ExpressionNode('*', [1, 2]), 3]);
      assert.deepEqual(node.getTokenList(false), [
        new Token('(', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(1), false),
        new Token(' * ', false),
        new Token(jsnums.makeFloat(2), false),
        new Token(')', false),
        new Token(' + ', false),
        new Token(jsnums.makeFloat(3), false),
        new Token(')', false)
      ]);
      assert.deepEqual(node.getTokenList(true), [
        new Token('(', false),
        new Token('(', true),
        new Token(jsnums.makeFloat(1), true),
        new Token(' * ', true),
        new Token(jsnums.makeFloat(2), true),
        new Token(')', true),
        new Token(' + ', false),
        new Token(jsnums.makeFloat(3), false),
        new Token(')', false)
      ]);
    });

    it('non repeating fraction', function() {
      var node = new ExpressionNode('/', [1, 4]);
      node.collapse();
      assert.deepEqual(node.getTokenList(false), [
        new Token(jsnums.makeFloat('0.25').toExact(), false)
      ]);
    });

    it('repeating fraction', function() {
      var node = new ExpressionNode('/', [1, 9]);
      assert(node.collapse());
      var tokenList = node.getTokenList(false);

      var jsnumber = jsnums.divide(
        jsnums.makeFloat(1).toExact(),
        jsnums.makeFloat(9).toExact()
      );

      assert.deepEqual(tokenList, [new Token(jsnumber, false)]);
    });

    it('repeating fraction after multiple collapses', function() {
      var node = new ExpressionNode('*', [1, new ExpressionNode('/', [1, 9])]);
      assert(node.collapse());
      assert(node.collapse());

      var tokenList = node.getTokenList(false);
      var jsnumber = jsnums.divide(
        jsnums.makeFloat(1).toExact(),
        jsnums.makeFloat(9).toExact()
      );

      assert.deepEqual(tokenList, [new Token(jsnumber, false)]);
    });

    it('diffs function calls that are passed expressions', function() {
      var node, tokenList;
      // f(1 + 2)
      node = new ExpressionNode('f', [new ExpressionNode('+', [1, 2])]);

      tokenList = node.getTokenList(false);
      assert.deepEqual(tokenList, [
        new Token('f', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(1), false),
        new Token(' + ', false),
        new Token(jsnums.makeFloat(2), false),
        new Token(')', false)
      ]);
    });

    it('works with nested sqrt/sqr', function() {
      var node = new ExpressionNode('sqrt', [
        new ExpressionNode('+', [
          new ExpressionNode('sqr', [3]),
          new ExpressionNode('sqr', [4])
        ])
      ]);

      var tokenList = node.getTokenList(false);
      assert.deepEqual(tokenList, [
        new Token('sqrt', false),
        new Token('(', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(3), false),
        new Token(' ^ 2', false),
        new Token(')', false),
        new Token(' + ', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(4), false),
        new Token(' ^ 2', false),
        new Token(')', false),
        new Token(')', false)
      ]);

      tokenList = node.getTokenList(true);
      assert.deepEqual(tokenList, [
        new Token('sqrt', false),
        new Token('(', false),
        new Token('(', true),
        new Token(jsnums.makeFloat(3), true),
        new Token(' ^ 2', true),
        new Token(')', true),
        new Token(' + ', false),
        new Token('(', false),
        new Token(jsnums.makeFloat(4), false),
        new Token(' ^ 2', false),
        new Token(')', false),
        new Token(')', false)
      ]);
    });
  });

  it('isEquivalentTo', function() {
    var node, target;

    node = new ExpressionNode(0);
    target = new ExpressionNode(0);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode(0);
    target = new ExpressionNode(1);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode('+', [1, 2]);
    target = new ExpressionNode('+', [1, 2]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode('+', [1, 2]);
    target = new ExpressionNode('+', [2, 1]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode(3);
    target = new ExpressionNode('+', [1, 2]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode('+', [1, 2]);
    target = new ExpressionNode('-', [1, 2]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode('+', [1, 2]);
    target = new ExpressionNode('-', [2, 1]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode('+', [1, new ExpressionNode('+', [2, 3])]);
    target = new ExpressionNode('+', [new ExpressionNode('+', [2, 3]), 1]);
    assert.equal(node.isEquivalentTo(target), true);

    node = new ExpressionNode('+', [1, new ExpressionNode('+', [2, 3])]);
    target = new ExpressionNode('+', [new ExpressionNode('+', [2, 4]), 1]);
    assert.equal(node.isEquivalentTo(target), false);

    node = new ExpressionNode('+', [
      new ExpressionNode('*', [1, 2]),
      new ExpressionNode('/', [3, 4])
    ]);
    target = new ExpressionNode('+', [
      new ExpressionNode('/', [3, 4]),
      new ExpressionNode('*', [1, 2])
    ]);
    assert.equal(node.isEquivalentTo(target), true);
  });

  describe('hasSameSignature', function() {
    it('fails if other is null', function() {
      var node = new ExpressionNode('f', [1]);
      assert.equal(node.hasSameSignature(null), false);
      assert.equal(node.hasSameSignature(), false);
    });

    it('fails if same, but not function calls', function() {
      var node = new ExpressionNode(1);
      var other = node.clone();
      assert.equal(node.hasSameSignature(other), false);
    });

    it('fails if calling different functions', function() {
      var node = new ExpressionNode('f', [1]);
      var other = new ExpressionNode('g', [1]);
      assert.equal(node.hasSameSignature(other), false);
    });

    it('fails if number of children differ', function() {
      var node = new ExpressionNode('f', [1, 2]);
      var other = new ExpressionNode('f', [1, 2, 3]);
      assert.equal(node.hasSameSignature(other), false);

      other = new ExpressionNode('f', [1]);
      assert.equal(node.hasSameSignature(other), false);
    });

    it('succeeds if identical', function() {
      var node = new ExpressionNode('f', [1, 2]);
      var other = node.clone();
      assert.equal(node.hasSameSignature(other), true);
    });

    it('succeeds if has same signature but different params', function() {
      var node = new ExpressionNode('f', [1, 2]);
      var other = new ExpressionNode('f', [3, 4]);
      assert.equal(node.hasSameSignature(other), true);
    });
  });

  describe('isDivZero', function() {
    it('returns false when not a div zero', function() {
      var node = new ExpressionNode('/', [3, 3]);
      assert(node.isDivZero() === false);
    });

    it('returns true when node is a div zero', function() {
      var node = new ExpressionNode('/', [3, 0]);
      assert(node.isDivZero() === true);
    });

    it('returns false when right child is not a number', function() {
      var node = new ExpressionNode('/', [3, new ExpressionNode('-', [1, 1])]);
      assert(node.isDivZero() === false);
    });
  });

  it('hasSameValue_', function() {
    var node, other;

    // no other
    node = new ExpressionNode(1);
    other = null;
    assert.equal(node.hasSameValue_(other), false);

    // numbers
    node = new ExpressionNode(1);
    other = new ExpressionNode(1);
    assert.equal(node.hasSameValue_(other), true);

    node = new ExpressionNode(1);
    other = new ExpressionNode(2);
    assert.equal(node.hasSameValue_(other), false);

    // strings
    node = new ExpressionNode('+', [1, 2]);
    other = new ExpressionNode('+', [1, 2]);
    assert.equal(node.hasSameValue_(other), true);

    node = new ExpressionNode('+', [1, 2]);
    other = new ExpressionNode('+', [3, 4]);
    assert.equal(node.hasSameValue_(other), true);

    node = new ExpressionNode('+', [1, 2]);
    other = new ExpressionNode('-', [3, 4]);
    assert.equal(node.hasSameValue_(other), false);
  });
});
