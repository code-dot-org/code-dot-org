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

  var validateTextElementContainer = function (element, items) {
    for (var i = 0; i < items.length; i++) {
      var expectedTextContent = items[i][0].replace(/ /g, '\u00A0\u00A0');
      assert.equal(element.childNodes[i].textContent, expectedTextContent);
      assert.equal(element.childNodes[i].getAttribute('class'), items[i][1], 'token #' + i);
    }
    assert.equal(element.childNodes.length, i);
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

    assert.equal(userExpression.childNodes.length, 3);

    // line 1: age = 17
    validateTextElementContainer(userExpression.childNodes[0], [
      ['age = ', null],
      ['17', null]
    ]);

    // line 2: age_in_months = (age * 12)
    validateTextElementContainer(userExpression.childNodes[1], [
      ['age_in_months = ', null],
      ['age', null],
      [' * ', null],
      ['12', null]
    ]);

    // line 3: age_in_months = 194
    validateTextElementContainer(userExpression.childNodes[2], [
      ['age_in_months', null],
      [' = ', null],
      ['204', null]
    ]);
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

    assert.equal(userExpression.childNodes.length, 3);

    // line 1: age = 10
    validateTextElementContainer(userExpression.childNodes[0], [
      ['age = ',  null],
      ['10',  null]
    ]);

    // line 2: age_in_months = age * 12
    validateTextElementContainer(userExpression.childNodes[1], [
      ['age_in_months = ',  null],
      ['age',  null],
      [' * ',  null],
      ['12',  null]
    ]);

    // line 3: age_in_months = 120
    validateTextElementContainer(userExpression.childNodes[2], [
      ['age_in_months',  null],
      [' = ',  null],
      ['120',  null]
    ]);
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

    // Normally this would happen when we call Calc.generateResults_, but
    // that replaces our userSet with workspace blocks, so we just manually
    // hack the failedInput
    Calc.__testonly__.appState.failedInput = [1];

    displayComplexUserExpressions();

    Calc.__testonly__.appState.failedInput = null;

    assert.equal(userExpression.childNodes.length, 3);

    // line 1: age = 1
    validateTextElementContainer(userExpression.childNodes[0], [
      ['age = ',  null],
      ['1',  null]
    ]);

    // line 2: age_in_months = 17 * 12
    validateTextElementContainer(userExpression.childNodes[1], [
      ['age_in_months = ',  null],
      ['17',  null],
      [' * ',  null],
      ['12',  null]
    ]);

    // line 3: age_in_months = 204
    validateTextElementContainer(userExpression.childNodes[2], [
      ['age_in_months',  null],
      [' = ',  null],
      ['204',  'errorToken'],
    ]);
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

    assert.equal(userExpression.childNodes.length, 3);

    // line 1: age = 10
    validateTextElementContainer(userExpression.childNodes[0], [
      ['age = ',  null],
      ['17',  null]
    ]);

    // line 2: age_in_months = age * 12
    validateTextElementContainer(userExpression.childNodes[1], [
      ['age_in_months2 = ',  null],
      ['age',  null],
      [' * ',  null],
      ['12',  null]
    ]);

    // line 3: age_in_months = 120
    validateTextElementContainer(userExpression.childNodes[2], [
      ['age_in_months2',  'errorToken'],
      [' = ',  null],
      ['204',  null]
    ]);
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

    assert.equal(userExpression.childNodes.length, 2);

    // line 1: f(i) = 4 / (4 - 4)
    validateTextElementContainer(userExpression.childNodes[0], [
      ['f(i) = ',  null],
      ['4',  null],
      [' / ',  null],
      ['(',  null],
      ['4',  null],
      [' - ',  null],
      ['4',  null],
      [')',  null]
    ]);


    // line 2: f(10)
    // Note that there's no = (result), because we have a divide by zero error
    validateTextElementContainer(userExpression.childNodes[1], [
      ['f',  null],
      ['(',  null],
      ['10',  null],
      [')',  null]
    ]);
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

    assert.equal(userExpression.childNodes.length, 2);

    // line 1: f(i) = 4 / (4 - 4)
    validateTextElementContainer(userExpression.childNodes[0], [
      ['f(i) = ',  null],
      ['4',  null],
      [' / ',  null],
      ['(',  null],
      ['4',  null],
      [' - ',  null],
      ['4',  null],
      [')',  null]
    ]);

    // line 2: f(10)
    // Note that there's no = (result), because we have a divide by zero error
    validateTextElementContainer(userExpression.childNodes[1], [
      ['f',  null],
      ['(',  null],
      ['10',  null],
      [')',  null]
    ]);
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

    assert.equal(userExpression.childNodes.length, 1);

    // line 1: 4 / (4 - 4)
    validateTextElementContainer(userExpression.childNodes[0], [
      ['4',  'errorToken'],
      [' / ',  'errorToken'],
      ['(',  'errorToken'],
      ['4',  'errorToken'],
      [' - ',  'errorToken'],
      ['4',  'errorToken'],
      [')',  'errorToken']
    ]);
  });

  displayComplexUserExpressionTest(assert, 'non repeating fraction', function () {
    // compute: 1 / 4
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('/', [1, 4])));
    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 1);

    // line 1: 1 / 4 = 0.25
    validateTextElementContainer(userExpression.childNodes[0], [
      ['1',  null],
      [' / ',  null],
      ['4',  null],
      [' = ',  null],
      ['0.25',  null]
    ]);
  });

  displayComplexUserExpressionTest(assert, 'repeating fraction', function () {
    // compute: 1 / 9
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('/', [1, 9])));
    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 1);

    // line 1: (1 / 9) = 0._1
    validateTextElementContainer(userExpression.childNodes[0], [
      ['1',  null],
      [' / ',  null],
      ['9',  null],
      [' = ',  null],
      ['0.1', null] // this line does account for repeating symbol
    ]);
    var g = userExpression.childNodes[0];
    var text = g.childNodes[4];
    assert.equal(text.childNodes.length, 2);
    assert.equal(text.childNodes[0].textContent, '0.');
    assert.equal(text.childNodes[1].textContent, '1');
    assert.equal(text.childNodes[1].getAttribute('style'), 'text-decoration: overline');
  });

  displayComplexUserExpressionTest(assert, 'function called with expression', function () {
    // f(x) = x
    // f(1 + 1)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [
      new ExpressionNode('+', [1, 1])
    ])));

    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    // line 1: f(x) = x
    validateTextElementContainer(userExpression.childNodes[0], [
      ['f(x) = ',  null],
      ['x',  null],
    ]);

    // line 2: f(1 + 1) = 2
    validateTextElementContainer(userExpression.childNodes[1], [
      ['f',  null],
      ['(',  null],
      ['1',  null],
      [' + ',  null],
      ['1',  null],
      [')',  null],
      [' = ',  null],
      ['2',  null],
    ]);
  });

  displayComplexUserExpressionTest(assert, 'pow block', function () {
    // pow(2, 3)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('pow', [2, 3])));

    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    validateTextElementContainer(userExpression.childNodes[0], [
      ['2', null],
      [' ^ ', null],
      ['3', null],
      [' = ', null],
      ['8', null]
    ]);
  });

  displayComplexUserExpressionTest(assert, 'sqr block', function () {
    // sqr(2)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('sqr', [2])));

    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    validateTextElementContainer(userExpression.childNodes[0], [
      ['2', null],
      [' ^ 2', null],
      [' = ', null],
      ['4', null]
    ]);
  });

  displayComplexUserExpressionTest(assert, 'sqrt block', function () {
    // sqrt(4)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('sqrt', [4])));

    var targetSet = new EquationSet(); // simulate free play
    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    validateTextElementContainer(userExpression.childNodes[0], [
      ['sqrt', null],
      ['(', null],
      ['4', null],
      [')', null],
      [' = ', null],
      ['2', null]
    ]);
  });

  displayComplexUserExpressionTest(assert, 'error when varying function input', function () {
    // f(x) = x
    // compute: f(5)
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [5])));

    // f(x) = 5
    // compute: f(5)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode(5)));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [5])));

    setEquationSets(targetSet, userSet);

    // Normally this would happen when we call Calc.generateResults_, but
    // that replaces our userSet with workspace blocks, so we just manually
    // hack the failedInput
    Calc.__testonly__.appState.failedInput = [1];

    displayComplexUserExpressions();

    Calc.__testonly__.appState.failedInput = null;

    assert.equal(userExpression.childNodes.length, 3);

    validateTextElementContainer(userExpression.childNodes[0], [
      ['f(x) = ', null],
      ['5', null]
    ]);

    validateTextElementContainer(userExpression.childNodes[1], [
      ['f', null],
      ['(', null],
      ['5', null],
      [')', null],
      [' = ', null],
      ['5', null]
    ]);

    validateTextElementContainer(userExpression.childNodes[2], [
      ['f', null],
      ['(', null],
      ['1', null],
      [')', null],
      [' = ', null],
      ['5', 'errorToken']
    ]);
  });

  displayComplexUserExpressionTest(assert, 'simple target, computesFunctionCall user expression', function () {
    // compute: 1 + 2
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode('+', [1, 2])));

    // f(x) = x
    // compute: f(3)
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation('f', ['x'], new ExpressionNode('x')));
    userSet.addEquation_(new Equation(null, [], new ExpressionNode('f', [3])));

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 2);

    validateTextElementContainer(userExpression.childNodes[0], [
      ['f(x) = ', null],
      ['x', null]
    ]);

    validateTextElementContainer(userExpression.childNodes[1], [
      ['f', 'errorToken'],
      ['(', 'errorToken'],
      ['3', 'errorToken'],
      [')', 'errorToken'],
      [' = ', null],
      ['3', null]
    ]);
  });


  displayComplexUserExpressionTest(assert, 'target hasVariablesOrFunctions and user does not', function () {
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

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 1);
    validateTextElementContainer(userExpression.childNodes[0], [
      ['1', 'errorToken'],
      [' + ', null],
      ['2', 'errorToken'],
      [' = ', null],
      ['3', null]
    ]);
  });

  displayComplexUserExpressionTest(assert, 'target is single number', function () {
    // compute: 5
    var targetSet = new EquationSet();
    targetSet.addEquation_(new Equation(null, [], new ExpressionNode(5)));

    // compute: 4
    var userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode(4)));

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 1);
    validateTextElementContainer(userExpression.childNodes[0], [
      ['4', 'errorToken']
    ]);

    // compute: 5
    userSet = new EquationSet();
    userSet.addEquation_(new Equation(null, [], new ExpressionNode(5)));

    setEquationSets(targetSet, userSet);

    displayComplexUserExpressions();

    assert.equal(userExpression.childNodes.length, 1);
    validateTextElementContainer(userExpression.childNodes[0], [
      ['5', null]
    ]);
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
