var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('./util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var EquationSet = require(testUtils.buildPath('/calc/equationSet'));
var Equation = EquationSet.Equation;

describe('ExpressionSet', function () {
  it('can evaluate a semi-complex function', function () {
    // f(1,2)
    var computeExpression = new ExpressionNode('f', [1, 2]);
    // f(x,y) = ((2 * x) + y)
    var fnExpression = new ExpressionNode('+', [
      new ExpressionNode('*', [2, 'x']),
      new ExpressionNode('y')
    ]);

    var set = new EquationSet();
    set.addEquation(new Equation('f(x,y)', fnExpression));
    set.addEquation(new Equation(null, computeExpression));

    assert.equal(set.evaluate(), 4);
  });

  it('can evaluate a set of variables', function () {
    var set = new EquationSet();
    // x = 1
    set.addEquation(new Equation('x', new ExpressionNode(1)));
    // y = x + 2
    set.addEquation(new Equation('y', new ExpressionNode('+', ['x', 2])));
    // compute
    set.addEquation(new Equation(null, new ExpressionNode('y')));

    assert.equal(set.evaluate(), 3);
  });

  it('throws if trying to resolve an unresolveable set of variables', function () {
    var set = new EquationSet();
    set.addEquation(new Equation('z', new ExpressionNode(0)));
    set.addEquation(new Equation(null, new ExpressionNode('y')));

    assert.throws(function () {
      set.evaluate();
    });
  });

  it('can evaluate with a different compute expression', function () {
    var set = new EquationSet();
    // f(x) = x + 1
    // f(1)
    set.addEquation(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
    set.addEquation(new Equation(null, new ExpressionNode('f', [1])));

    assert.equal(set.evaluate(), 2);

    // f(2)
    var newCompute = new ExpressionNode('f', [2]);
    assert.equal(set.evaluateWithExpression(newCompute), 3);

  });

});
