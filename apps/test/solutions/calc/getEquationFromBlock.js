var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');
var studioApp = require('@cdo/apps/StudioApp').singleton;
var EquationSet = require('@cdo/apps/calc/equationSet');
var Equation = require('@cdo/apps//calc/equation.js');
var ExpressionNode = require('@cdo/apps/calc/expressionNode');

/**
 * This is a little bit strange. I want to test getEquationFromBlock, which
 * depends on the existence of Blockly blocks. Rather than hack together a new
 * system to load Blockly in a node environment, I take advantage of the fact
 * that we already have this for level tests.
 * I'm running a bunch of validation using the blockSpace after the run is
 * complete (via customValidation), and don't really care about the result of
 * actually running.
 */

var getEquationFromBlock = EquationSet.getEquationFromBlock;

/**
 * Load the blocks into the blockSpace, assert that there's only one top block,
 * then generate an equation from that block. Validate that the equation matches
 * what we expect
 * @param assert Our assertion object
 * @param {string} blockXml Xml to generate blocks for
 * @param {Equation} expectedEquation
 * @param {number} blockIndex Index into getTopBlocks() of block we're interested in
 */
function validateGeneratedEquation(assert, blockXml, expectedEquation, blockIndex) {
  blockIndex = blockIndex || 0;
  // Clear existing blocks
  Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) {
    // use b.blockSpace as an indicator for whether block has already
    // been disposed
    if (b.blockSpace) {
      b.dispose();
    }
  });

  studioApp.loadBlocks(blockXml);

  if (blockIndex === 0) {
    assert.equal(Blockly.mainBlockSpace.getTopBlocks().length, 1);
  } else {
    assert(Blockly.mainBlockSpace.getTopBlocks().length > blockIndex,
      'actual: ' + Blockly.mainBlockSpace.getTopBlocks().length);
  }
  var block = Blockly.mainBlockSpace.getTopBlocks()[blockIndex];
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
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      // Run all validation in a single test to avoid the overhead of new node
      // processes
      customValidator: function (assert) {
        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          new Equation(null, [], new ExpressionNode('+', [1, 2]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_minus', [4, 3]),
          new Equation(null, [], new ExpressionNode('-', [4, 3]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_times', [5, 6]),
          new Equation(null, [], new ExpressionNode('*', [5, 6]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_dividedby', [7, 8]),
          new Equation(null, [], new ExpressionNode('/', [7, 8]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_pow', [2, 4]),
          new Equation(null, [], new ExpressionNode('pow', [2, 4]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_sqrt', [4]),
          new Equation(null, [], new ExpressionNode('sqrt', [4]))
        );

        validateGeneratedEquation(assert,
          blockUtils.calcBlockXml('functional_squared', [2]),
          new Equation(null, [], new ExpressionNode('sqr', [2]))
        );

        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1} ),
          new Equation(null, [], new ExpressionNode(1))
        );

        // float instead of int
        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1.2} ),
          new Equation(null, [], new ExpressionNode(1.2))
        );

        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number_dropdown', null, {NUM: 1} ),
          new Equation(null, [], new ExpressionNode(1))
        );

        // math_number with ???
        validateGeneratedEquation(assert,
          blockUtils.mathBlockXml('functional_math_number_dropdown', null, {NUM: '???'} ),
          new Equation(null, [], new ExpressionNode(0))
        );

        // Equation generation depends on the function call and definition both
        // being in the workspace
        var blockIndex = 1;
        var functional_call = '' +
          // f(x) = x
          '<block type="functional_definition" inline="false" uservisible="false">' +
          '  <mutation>' +
          '    <arg name="x" type="Number"/>' +
          '    <outputtype>Number</outputtype>' +
          '  </mutation>' +
          '  <title name="NAME">f</title>' +
          '  <functional_input name="STACK">' +
               blockUtils.calcBlockGetVar('x') +
          '  </functional_input>' +
          '</block>' +
          // f(0)
          '<block type="functional_call" inline="false" uservisible="false">' +
          '  <mutation name="f">' +
          '    <arg name="x" type="Number"/>' +
          '  </mutation>' +
          '  <functional_input name="ARG0">' +
          '    <block type="functional_math_number_dropdown" uservisible="false">' +
          '      <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">0</title>' +
          '    </block>' +
          '  </functional_input>' +
          '</block>';
        validateGeneratedEquation(assert,
          functional_call,
          new Equation(null, [], new ExpressionNode('f', [0])),
          blockIndex
        );

        var functional_definition = '' +
          '<block type="functional_definition" inline="false" uservisible="false">' +
          '  <mutation>' +
          '    <arg name="x" type="Number"/>' +
          '    <outputtype>Number</outputtype>' +
          '  </mutation>' +
          '  <title name="NAME">f</title>' +
          '  <functional_input name="STACK">' +
               blockUtils.calcBlockGetVar('x') +
          '  </functional_input>' +
          '</block>';
        validateGeneratedEquation(assert,
          functional_definition,
          new Equation('f', ['x'], new ExpressionNode('x'))
        );

        var functional_definition_two_args = '' +
          '<block type="functional_definition" inline="false" uservisible="false">' +
          '  <mutation>' +
          '    <arg name="x" type="Number"/>' +
          '    <arg name="y" type="Number"/>' +
          '    <outputtype>Number</outputtype>' +
          '  </mutation>' +
          '  <title name="NAME">f</title>' +
          '  <functional_input name="STACK">' +
               blockUtils.calcBlockXml('functional_plus', ['x', 'y']) +
          '  </functional_input>' +
          '</block>';
        validateGeneratedEquation(assert,
          functional_definition_two_args,
          new Equation('f', ['x', 'y'], new ExpressionNode('+', ['x', 'y']))
        );

        // functional_parameters_get
        validateGeneratedEquation(assert,
          blockUtils.calcBlockGetVar('x'),
          new Equation(null, [], new ExpressionNode('x'))
        );

        var functional_example = '' +
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
          functional_example,
          null
        );

        return true;
      },
      xml: ''
    }
  ]
};
