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
    var i = 0;
    validateTextElement(g.children[i++], 'age = ', null);
    validateTextElement(g.children[i++], '17', null);

    // line 2: age_in_months = (age * 12)
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], 'age', null);
    validateTextElement(g.children[2], ' * ', null);
    validateTextElement(g.children[3], '12', null);

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

    // line 2: age_in_months = age * 12
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], 'age', null);
    validateTextElement(g.children[2], ' * ', null);
    validateTextElement(g.children[3], '12', null);

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

    // line 2: age_in_months = 17 * 12
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months = ', null);
    validateTextElement(g.children[1], '17', null);
    validateTextElement(g.children[2], ' * ', null);
    validateTextElement(g.children[3], '12', null);

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

    // line 2: age_in_months = age * 12
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'age_in_months2 = ', null);
    validateTextElement(g.children[1], 'age', null);
    validateTextElement(g.children[2], ' * ', null);
    validateTextElement(g.children[3], '12', null);

    // line 3: age_in_months = 120
    g = userExpression.children[2];
    validateTextElement(g.children[0], 'age_in_months2', 'errorToken');
    validateTextElement(g.children[1], ' = ', null);
    validateTextElement(g.children[2], '204', null);
  });

  displayComplexUserExpressionTest(assert, 'divide by zero error', function () {
    // compute: f(10)
    // f(i) = 4 / (4 - 4)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [10])));
    userSet.addEquation_(new Equation('f', ['i'], new ExpressionNode('/', [
      new ExpressionNode(4),
      new ExpressionNode('-', [4, 4])
    ])));

    // target is similar, but no div 0
    // compute: f(10)
    // f(i) = 4 / (5 - 4)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [10])));
    targetSet.addEquation_(new Equation('f', ['i'], new ExpressionNode('/', [
      new ExpressionNode(4),
      new ExpressionNode('-', [4, 4])
    ])));

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 2);

    // line 1: f(i) = 4 / (4 - 4)
    var g = userExpression.children[0];
    validateTextElement(g.children[0], 'f(i) = ', null);
    validateTextElement(g.children[1], '4', null);
    validateTextElement(g.children[2], ' / ', null);
    validateTextElement(g.children[3], '(', null);
    validateTextElement(g.children[4], '4', null);
    validateTextElement(g.children[5], ' - ', null);
    validateTextElement(g.children[6], '4', null);
    validateTextElement(g.children[7], ')', null);


    // line 2: f(10)
    // Note that there's no = (result), because we have a divide by zero error
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'f', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], '10', null);
    validateTextElement(g.children[3], ')', null);
  });

  displayComplexUserExpressionTest(assert, 'divide by zero error during freeplay', function () {
    // same thing as previous test, but no targetSet
    // compute: f(10)
    // f(i) = 4 / (4 - 4)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [10])));
    userSet.addEquation_(new Equation('f', ['i'], new ExpressionNode('/', [
      new ExpressionNode(4),
      new ExpressionNode('-', [4, 4])
    ])));
    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 2);

    // line 1: f(i) = 4 / (4 - 4)
    var g = userExpression.children[0];
    var i = 0;
    validateTextElement(g.children[i++], 'f(i) = ', null);
    validateTextElement(g.children[i++], '4', null);
    validateTextElement(g.children[i++], ' / ', null);
    validateTextElement(g.children[i++], '(', null);
    validateTextElement(g.children[i++], '4', null);
    validateTextElement(g.children[i++], ' - ', null);
    validateTextElement(g.children[i++], '4', null);
    validateTextElement(g.children[i++], ')', null);
    assert.equal(g.children.length, i);


    // line 2: f(10)
    // Note that there's no = (result), because we have a divide by zero error
    g = userExpression.children[1];
    validateTextElement(g.children[0], 'f', null);
    validateTextElement(g.children[1], '(', null);
    validateTextElement(g.children[2], '10', null);
    validateTextElement(g.children[3], ')', null);
    assert.equal(g.children.length, 4);
  });

  displayComplexUserExpressionTest(assert, 'divide by zero error with simple target', function () {
    // compute: 4 / (4 - 4)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('/', [
      new ExpressionNode(4),
      new ExpressionNode('-', [4, 4])
    ])));

    // target has no functions
    // compute: 1 + 2
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [1, 2])));

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 1);

    // line 1: 4 / (4 - 4)
    var g = userExpression.children[0];
    var i = 0;
    validateTextElement(g.children[i++], '4', 'errorToken');
    validateTextElement(g.children[i++], ' / ', 'errorToken');
    validateTextElement(g.children[i++], '(', 'errorToken');
    validateTextElement(g.children[i++], '4', 'errorToken');
    validateTextElement(g.children[i++], ' - ', 'errorToken');
    validateTextElement(g.children[i++], '4', 'errorToken');
    validateTextElement(g.children[i++], ')', 'errorToken');
    assert.equal(g.children.length, i);
  });

  displayComplexUserExpressionTest(assert, 'non repeating fraction', function () {
    // compute: 1 / 4
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('/', [1, 4])));
    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 1);

    // line 1: 1 / 4 = 0.25
    var g = userExpression.children[0];
    var i = 0;
    validateTextElement(g.children[i++], '1', null);
    validateTextElement(g.children[i++], ' / ', null);
    validateTextElement(g.children[i++], '4', null);
    validateTextElement(g.children[i++], ' = ', null);
    validateTextElement(g.children[i++], '0.25', null);
    assert.equal(g.children.length, i);
  });

  displayComplexUserExpressionTest(assert, 'repeating fraction', function () {
    // compute: 1 / 9
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('/', [1, 9])));
    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.children.length, 1);

    // line 1: (1 / 9) = 0._1
    var g = userExpression.children[0];
    var i = 0;
    validateTextElement(g.children[i++], '1', null);
    validateTextElement(g.children[i++], ' / ', null);
    validateTextElement(g.children[i++], '9', null);
    validateTextElement(g.children[i++], ' = ', null);
    var text = g.children[i++];
    assert.equal(text.children.length, 2);
    validateTextElement(text.children[0], '0.', null);
    validateTextElement(text.children[1], '1', null);
    assert.equal(text.children[1].getAttribute('style'), 'text-decoration: overline');
    assert.equal(g.children.length, i);
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
