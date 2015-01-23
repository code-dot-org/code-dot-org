var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('./util/testUtils');

var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode'));
var EquationSet = require(testUtils.buildPath('/calc/equationSet'));
var Equation = EquationSet.Equation;

describe('ExpressionSet', function () {
  it('evaluate', function () {
    // f(1,2)
    var computeExpression = new ExpressionNode('f', [1, 2]);
    // f(x,y) = ((2 * x) + y)
    var fnExpression = new ExpressionNode('+', [
      new ExpressionNode('*', [2, 'x']),
      new ExpressionNode('y')
    ]);

    var set = new EquationSet();
    set.addEquation(new Equation(null, computeExpression));
    set.addEquation(new Equation('f(x,y)', fnExpression));

    debugger;
    assert.equal(set.evaluate(), 4);


  });

});
