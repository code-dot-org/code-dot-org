var testUtils = require('../../util/testUtils');
testUtils.setupLocale('calc');

var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));
var studioApp = require(testUtils.buildPath('StudioApp')).singleton;
var Calc = require(testUtils.buildPath('calc/calc.js'));
var EquationSet = require(testUtils.buildPath('calc/equationSet.js'));
var Equation = require(testUtils.buildPath('/calc/equation.js'));
var ExpressionNode = require(testUtils.buildPath('calc/expressionNode.js'));

/**
 * This is another example of me taking advantage of the fact that our level
 * tests have a full Blockly environment. This allows me to more easily test
 * things like DOM manipulations
 */

var displayComplexUserExpressions = Calc.__testonly__.displayComplexUserExpressions;

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelDefinition: {
    solutionBlocks: '',
    requiredBlocks: '',
    freePlay: true
  },
  tests: [
    {
      description: "displayGoal",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      // Run all validation in a single test to avoid the overhead of new node
      // processes
      customValidator: customValidator,
      xml: ''
    }
  ]
};

function setEquationSets(targetSet, userSet) {
  Calc.__testonly__.appState.targetSet = targetSet;
  Calc.__testonly__.appState.userSet = userSet;
}


/**
 * Run all our custom validation. Pulled out to reduce nesting.
 */
function customValidator(assert) {
  var userExpression = document.getElementById('userExpression');
  assert(userExpression);

  var validateTextElement = function (element, textContent, className) {
    assert.equal(element.textContent, textContent);
    assert.equal(element.getAttribute('class'), className);
  };


  // compute: age_in_months
  // age = 17
  // age_in_months = age * 12
  var targetSet = new EquationSet();
  targetSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
  targetSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
  targetSet.addEquation_(new Equation('age_in_months', [],
    new ExpressionNode('*', ['age', 12])));

  displayComplexUserExpressionTest(assert, 'correct answer', function () {
    var userSet = targetSet.clone();
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 3);

    // line 1: age = 17
    var g = userExpression.children[0];
    validateTextElement(g.children[0], 'age = ', null);
    validateTextElement(g.children[1], '17', null);

    // line 2: age_in_months = (age * 12)
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], 'age', null);
    validateTextElement(g.children[3], ' * ', null);
    validateTextElement(g.children[4], '12', null);
    validateTextElement(g.children[5], ')', null);

    // line 3: age_in_months = 194
    g = userExpression.children[2];
    validateTextElement(g.children[0], 'age_in_months', null);
    validateTextElement(g.children[1], ' = ', null);
    validateTextElement(g.children[2], '204', null);
  });

  displayComplexUserExpressionTest(assert, 'correct answer with different age', function () {
    // compute: age_in_months
    // age = 10
    // age_in_months = age * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(10)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 3);

    // line 1: age = 10
    var g = userExpression.children[0];
    validateTextElement(g.children[0], 'age = ', null);
    validateTextElement(g.children[1], '10', null);

    // line 2: age_in_months = (age * 12)
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], 'age', null);
    validateTextElement(g.children[3], ' * ', null);
    validateTextElement(g.children[4], '12', null);
    validateTextElement(g.children[5], ')', null);

    // line 3: age_in_months = 120
    g = userExpression.children[2];
    validateTextElement(g.children[0], 'age_in_months', null);
    validateTextElement(g.children[1], ' = ', null);
    validateTextElement(g.children[2], '120', null);
  });

  displayComplexUserExpressionTest(assert, 'age hard coded', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = 17 * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', [17, 12])));
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 3);

    // line 1: age = 17
    var g = userExpression.children[0];
    validateTextElement(g.children[0], 'age = ', null);
    validateTextElement(g.children[1], '17', null);

    // line 2: age_in_months = (17 * 12)
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], '17', null);
    validateTextElement(g.children[3], ' * ', null);
    validateTextElement(g.children[4], '12', null);
    validateTextElement(g.children[5], ')', null);

    // line 3: age_in_months = 120
    g = userExpression.children[2];
    validateTextElement(g.children[0], 'age_in_months', null);
    validateTextElement(g.children[1], ' = ', null);
    validateTextElement(g.children[2], '204', null);
  });

  displayComplexUserExpressionTest(assert, 'wrong variable name', function () {
    // compute: age_in_months2
    // age = 17
    // age_in_months2 = age * 12
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months2')));
    userSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    userSet.addEquation_(new Equation('age_in_months2', [],
      new ExpressionNode('*', ['age', 12])));
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 3);

    // line 1: age = 10
    var g = userExpression.children[0];
    validateTextElement(g.children[0], 'age = ', null);
    validateTextElement(g.children[1], '17', null);

    // line 2: age_in_months = (age * 12)
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months2 = ', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], 'age', null);
    validateTextElement(g.children[3], ' * ', null);
    validateTextElement(g.children[4], '12', null);
    validateTextElement(g.children[5], ')', null);

    // line 3: age_in_months = 120
    g = userExpression.children[2];
    validateTextElement(g.children[0], 'age_in_months2', 'errorToken');
    validateTextElement(g.children[1], ' = ', null);
    validateTextElement(g.children[2], '204', null);
  });

  return true;
}

/**
 * Run a single test, initially clearing contents of answerExpression. Done
 * mostly to clearly delineate between test cases.
 * @param {Function} assert Assert object passed through from executor
 * @param {string} description Describe this test. Used just for readability
 * @param {Function} fn Code to run
 */
function displayComplexUserExpressionTest(assert, description, fn) {
  var userExpression = document.getElementById('userExpression');
  userExpression.innerHTML = ''; // clear children

  fn();
}
