import {TestResults} from '@cdo/apps/constants';
var Calc = require('@cdo/apps/calc/calc.js');
var EquationSet = require('@cdo/apps/calc/equationSet.js');
var Equation = require('@cdo/apps//calc/equation.js');
var ExpressionNode = require('@cdo/apps/calc/expressionNode.js');

/**
 * This is another example of me taking advantage of the fact that our level
 * tests have a full Blockly environment. This allows me to more easily test
 * things like DOM manipulations
 */

var displayGoal = Calc.__testonly__.displayGoal;

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
      customValidator: displayGoalCustomValidator,
      xml: ''
    }
  ]
};

function replaceSpaces(str) {
  return str.replace(/ /g, '\u00A0\u00A0');
}

/**
 * Run all our custom validation. Pulled out to reduce nesting.
 */
function displayGoalCustomValidator(assert) {
  var answerExpression = document.getElementById('answerExpression');
  assert(answerExpression);

  displayGoalTest(assert, 'simple target', function () {
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode(5)));

    displayGoal(targetSet);

    assert.equal(answerExpression.childElementCount, 1);

    var g = answerExpression.firstElementChild;
    assert.equal(g.childNodes.length, 1);
    assert.equal(g.childNodes[0].textContent, "5");
    assert.equal(g.childNodes[0].getAttribute('class'), null);
  });

  displayGoalTest(assert, 'single function', function () {
    // f(x) = x
    // compute: f(5)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [5])));

    displayGoal(targetSet);

    assert.equal(answerExpression.childElementCount, 1);

    // f(5) = 5
    var g = answerExpression.firstElementChild;
    // assert.equal(g.childNodes.length, 1);
    assert.equal(g.childNodes[0].textContent, "f");
    assert.equal(g.childNodes[0].getAttribute('class'), null);
    assert.equal(g.childNodes[1].textContent, "(");
    assert.equal(g.childNodes[1].getAttribute('class'), null);
    assert.equal(g.childNodes[2].textContent, "5");
    assert.equal(g.childNodes[2].getAttribute('class'), null);
    assert.equal(g.childNodes[3].textContent, ")");
    assert.equal(g.childNodes[3].getAttribute('class'), null);
    assert.equal(g.childNodes[4].textContent, replaceSpaces(" = "));
    assert.equal(g.childNodes[4].getAttribute('class'), null);
    assert.equal(g.childNodes[5].textContent, replaceSpaces("5"));
    assert.equal(g.childNodes[5].getAttribute('class'), null);
  });

  displayGoalTest(assert, 'multiple functions', function () {
    // f(x) = x
    // g(y) = y
    // compute: f(1) + g(2)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    targetSet.addEquation_(new Equation('g', ['y'], new ExpressionNode('y')));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [
      new ExpressionNode('f', [1]),
      new ExpressionNode('g', [2]),
    ])));

    assert.throws(function () {
      displayGoal(targetSet);
    });

  });

  displayGoalTest(assert, 'function and variable', function () {
    // f(x) = x
    // myvar = 1
    // compute: f(1) + myvar
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    targetSet.addEquation_(new Equation('myvar', [], new ExpressionNode(1)));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [
      new ExpressionNode('f', [1]),
      new ExpressionNode('myvar'),
    ])));

    assert.throws(function () {
      displayGoal(targetSet);
    });
  });

  displayGoalTest(assert, 'function that calls another function', function () {
    // f(x) = x
    // g(y) = f(y)
    // compute: g(1)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    targetSet.addEquation_(new Equation('g', ['y'], new ExpressionNode('f', ['y'])));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('g', [1])));

    displayGoal(targetSet);

    // Line 1: g(1) = 1
    var g = answerExpression.firstElementChild;
    // assert.equal(g.childNodes.length, 1);
    assert.equal(g.childNodes[0].textContent, "g");
    assert.equal(g.childNodes[0].getAttribute('class'), null);
    assert.equal(g.childNodes[1].textContent, "(");
    assert.equal(g.childNodes[1].getAttribute('class'), null);
    assert.equal(g.childNodes[2].textContent, "1");
    assert.equal(g.childNodes[2].getAttribute('class'), null);
    assert.equal(g.childNodes[3].textContent, ")");
    assert.equal(g.childNodes[3].getAttribute('class'), null);
    assert.equal(g.childNodes[4].textContent, replaceSpaces(" = "));
    assert.equal(g.childNodes[4].getAttribute('class'), null);
    assert.equal(g.childNodes[5].textContent, replaceSpaces("1"));
    assert.equal(g.childNodes[5].getAttribute('class'), null);
  });

  displayGoalTest(assert, 'single variable in compute', function () {
    // compute: age_in_months
    // age = 17
    // age_in_months = age * 12
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('age_in_months')));
    targetSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));
    targetSet.addEquation_(new Equation('age_in_months', [],
      new ExpressionNode('*', ['age', 12])));

    displayGoal(targetSet);

    assert.equal(answerExpression.childElementCount, 1);

    var g = answerExpression.firstElementChild;
    assert.equal(g.childNodes.length, 1);
    assert.equal(g.childNodes[0].textContent, "age_in_months");
    assert.equal(g.childNodes[0].getAttribute('class'), null);
  });

  displayGoalTest(assert, 'variables without single variable in compute', function () {
    // compute: age * 12
    // age = 17
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [],
      new ExpressionNode('*', ['age', 12])));
    targetSet.addEquation_(new Equation('age', [], new ExpressionNode(17)));

    displayGoal(targetSet);

    assert.equal(answerExpression.childElementCount, 2);

    var g = answerExpression.firstElementChild;
    assert.equal(g.childNodes.length, 2);
    assert.equal(g.childNodes[0].textContent, replaceSpaces("age = "));
    assert.equal(g.childNodes[0].getAttribute('class'), null);
    assert.equal(g.childNodes[1].textContent, "17");
    assert.equal(g.childNodes[1].getAttribute('class'), null);

    g = answerExpression.childNodes[1];

    assert.equal(g.childNodes[0].textContent, "age");
    assert.equal(g.childNodes[0].getAttribute('class'), null);
    assert.equal(g.childNodes[1].textContent, replaceSpaces(" * "));
    assert.equal(g.childNodes[1].getAttribute('class'), null);
    assert.equal(g.childNodes[2].textContent, "12");
    assert.equal(g.childNodes[2].getAttribute('class'), null);
    assert.equal(g.childNodes.length, 3);
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
function displayGoalTest(assert, description, fn) {
  var answerExpression = document.getElementById('answerExpression');
  while (answerExpression.firstChild) {
    answerExpression.removeChild(answerExpression.firstChild);
  }
  answerExpression.innerHTML = ''; // clear children

  fn();
}
