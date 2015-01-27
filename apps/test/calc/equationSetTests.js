var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var EquationSet = require(testUtils.buildPath('/calc/equationSet'));
var Equation = EquationSet.Equation;

describe('ExpressionSet', function () {
  describe('addEquation_', function () {
    it('can add a compute equation', function () {
      var set = new EquationSet();
      assert.equal(set.compute_, null);
      assert.equal(set.equations_.length, 0);

      var computeExpression = new ExpressionNode('1');
      var equation = new Equation(null, computeExpression);
      set.addEquation_(equation);
      assert.equal(set.compute_, equation);
      assert.equal(set.equations_.length, 0);
    });

    it('can add non-compute equations', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation('one', new ExpressionNode(1)));
      assert.equal(set.equations_.length, 1);
      assert.equal(set.equations_[0].name, 'one');
      set.addEquation_(new Equation('two', new ExpressionNode(2)));
      assert.equal(set.equations_.length, 2);
      assert.equal(set.equations_[1].name, 'two');
    });

    it('doesnt allow duplicates', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(1)));
      assert.throws(function () {
        set.addEquation_(new Equation(null, new ExpressionNode(2)));
      });
      set.addEquation_(new Equation('one', new ExpressionNode(1)));
      assert.throws(function () {
        set.addEquation_(new Equation('one', new ExpressionNode(3)));
      });
    });
  });

  describe('getEquation', function () {
    var set = new EquationSet();
    var computeEquation = new Equation(null, new ExpressionNode(0));
    var equationOne = new Equation('one', new ExpressionNode(1));
    var equationTwo = new Equation('two', new ExpressionNode(2));
    set.addEquation_(computeEquation);
    set.addEquation_(equationOne);
    set.addEquation_(equationTwo);

    it('gets compute equation when given null', function () {
      assert.equal(set.getEquation(null), computeEquation);
    });

    it('gets equation with matching name when given a name', function () {
      assert.equal(set.getEquation('one'), equationOne);
      assert.equal(set.getEquation('two'), equationTwo);
    });

    it('returns null when no equation with that name', function () {
      assert.equal(set.getEquation('three'), null);
    });
  });

  describe('hasVariablesOrFunctions', function () {
    var set = new EquationSet();
    set.addEquation_(new Equation(null, new ExpressionNode(0)));

    it('returns false when we only have a compute equation', function () {
      assert.equal(set.hasVariablesOrFunctions(), false);
    });

    it('returns true when we have a variable or function', function () {
      set.addEquation_(new Equation('x', new ExpressionNode(1)));
      assert.equal(set.hasVariablesOrFunctions(), true);
    });
  });

  describe('singleFunction', function () {
    it('returns null if we have no functions or variables', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(0)));
      assert.equal(set.singleFunction(), null);
    });

    it('returns null if we have no functions, but do have variables', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(0)));
      set.addEquation_(new Equation('x', new ExpressionNode(1)));
      assert.equal(set.singleFunction(), null);
    });

    it('returns null if we have multiple functions', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(0)));
      set.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
      set.addEquation_(new Equation('g(x)', new ExpressionNode('+', ['x', 1])));
      assert.equal(set.singleFunction(), null);
    });

    it('returns null if we have one function and one or more variables', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(0)));
      set.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
      set.addEquation_(new Equation('y', new ExpressionNode(1)));
      debugger;
      assert.equal(set.singleFunction(), null);
    });

    it('returns the function Equation if we have exactly one function and no variables', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation(null, new ExpressionNode(0)));
      var functionEquation = new Equation('f(x)', new ExpressionNode('+', ['x', 1]));
      set.addEquation_(functionEquation);
      assert.equal(set.singleFunction(), functionEquation);
    });
  });

  describe('isIdenticalTo', function () {
    var computeExpression = new ExpressionNode(0);
    var expression1 = new ExpressionNode(1);
    var expression2 = new ExpressionNode(2);
    var expression3 = new ExpressionNode(3);

    it('returns false when differing numbers of equations', function () {
      var set1 = new EquationSet();
      var set2 = new EquationSet();

      set1.addEquation_(new Equation(null, computeExpression));
      set1.addEquation_(new Equation('one', expression1));
      set1.addEquation_(new Equation('two', expression2));

      set2.addEquation_(new Equation(null, computeExpression));
      set2.addEquation_(new Equation('one', expression1));
      set2.addEquation_(new Equation('two', expression2));
      set2.addEquation_(new Equation('three', expression3));

      assert.equal(set1.isIdenticalTo(set2), false);
    });

    it('returns false when same expressions but different names', function () {
      var set1 = new EquationSet();
      var set2 = new EquationSet();

      set1.addEquation_(new Equation(null, computeExpression));
      set1.addEquation_(new Equation('one', expression1));
      set1.addEquation_(new Equation('two', expression2));

      set2.addEquation_(new Equation(null, computeExpression));
      set2.addEquation_(new Equation('one', expression1));
      set2.addEquation_(new Equation('NOTtwo', expression2));

      assert.equal(set1.isIdenticalTo(set2), false);
    });

    it('returns false when compute expressions differ but others are the same', function () {
      var set1 = new EquationSet();
      var set2 = new EquationSet();

      set1.addEquation_(new Equation(null, new ExpressionNode(0)));
      set1.addEquation_(new Equation('one', expression1));
      set1.addEquation_(new Equation('two', expression2));
      set1.addEquation_(new Equation('three', expression3));

      set2.addEquation_(new Equation(null, new ExpressionNode(1)));
      set2.addEquation_(new Equation('one', expression1));
      set2.addEquation_(new Equation('two', expression2));
      set2.addEquation_(new Equation('three', expression3));

      assert.equal(set1.isIdenticalTo(set2), false);
    });

    it('returns false when same names, but different expressions', function () {
      var set1 = new EquationSet();
      var set2 = new EquationSet();

      set1.addEquation_(new Equation(null, new ExpressionNode(0)));
      set1.addEquation_(new Equation('one', expression1));
      set1.addEquation_(new Equation('two', expression2));
      set1.addEquation_(new Equation('three', expression3));

      set2.addEquation_(new Equation(null, new ExpressionNode(1)));
      set2.addEquation_(new Equation('one', expression1));
      set2.addEquation_(new Equation('two', expression3));
      set2.addEquation_(new Equation('three', expression2));

      assert.equal(set1.isIdenticalTo(set2), false);
    });

    it('returns true when identical', function () {
      var set1 = new EquationSet();
      var set2 = new EquationSet();

      set1.addEquation_(new Equation(null, computeExpression));
      set1.addEquation_(new Equation('one', expression1));
      set1.addEquation_(new Equation('two', expression2));
      set1.addEquation_(new Equation('three', expression3));

      set2.addEquation_(new Equation(null, computeExpression));
      set2.addEquation_(new Equation('one', expression1));
      set2.addEquation_(new Equation('two', expression2));
      set2.addEquation_(new Equation('three', expression3));

      assert.equal(set1.isIdenticalTo(set2), true);
    });
  });

  describe('evaluate', function () {
    it('can evaluate a semi-complex function', function () {
      // f(1,2)
      var computeExpression = new ExpressionNode('f', [1, 2]);
      // f(x,y) = ((2 * x) + y)
      var fnExpression = new ExpressionNode('+', [
        new ExpressionNode('*', [2, 'x']),
        new ExpressionNode('y')
      ]);

      var set = new EquationSet();
      set.addEquation_(new Equation('f(x,y)', fnExpression));
      set.addEquation_(new Equation(null, computeExpression));

      assert.equal(set.evaluate(), 4);
    });

    it('can evaluate a set of variables', function () {
      var set = new EquationSet();
      // x = 1
      set.addEquation_(new Equation('x', new ExpressionNode(1)));
      // y = x + 2
      set.addEquation_(new Equation('y', new ExpressionNode('+', ['x', 2])));
      // compute
      set.addEquation_(new Equation(null, new ExpressionNode('y')));

      assert.equal(set.evaluate(), 3);
    });

    it('throws if trying to resolve an unresolveable set of variables', function () {
      var set = new EquationSet();
      set.addEquation_(new Equation('z', new ExpressionNode(0)));
      set.addEquation_(new Equation(null, new ExpressionNode('y')));

      assert.throws(function () {
        set.evaluate();
      });
    });

    it('can evaluate with a different compute expression', function () {
      var set = new EquationSet();
      // f(x) = x + 1
      // f(1)
      set.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
      set.addEquation_(new Equation(null, new ExpressionNode('f', [1])));

      assert.equal(set.evaluate(), 2);

      // f(2)
      var newCompute = new ExpressionNode('f', [2]);
      assert.equal(set.evaluateWithExpression(newCompute), 3);

    });
  });

});
