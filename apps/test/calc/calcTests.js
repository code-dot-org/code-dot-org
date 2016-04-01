var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');
testUtils.setupLocale('calc');

var Calc = require('@cdo/apps/calc/calc.js');
var EquationSet = require('@cdo/apps/calc/equationSet.js');
var Equation = require('@cdo/apps/calc/equation.js');
var ExpressionNode = require('@cdo/apps/calc/expressionNode.js');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var ResultType = require('@cdo/apps/constants.js').ResultType;
var calcMsg = require('@cdo/apps/calc/locale');

describe('evaluateResults_/evaluateFunction_', function () {
  it('fails when callers have different compute signatures', function () {
    // f(x, y) = x + y
    // f(2, 2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x', 'y'], new ExpressionNode('+', ['x', 'y'])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [1, 2])));


    // f(x) = x + x
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 'x'])));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

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
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    // f(x) = x + 2
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 2])));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);

    // Make sure evaluateResults_ takes us down the evaluateFucntion_ path
    var otherOutcome = Calc.evaluateResults_(targetSet, userSet);
    assert.deepEqual(outcome, otherOutcome);
  });

  it('fails when evaluate is different for non-compute inputs', function () {
    // f(x) = x + 1
    // f(2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    // f(x) = 3
    // f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode(3)));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.notEqual(outcome.message, undefined);
    assert.deepEqual(outcome.failedInput, [1]);
  });

  it('fails when target has computesFunctionCall, userSet does not', function () {
    // f(x) = x + 1
    // f(2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    // f(x) = x = 1
    // yvar = 1
    // f(2) + yvar
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    userSet.addEquation_(new Equation('yvar', [], new ExpressionNode(1)));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [
      new ExpressionNode('f', [2]),
      new ExpressionNode('yvar')
    ])));

    var outcome = Calc.evaluateFunction_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);

    // Make sure evaluateResults_ takes us down the evaluateFucntion_ path
    var otherOutcome = Calc.evaluateResults_(targetSet, userSet);
    assert.deepEqual(outcome, otherOutcome);
  });

  it('fails when target is simple expression and userSet computesFunctionCall', function () {
    // compute: 1 + 2
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [1, 2])));

    // f(x) = x
    // compute: f(3)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [3])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  it('fails when target hasVariablesOrFunctions and user does not', function () {
    // x = 1
    // y = 2
    // compute: x + y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', [], new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', [], new ExpressionNode(2)));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', ['x', 'y'])));

    // compute: 1 + 2
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [1, 2])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.LEVEL_INCOMPLETE_FAIL);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  it('fails when we have the wrong input but right function', function () {
    // f(x) = x + 1
    // compute: f(1)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [1])));

    // f(x) = x + 1
    // compute: f(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('+', ['x', 1])));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [2])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.wrongInput());
    assert.equal(outcome.failedInput, null);
  });

  it('succeeds when user/target both have multiple variables and are identical', function () {
    // x = 1
    // y = x + 1
    // compute: y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', [], new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', [], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('y')));

    // x = 1
    // y = x + 1
    // compute: y
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('x', [], new ExpressionNode(1)));
    userSet.addEquation_(new Equation('y', [], new ExpressionNode('+', ['x', 1])));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('y')));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.SUCCESS);
    assert.equal(outcome.testResults, TestResults.ALL_PASS);
    assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });

  it('fails when user/target both have multiple variables and are different', function () {
    // x = 1
    // y = x + 1
    // compute: y
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('x', [], new ExpressionNode(1)));
    targetSet.addEquation_(new Equation('y', [], new ExpressionNode('+', ['x', 1])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('y')));

    // x = 1
    // y = x + 2
    // compute: y
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('x', [], new ExpressionNode(1)));
    userSet.addEquation_(new Equation('y', [], new ExpressionNode('+', ['x', 2])));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('y')));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    // assert.equal(outcome.message, undefined);
    assert.equal(outcome.failedInput, null);
  });
});

describe('evaluateResults_/evaluateSingleVariable_', function () {
  var targetSet;

  before(function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = age * 12
    targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    targetSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    targetSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));
  });

  it('when user doesnt have age variable', function () {
    // compute: age_in_months
    // age_in_months = 17 * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', [17, 12])));

    assert.deepEqual(targetSet.evaluate(), userSet.evaluate());

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.missingVariableX({var: 'age'}));
    assert.equal(outcome.failedInput, null);
  });

  it('when user has age variable, but hard codes age instead of using variable', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = 17 * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', [17, 12])));

    assert.deepEqual(targetSet.evaluate(), userSet.evaluate());

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.wrongOtherValuesX({var: 'age'}));
    assert.deepEqual(outcome.failedInput, [1]);
  });

  it('when user has age variable, but wrong expression', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = age * 10
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 10])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.wrongResult());
    assert.equal(outcome.failedInput, null);
  });

  it('when user has different age variable, and hard codes age instead of using ' +
      'variable', function () {
    // compute: age_in_months
    // age = 12
    // age_in_months = 17 * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(12)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', [17, 12])));

    assert.deepEqual(targetSet.evaluate(), userSet.evaluate());

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.wrongOtherValuesX({var: 'age'}));
    assert.deepEqual(outcome.failedInput, [1]);
  });

  it('when user has the wrong compute expression', function () {
    // compute: 194
    // age = 17
    // age_in_months = age * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode(194)));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.FAILURE);
    assert.equal(outcome.testResults, TestResults.APP_SPECIFIC_FAIL);
    assert.equal(outcome.message, calcMsg.levelIncompleteError());
    assert.equal(outcome.failedInput, null);
  });

  it('when users age variable is the same, and their answer is right', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = age * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.SUCCESS);
    assert.equal(outcome.testResults, TestResults.ALL_PASS);
    assert.equal(outcome.message, null);
    assert.equal(outcome.failedInput, null);
  });

  it('when users age variable is different, and their answer is right', function () {
    // compute: age_in_months
    // age = 12
    // age_in_months = age * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(12)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.SUCCESS);
    assert.equal(outcome.testResults, TestResults.ALL_PASS);
    assert.equal(outcome.message, null);
    assert.equal(outcome.failedInput, null);
  });

  it('when user gets the right answer using a slightlly different equation', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = (age * 6) * 2
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', [
        new ExpressionNode('*', ['age', 6]),
        2
      ])
    ));

    var outcome = Calc.evaluateResults_(targetSet, userSet);
    assert.equal(outcome.result, ResultType.SUCCESS);
    assert.equal(outcome.testResults, TestResults.ALL_PASS);
    assert.equal(outcome.message, null);
    assert.equal(outcome.failedInput, null);

  });

});
