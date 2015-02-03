var testUtils = require('../../util/testUtils');
var ResultType = require(testUtils.buildPath('constants.js')).ResultType;
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));
var studioApp = require(testUtils.buildPath('StudioApp')).singleton;
var EquationSet = require(testUtils.buildPath('calc/equationSet'));
var Equation = EquationSet.Equation;
var ExpressionNode = require(testUtils.buildPath('calc/expressionNode'));

/**
 * This is a little bit strange. I want to test getEquationFromBlock, which
 * depends on the existence of Blockly blocks. Rather than hack together a new
 * system to load Blockly in a node environment, I take advantage of the fact
 * that we already have this for level tests.
 * I'm running a bunch of validation using the blockSpace after the run is
 * complete (via customValidation), and don't really care about the result of
 * actually running.
 */

var getEquationFromBlock = EquationSet.__testonly__.getEquationFromBlock;

function validateGeneratedEquation(assert, blockXml, expectedEquation) {
  // Clear existing blocks
  Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) {
    b.dispose();
  });

  studioApp.loadBlocks(blockXml);

  assert.equal(Blockly.mainBlockSpace.getTopBlocks().length, 1);
  var block = Blockly.mainBlockSpace.getTopBlocks()[0];
  var equation = getEquationFromBlock(block);

  if (expectedEquation === null) {
    assert.equal(equation, null);
  } else {
    assert.equal(equation.name, expectedEquation.name);
    assert(equation.expression.isIdenticalTo(expectedEquation.expression));
  }
}


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
      description: "getEquationFromBlock",
      expected: {
        result: ResultType.SUCCESS,
        testResult: TestResults.FREE_PLAY
      },
      // Run all validation in a single test to avoid the overhead of new node
      // processes
      customValidation: function (assert) {
        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          new Equation(null, new ExpressionNode('+', [1, 2]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_minus', [4, 3]),
          new Equation(null, new ExpressionNode('-', [4, 3]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_times', [5, 6]),
          new Equation(null, new ExpressionNode('*', [5, 6]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_dividedby', [7, 8]),
          new Equation(null, new ExpressionNode('/', [7, 8]))
        );

        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1 } ),
          new Equation(null, new ExpressionNode(1))
        );

        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number_dropdown', null, { NUM: 1 } ),
          new Equation(null, new ExpressionNode(1))
        );

        // math_number with ???
        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number_dropdown', null, { NUM: '???' } ),
          new Equation(null, new ExpressionNode(0))
        );

        var functional_definition = '' +
          '<block type="functional_definition" inline="false" uservisible="false">' +
          '  <mutation>' +
          '    <arg name="x" type="Number"/>' +
          '    <outputtype>Number</outputtype>' +
          '  </mutation>' +
          '  <title name="NAME">f</title>' +
          '  <functional_input name="STACK">' +
          '    <block type="functional_parameters_get" uservisible="false">' +
          '      <mutation>' +
          '        <outputtype>Number</outputtype>' +
          '      </mutation>' +
          '      <title name="VAR">x</title>' +
          '    </block>' +
          '  </functional_input>' +
          '</block>';
        validateGeneratedEquation(assert,
          functional_definition,
          // TODO - one with two args?
          new Equation('f(x)', new ExpressionNode('x'))
        );

        var parameters_get = '' +
          '<block type="functional_parameters_get" uservisible="false">' +
          '  <mutation>' +
          '    <outputtype>Number</outputtype>' +
          '  </mutation>' +
          '  <title name="VAR">x</title>' +
          '</block>';
        validateGeneratedEquation(assert,
          parameters_get,
          new Equation(null, new ExpressionNode('x'))
        );

        var exampleXml = '' +
          '<block type="functional_example" inline="false" uservisible="false">' +
          '  <functional_input name="ACTUAL">' +
          '    <block type="functional_call" inline="false" uservisible="false">' +
          '      <mutation name="x">' +
          '        <arg name="x" type="Number"/>' +
          '      </mutation>' +
          '      <functional_input name="ARG0">' +
          '        <block type="functional_math_number_dropdown" uservisible="false">' +
          '          <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">0</title>' +
          '        </block>' +
          '      </functional_input>' +
          '    </block>' +
          '  </functional_input>' +
          '  <functional_input name="EXPECTED">' +
          '    <block type="functional_math_number_dropdown" uservisible="false">' +
          '      <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">0</title>' +
          '    </block>' +
          '  </functional_input>' +
          '</block>';
        // I expect this equation name to change eventually, but this gets us unblocked
        validateGeneratedEquation(assert,
          exampleXml,
          null
        );
      },
      xml: ''
    }
  ]
};
