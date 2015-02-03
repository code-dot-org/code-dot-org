var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');
testUtils.setupLocales();

var Calc = require(testUtils.buildPath('/calc/calc.js'));
var EquationSet = require(testUtils.buildPath('/calc/equationSet.js'));
var Equation = EquationSet.Equation;
var ExpressionNode = require(testUtils.buildPath('/calc/expressionNode.js'));
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var ResultType = require(testUtils.buildPath('constants.js')).ResultType;

describe('evaluateResults_/evaluateFunction_', function () {
  it('fails when callers have different compute signatures', function () {
    // f(x, y) = x + y
    // f(2, 2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f(x,y)', new ExpressionNode('+', ['x', 'y'])));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('f', [1,2])));


    // f(x) = x + x
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 'x'])));
    userSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);

    // Make sure evaluateResults_ takes us down the evaluateFucntion_ path
    var otherOutcome = Calc.evaluateResults_(targetSet, userSet);
    assert.deepEqual(outcome, otherOutcome);
  });

  it("fails if userSet gets different result for targetSet's compute expression", function () {
    // f(x) = x + 1
    // f(2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));

    // f(x) = x + 2
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 2])));
    userSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);

    // Make sure evaluateResults_ takes us down the evaluateFucntion_ path
    var otherOutcome = Calc.evaluateResults_(targetSet, userSet);
    assert.deepEqual(outcome, otherOutcome);
  });

  // TODO - figure out locale stuff in calc
  // it('fails when evaluate is different for non-compute inputs', function () {
  //   // f(x) = x + 1
  //   // f(2)
  //   var targetSet = new EquationSet();
  //   targetSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
  //   targetSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));
  //
  //   // f(x) = 3
  //   // f(2)
  //   var userSet = new EquationSet();
  //   userSet.addEquation_(new Equation('f(x)', new ExpressionNode(3)));
  //   userSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));
  //
  //   debugger;
  //   var outcome = Calc.evaluateFunction_(targetSet, userSet);
  //   assert.equal(outcome.result, ResultType.FAILURE);
  //   assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
  //   assert.notEqual(outcome.message, undefined);
  //   assert.deepEqual(outcome.failedInput, [0,0,0]);
  // });

  it('fails when target has singleFunction, userSet does not', function () {
    // f(x) = x + 1
    // f(2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));

    // f(x) = x = 1
    // yvar = 1
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f(x)', new ExpressionNode('+', ['x', 1])));
    userSet.addEquation_(new Equation('yvar', new ExpressionNode(1)));
    userSet.addEquation_(new Equation(null, new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);

    // Make sure evaluateResults_ takes us down the evaluateFucntion_ path
    var otherOutcome = Calc.evaluateResults_(targetSet, userSet);
    assert.deepEqual(outcome, otherOutcome);
  });

  // TODO (brent)- i think we want a more integration level test for this scenario too
  it('fails when target is simple expression and userSet hasSingleFunction', function () {
    // compute: 1 + 2
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, new ExpressionNode('+', [1, 2])));

    // f(x) = x
    // compute: f(3)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f(x)', new ExpressionNode('x')));
    userSet.addEquation_(new Equation(null, new ExpressionNode('f', [3])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  // TODO (brent)- i think we want a more integration level test for this scenario too
  it('fails when target hasVariablesOrFunctions and user does not', function () {
    // x = 1
    // y = 2
    // compute: x + y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', new ExpressionNode(2)));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('+', ['x', 'y'])));

    // compute: 1 + 2
    var userSet = new EquationSet();
    userSet.addEquation_(new EquationSet(null, new ExpressionNode('+', [1, 2])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  it('succeeds when user/target both have multiple variables and are identical', function () {
    // x = 1
    // y = x + 1
    // compute: y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('y')));

    // x = 1
    // y = x + 1
    // compute: y
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('x', new ExpressionNode(1)));
    userSet.addEquation_(new Equation('y', new ExpressionNode('+', ['x', 1])));
    userSet.addEquation_(new Equation(null, new ExpressionNode('y')));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.SUCCESS);
    assert.equal(outcome.testResults, TestResults.ALL_PASS);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  it('succeeds when user/target both have multiple variables and are different', function () {
    // x = 1
    // y = x + 1
    // compute: y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, new ExpressionNode('y')));

    // x = 1
    // y = x + 2
    // compute: y
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('x', new ExpressionNode(1)));
    userSet.addEquation_(new Equation('y', new ExpressionNode('+', ['x', 2])));
    userSet.addEquation_(new Equation(null, new ExpressionNode('y')));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });
});
